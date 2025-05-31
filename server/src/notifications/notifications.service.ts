import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification, NotificationType } from '../entities/Notification';
import { User } from '../entities/User';
import { Workout } from '../entities/Workout';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cron } from '@nestjs/schedule';
import { addHours } from 'date-fns';

// DTO для создания уведомления
export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedItemId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    // Задача будет запускаться автоматически через декоратор @Cron
  }

  // CRON задача для проверки тренировок и отправки напоминаний
  @Cron('*/5 * * * *', { name: 'checkUpcomingWorkouts' })
  async checkUpcomingWorkouts() {
    try {
      this.logger.log('Проверка предстоящих тренировок для напоминаний...');
      
      // Получаем всех пользователей с включенными напоминаниями о тренировках
      const users = await this.userRepository.find({
        where: {
          // Фильтр по включенным уведомлениям реализовать сложно через TypeORM с JSON полями
          // Поэтому фильтруем после получения
        },
      });
      
      const now = new Date();
      // Ищем тренировки, которые начнутся в ближайшие 2 часа
      const maxTime = addHours(now, 2);
      
      for (const user of users) {
        // Пропускаем пользователей у которых выключены уведомления
        if (!user.settings?.notifications?.workoutReminders) {
          continue;
        }
        
        const reminderTime = user.settings.notifications.reminderTime || 30; // Время в минутах
        
        // Получаем тренировки пользователя на ближайшие 2 часа
        const workouts = await this.workoutRepository.find({
          where: {
            userId: user.id,
            scheduledFor: LessThan(maxTime),
            // Добавьте условие чтобы не уведомлять о прошедших тренировках
            // и условие для фильтрации тренировок, о которых уже было оповещение
          },
          order: {
            scheduledFor: 'ASC',
          },
        });
        
        // Для каждой тренировки проверяем, нужно ли отправлять уведомление
        for (const workout of workouts) {
          if (!workout.scheduledFor) continue;
          
          const workoutTime = new Date(workout.scheduledFor);
          const reminderThreshold = new Date(
            workoutTime.getTime() - reminderTime * 60 * 1000
          );
          
          // Если пора отправлять уведомление
          if (now >= reminderThreshold && now <= workoutTime) {
            // Проверяем, не отправляли ли мы уже уведомление для этой тренировки
            const existingNotification = await this.notificationRepository.findOne({
              where: {
                userId: user.id,
                type: NotificationType.WORKOUT_REMINDER,
                relatedItemId: workout.id,
              },
            });
            
            if (!existingNotification) {
              await this.createNotification({
                userId: user.id,
                title: 'Скоро начнется тренировка',
                message: `Тренировка "${workout.name}" начнется через ${reminderTime} минут`,
                type: NotificationType.WORKOUT_REMINDER,
                relatedItemId: workout.id,
              });
              this.logger.log(`Отправлено напоминание пользователю ${user.id} о тренировке ${workout.id}`);
            }
          }
        }
      }
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : 'Стек недоступен';
      this.logger.error('Ошибка при проверке предстоящих тренировок', errorStack);
    }
  }

  // Создание нового уведомления
  async createNotification(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: createDto.userId,
      title: createDto.title,
      message: createDto.message,
      type: createDto.type,
      relatedItemId: createDto.relatedItemId,
      read: false,
    });
    
    return this.notificationRepository.save(notification);
  }

  // Создание системного уведомления для всех пользователей
  async createSystemNotificationForAll(title: string, message: string, relatedItemId?: string): Promise<void> {
    try {
      // Получаем всех пользователей
      const users = await this.userRepository.find();
      
      // Создаем уведомление для каждого пользователя
      for (const user of users) {
        // Проверяем настройки уведомлений пользователя, если они существуют
        if (relatedItemId?.startsWith('workout-') || relatedItemId?.startsWith('program-')) {
          // Это уведомление о новом контенте, проверяем настройки
          if (!user.settings?.notifications?.newContentNotifications) {
            continue; // Пропускаем, если уведомления о новом контенте выключены
          }
        }
        
        await this.createNotification({
          userId: user.id,
          title,
          message,
          type: NotificationType.SYSTEM,
          relatedItemId,
        });
      }
      
      this.logger.log(`Создано системное уведомление для всех пользователей: ${title}`);
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : 'Стек недоступен';
      this.logger.error('Ошибка при создании системного уведомления', errorStack);
    }
  }

  // Создание уведомления о новой общедоступной тренировке
  async notifyNewPublicWorkout(workoutId: string, workoutName: string): Promise<void> {
    await this.createSystemNotificationForAll(
      'Новая тренировка доступна',
      `Добавлена новая общедоступная тренировка: "${workoutName}"`,
      `workout-${workoutId}`
    );
  }

  // Создание уведомления о новой программе тренировок
  async notifyNewProgram(programId: string, programName: string): Promise<void> {
    await this.createSystemNotificationForAll(
      'Новая программа тренировок доступна',
      `В систему добавлена новая программа тренировок: "${programName}". Просмотрите подробности в разделе Программы.`,
      `program-${programId}`
    );
  }

  // Создание уведомления о новом достижении пользователя
  async notifyAchievement(userId: string, achievementName: string, points: number): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Поздравляем с новым достижением!',
      message: `Вы получили достижение "${achievementName}" и заработали +${points} очков. Проверьте раздел Достижения для получения подробной информации.`,
      type: NotificationType.ACHIEVEMENT,
      relatedItemId: `achievement-${achievementName}`
    });
  }

  // Создание уведомления о завершенной тренировке
  async notifyWorkoutCompleted(userId: string, workoutName: string, completionPercentage: number): Promise<void> {
    await this.createNotification({
      userId,
      title: 'Тренировка завершена',
      message: `Вы завершили тренировку "${workoutName}" с результатом ${completionPercentage.toFixed(0)}%. Отличная работа!`,
      type: NotificationType.WORKOUT_COMPLETED,
      relatedItemId: `workout-completed-${new Date().getTime()}`
    });
  }

  // Получение всех уведомлений пользователя
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  // Получение непрочитанных уведомлений пользователя
  async getUserUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' }
    });
  }

  // Отметка уведомления как прочитанного
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (!notification) {
      throw new Error('Уведомление не найдено');
    }
    
    notification.read = true;
    return this.notificationRepository.save(notification);
  }

  // Отметка всех уведомлений пользователя как прочитанных
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update()
      .set({ read: true })
      .where('userId = :userId', { userId })
      .execute();
  }

  // Удаление уведомления
  async deleteNotification(id: string): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  // Удаление всех уведомлений пользователя
  async deleteAllUserNotifications(userId: string): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }

  // Очистка старых уведомлений (удаление уведомлений старше 30 дней)
  async cleanupOldNotifications(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date: thirtyDaysAgo })
      .execute();
  }

  // Метод для автоматического создания тестовых уведомлений для демонстрации функциональности
  async createTestNotificationForWorkout(workoutId: string, userId: string, workoutName: string): Promise<void> {
    try {
      // Создаем уведомление о новой тренировке
      await this.createNotification({
        userId,
        title: 'Новая тренировка создана',
        message: `Тренировка "${workoutName}" успешно создана и добавлена в ваш график тренировок. Посмотрите детали в разделе Тренировки.`,
        type: NotificationType.WORKOUT_REMINDER,
        relatedItemId: workoutId,
      });
      
      // Создаем уведомление о напоминании тренировки (если тренировка запланирована)
      const workout = await this.workoutRepository.findOne({ where: { id: workoutId } });
      if (workout && workout.scheduledFor) {
        const scheduledDate = new Date(workout.scheduledFor);
        
        if (scheduledDate > new Date()) {
          await this.createNotification({
            userId,
            title: 'Тренировка запланирована',
            message: `Не забудьте о тренировке "${workoutName}" ${scheduledDate.toLocaleDateString()} в ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Установлено автоматическое напоминание.`,
            type: NotificationType.WORKOUT_REMINDER,
            relatedItemId: `scheduled-${workoutId}`,
          });
        }
      }
      
      this.logger.log(`Созданы уведомления для тренировки ${workoutId}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      const errorStack = error instanceof Error ? error.stack : 'Стек недоступен';
      this.logger.error(`Ошибка при создании уведомлений: ${errorMessage}`, errorStack);
    }
  }
} 
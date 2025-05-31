import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ScheduledWorkout } from '../entities/ScheduledWorkout';
import { Workout, WorkoutStatus } from '../entities/Workout';
import { User } from '../entities/User';

@Injectable()
export class ScheduledWorkoutsService {
  private readonly logger = new Logger(ScheduledWorkoutsService.name);
  
  constructor(
    @InjectRepository(ScheduledWorkout)
    private scheduledWorkoutsRepository: Repository<ScheduledWorkout>,
    @InjectRepository(Workout)
    private workoutsRepository: Repository<Workout>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<ScheduledWorkout[]> {
    return this.scheduledWorkoutsRepository.find({ 
      relations: ['workout', 'user'] 
    });
  }

  async findOne(id: string): Promise<ScheduledWorkout> {
    const scheduledWorkout = await this.scheduledWorkoutsRepository.findOne({ 
      where: { id }, 
      relations: ['workout', 'user'] 
    });
    
    if (!scheduledWorkout) {
      throw new NotFoundException(`Scheduled workout with ID ${id} not found`);
    }
    
    return scheduledWorkout;
  }

  async findByUser(userId: string): Promise<ScheduledWorkout[]> {
    return this.scheduledWorkoutsRepository.find({ 
      where: { userId }, 
      relations: ['workout'] 
    });
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<ScheduledWorkout[]> {
    this.logger.debug(`Поиск тренировок в диапазоне с ${startDate} по ${endDate} для пользователя ${userId}`);
    
    const workouts = await this.scheduledWorkoutsRepository.find({ 
      where: { 
        userId,
        scheduledDate: Between(startDate, endDate) 
      }, 
      relations: ['workout'],
      order: {
        scheduledDate: 'ASC',
        scheduledTime: 'ASC'
      }
    });
    
    this.logger.debug(`Найдено ${workouts.length} тренировок в диапазоне. Выводим первые 3 для отладки:`);
    
    // Выводим подробную информацию о первых 3 тренировках для отладки
    workouts.slice(0, 3).forEach((workout, index) => {
      this.logger.debug(`Тренировка ${index + 1}: id=${workout.id}, workoutId=${workout.workoutId}, programId=${workout.programId || 'нет'}, дата=${workout.scheduledDate}, время=${workout.scheduledTime}`);
    });
    
    // Выводим информацию о тренировках с programId
    const programWorkouts = workouts.filter(w => w.programId);
    this.logger.debug(`Из них ${programWorkouts.length} тренировок принадлежат программам`);
    
    programWorkouts.slice(0, 3).forEach((workout, index) => {
      this.logger.debug(`Программная тренировка ${index + 1}: id=${workout.id}, programId=${workout.programId}`);
    });
    
    return workouts;
  }

  async create(data: Partial<ScheduledWorkout>): Promise<ScheduledWorkout> {
    try {
      this.logger.debug(`Создание запланированной тренировки. ID тренировки: ${data.workoutId}, тип: ${typeof data.workoutId}, programId: ${data.programId || 'не указан'}`);
      
      // Проверяем, сколько тренировок уже запланировано на эту дату
      const existingWorkouts = await this.scheduledWorkoutsRepository.find({
        where: {
          userId: data.userId,
          scheduledDate: data.scheduledDate,
        }
      });

      // Ограничиваем количество тренировок до 2 в день
      if (existingWorkouts.length >= 2) {
        this.logger.warn(`Превышено максимальное количество тренировок на день (${data.scheduledDate}) для пользователя ${data.userId}`);
        throw new BadRequestException('На этот день уже запланировано максимальное количество тренировок (2)');
      }
      
      // Преобразуем числовой ID в формат UUID
      if (typeof data.workoutId === 'string') {
        // Если это числовой ID в формате строки, ищем тренировку напрямую
        if (/^\d+$/.test(data.workoutId)) {
          const workoutByNumeric = await this.workoutsRepository.findOne({ 
            where: { id: data.workoutId } 
          });
          
          if (workoutByNumeric) {
            this.logger.debug(`Найдена тренировка с числовым ID: ${data.workoutId}`);
          } else {
            // Если тренировка не найдена, пробуем сгенерировать UUID
            const uuidWorkoutId = `00000000-0000-0000-0000-${data.workoutId.padStart(12, '0')}`;
            const workoutByUuid = await this.workoutsRepository.findOne({ 
              where: { id: uuidWorkoutId } 
            });
            
            if (workoutByUuid) {
              this.logger.debug(`Найдена тренировка с UUID: ${uuidWorkoutId}`);
              data.workoutId = uuidWorkoutId;
            }
          }
        } 
        // Если это UUID в формате "00000000-0000-0000-0000-XXXXXXXXXXXX", ничего не меняем
        else if (data.workoutId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          this.logger.debug(`ID тренировки уже в формате UUID: ${data.workoutId}`);
        }
        // Любой другой формат - пытаемся преобразовать в UUID
        else {
          try {
            // Извлекаем числовой ID из "00000000-0000-0000-0000-00000000000X"
            if (data.workoutId.startsWith('00000000-0000-0000-0000-')) {
              const numericId = data.workoutId.substring('00000000-0000-0000-0000-'.length);
              if (/^0*\d+$/.test(numericId)) {
                const actualId = parseInt(numericId, 10).toString();
                // Ищем тренировку по числовому ID
                const workoutByNumeric = await this.workoutsRepository.findOne({ 
                  where: { id: actualId } 
                });
                
                if (workoutByNumeric) {
                  this.logger.debug(`Преобразован ID из UUID в числовой: ${actualId}`);
                  data.workoutId = actualId;
                }
              }
            }
          } catch (error: any) {
            this.logger.error(`Ошибка при попытке преобразования ID: ${error.message}`);
          }
        }
      }
      
      // Важно: сохраняем programId, если он есть
      if (data.programId) {
        this.logger.debug(`Сохраняем тренировку с programId: ${data.programId}`);
      }
      
      this.logger.debug(`Итоговый ID тренировки: ${data.workoutId}`);
      
      const workout = await this.workoutsRepository.findOne({ where: { id: data.workoutId } });
      if (!workout) {
        this.logger.error(`Тренировка с ID ${data.workoutId} не найдена`);
        throw new NotFoundException(`Workout with ID ${data.workoutId} not found`);
      }
      
      const user = await this.usersRepository.findOne({ where: { id: data.userId } });
      if (!user) {
        this.logger.error(`Пользователь с ID ${data.userId} не найден`);
        throw new NotFoundException(`User with ID ${data.userId} not found`);
      }
      
      const scheduledWorkout = this.scheduledWorkoutsRepository.create(data);
      const savedWorkout = await this.scheduledWorkoutsRepository.save(scheduledWorkout);
      
      this.logger.debug(`Запланированная тренировка создана успешно: ID=${savedWorkout.id}, programId=${savedWorkout.programId || 'не указан'}`);
      
      return savedWorkout;
    } catch (error: any) {
      this.logger.error(`Ошибка при создании запланированной тренировки: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, data: Partial<ScheduledWorkout>): Promise<ScheduledWorkout> {
    const scheduledWorkout = await this.findOne(id);
    
    // Обновляем только те поля, которые переданы в data
    Object.assign(scheduledWorkout, data);
    
    return this.scheduledWorkoutsRepository.save(scheduledWorkout);
  }

  async markCompleted(id: string): Promise<ScheduledWorkout> {
    this.logger.log(`Отметка тренировки как выполненной: ${id}`);
    
    // Получаем запланированную тренировку
    const scheduledWorkout = await this.findOne(id);
    
    // Если тренировка уже отмечена как выполненная, просто возвращаем её
    if (scheduledWorkout.completed) {
      this.logger.log(`Тренировка ${id} уже отмечена как выполненная`);
      return scheduledWorkout;
    }
    
    // Получаем связанную тренировку с упражнениями
    const workout = await this.workoutsRepository.findOne({ 
      where: { id: scheduledWorkout.workoutId },
      relations: ['workoutExercises', 'workoutExercises.exercise']
    });
    
    if (!workout) {
      this.logger.error(`Тренировка с ID ${scheduledWorkout.workoutId} не найдена`);
      throw new NotFoundException(`Workout with ID ${scheduledWorkout.workoutId} not found`);
    }
    
    this.logger.log(`Создание записи в истории тренировок для пользователя: ${scheduledWorkout.userId}`);
    
    try {
      // Отмечаем как выполненную
      scheduledWorkout.completed = true;
      
      // Создаем запись в истории тренировок (с учетом всех необходимых полей)
      const workoutHistoryData = {
        name: workout.name,
        description: workout.description,
        type: workout.type,
        durationMinutes: workout.durationMinutes || 0,
        caloriesBurned: workout.caloriesBurned || 0,
        scheduledDate: new Date(),
        userId: scheduledWorkout.userId,
        completionPercentage: 100,
        status: WorkoutStatus.COMPLETED
      } as any;
      
      // Добавляем привязку к программе, если тренировка из программы
      if (scheduledWorkout.programId) {
        workoutHistoryData.programId = scheduledWorkout.programId;
        
        // Получаем дополнительную информацию о программе
        try {
          // Получаем программу с ее тренировками
          const programProgressResult = await this.workoutsRepository.manager.query(
            `SELECT * FROM program_progress WHERE id = $1 AND "userId" = $2`, 
            [scheduledWorkout.programId, scheduledWorkout.userId]
          );
          
          if (programProgressResult && programProgressResult.length > 0) {
            const programProgress = programProgressResult[0];
            
            // Получаем саму программу
            const programResult = await this.workoutsRepository.manager.query(
              `SELECT * FROM training_program WHERE id = $1`,
              [programProgress.programId]
            );
            
            if (programResult && programResult.length > 0) {
              const program = programResult[0];
              workoutHistoryData.programName = program.name;
              
              // Находим тренировку в программе
              const programWorkoutsResult = await this.workoutsRepository.manager.query(
                `SELECT * FROM program_workout WHERE "programId" = $1 AND "workoutId" = $2`,
                [program.id, scheduledWorkout.workoutId]
              );
              
              if (programWorkoutsResult && programWorkoutsResult.length > 0) {
                const programWorkout = programWorkoutsResult[0];
                workoutHistoryData.programDay = programWorkout.dayOfProgram;
                
                // Если упражнения отсутствуют, пробуем найти их в программе
                if (!workout.workoutExercises || workout.workoutExercises.length === 0) {
                  this.logger.log(`Тренировка ${workout.id} из программы ${scheduledWorkout.programId} не содержит упражнений. Пытаемся найти упражнения в программе.`);
                  
                  // Загружаем тренировку из программы с упражнениями
                  const originalWorkout = await this.workoutsRepository.findOne({
                    where: { id: programWorkout.workoutId },
                    relations: ['workoutExercises', 'workoutExercises.exercise']
                  });
                  
                  if (originalWorkout && originalWorkout.workoutExercises && originalWorkout.workoutExercises.length > 0) {
                    this.logger.log(`Найдено ${originalWorkout.workoutExercises.length} упражнений в оригинальной тренировке программы`);
                    workout.workoutExercises = originalWorkout.workoutExercises;
                  }
                }
              }
            }
          }
        } catch (programError: any) {
          this.logger.error(`Ошибка при получении информации о программе: ${programError.message}`, programError.stack);
          // Продолжаем процесс даже если не получили дополнительную информацию
        }
      }
      
      // Создаем сначала объект истории
      const workoutHistory = this.workoutsRepository.create(workoutHistoryData);
      
      // Сохраняем в историю
      const result = await this.workoutsRepository.save(workoutHistory);
      const savedHistory = Array.isArray(result) ? result[0] : result;
      this.logger.log(`Запись в истории тренировок создана: ${savedHistory.id}`);
      
      // Копируем упражнения из оригинальной тренировки в историческую запись
      if (workout.workoutExercises && workout.workoutExercises.length > 0) {
        this.logger.log(`Копирование ${workout.workoutExercises.length} упражнений из оригинальной тренировки`);
        
        try {
          for (const exercise of workout.workoutExercises) {
            // Создаем копию упражнения для истории тренировки
            const workoutExerciseData = {
              workoutId: savedHistory.id,
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              durationSeconds: exercise.durationSeconds,
              order: exercise.order,
              completed: true // Все упражнения отмечаем как выполненными
            };
            
            await this.workoutsRepository.manager.query(
              `INSERT INTO workout_exercises
               (workoutId, exerciseId, sets, reps, weight, durationSeconds, "order", completed) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                savedHistory.id,
                exercise.exerciseId,
                exercise.sets || 3,
                exercise.reps || 10,
                exercise.weight || 0,
                exercise.durationSeconds || 0,
                exercise.order || 0,
                true
              ]
            );
          }
          
          this.logger.log(`Упражнения успешно скопированы в завершенную тренировку`);
        } catch (exerciseError: any) {
          this.logger.error(`Ошибка при копировании упражнений: ${exerciseError.message}`, exerciseError.stack);
          // Даже если не удалось скопировать упражнения, продолжаем процесс
          // отметки тренировки как выполненной
        }
      } else {
        this.logger.warn(`У тренировки ${workout.id} нет упражнений для копирования`);
      }
      
      // Сохраняем обновленную запланированную тренировку
      const updatedScheduledWorkout = await this.scheduledWorkoutsRepository.save(scheduledWorkout);
      this.logger.log(`Тренировка ${id} отмечена как выполненная`);
      
      return updatedScheduledWorkout;
    } catch (error: any) {
      this.logger.error(`Ошибка при отметке тренировки как выполненной: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const scheduledWorkout = await this.findOne(id);
    await this.scheduledWorkoutsRepository.remove(scheduledWorkout);
  }
} 
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout, WorkoutType, WorkoutStatus } from '../entities/Workout';
import { User } from '../entities/User';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutExercise } from '../entities/WorkoutExercise';
import { Not } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { AchievementsService } from '../achievements/achievements.service';

// Интерфейс для активной тренировки
interface ActiveWorkout {
    id: string;
    workoutId: string;
    userId: string;
    startTime: Date;
}

// Интерфейс для прогресса тренировки
interface WorkoutProgress {
    id?: string;
    workoutId: string;
    userId: string;
    date: string;
    completedExercises: string[];
    completionPercentage: number;
}

@Injectable()
export class WorkoutsService {
    private readonly logger = new Logger(WorkoutsService.name);
    
    // Временное хранение активных тренировок (в реальном приложении должно быть в БД)
    private activeWorkouts: ActiveWorkout[] = [];
    // Временное хранение прогресса тренировок (в реальном приложении должно быть в БД)
    private workoutProgress: WorkoutProgress[] = [];

    constructor(
        @InjectRepository(Workout)
        private workoutRepository: Repository<Workout>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(WorkoutExercise)
        private workoutExerciseRepository: Repository<WorkoutExercise>,
        private notificationsService: NotificationsService,
        private achievementsService: AchievementsService
    ) {}

    async create(createWorkoutDto: CreateWorkoutDto, userId: string) {
        this.logger.log(`Создание новой тренировки для пользователя ${userId}`);
        this.logger.debug(`Данные тренировки: ${JSON.stringify(createWorkoutDto)}`);

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        const workout = this.workoutRepository.create({
            name: createWorkoutDto.name,
            description: createWorkoutDto.description,
            type: createWorkoutDto.type as WorkoutType,
            status: WorkoutStatus.ACTIVE,
            durationMinutes: createWorkoutDto.duration,
            caloriesBurned: createWorkoutDto.caloriesBurned,
            distance: createWorkoutDto.distance,
            scheduledDate: createWorkoutDto.date,
            scheduledFor: createWorkoutDto.date ? new Date(createWorkoutDto.date) : undefined,
            user,
            isPublic: createWorkoutDto.isPublic
        });

        const savedWorkout = await this.workoutRepository.save(workout);
        this.logger.log(`Тренировка создана с ID: ${savedWorkout.id}`);

        if (createWorkoutDto.exercises && createWorkoutDto.exercises.length > 0) {
            this.logger.log(`Добавление ${createWorkoutDto.exercises.length} упражнений к тренировке`);
            
            for (const exerciseData of createWorkoutDto.exercises) {
                const workoutExercise = this.workoutExerciseRepository.create({
                    workoutId: savedWorkout.id,
                    exerciseId: exerciseData.exerciseId,
                    sets: exerciseData.sets,
                    reps: exerciseData.reps,
                    weight: exerciseData.weight,
                    durationSeconds: exerciseData.duration,
                    order: createWorkoutDto.exercises.indexOf(exerciseData)
                });
                
                await this.workoutExerciseRepository.save(workoutExercise);
                this.logger.debug(`Добавлено упражнение ID: ${exerciseData.exerciseId}`);
            }
        }
        
        // Создаем тестовые уведомления для демонстрации функциональности
        try {
            await this.notificationsService.createTestNotificationForWorkout(
                savedWorkout.id,
                userId,
                savedWorkout.name
            );
            
            // Если тренировка публичная, отправим уведомление о новой публичной тренировке
            if (savedWorkout.isPublic) {
                await this.notificationsService.notifyNewPublicWorkout(
                    savedWorkout.id,
                    savedWorkout.name
                );
            }
        } catch (error) {
            // Просто логируем ошибку, но не прерываем выполнение
            this.logger.error('Ошибка при создании уведомлений:', error);
        }

        return this.findOne(savedWorkout.id, userId);
    }

    async findAll(userId: string, includePublic: boolean = false, createdByUser: boolean = false, excludeCompleted: boolean = false) {
        try {
            this.logger.log(`Получение тренировок для пользователя ${userId}`);
            this.logger.log(`Параметры: includePublic=${includePublic}, createdByUser=${createdByUser}, excludeCompleted=${excludeCompleted}`);
            
            const queryBuilder = this.workoutRepository.createQueryBuilder('workout')
                .leftJoinAndSelect('workout.workoutExercises', 'workoutExercise')
                .leftJoinAndSelect('workoutExercise.exercise', 'exercise');
            
            // Если запрашиваем только созданные пользователем тренировки
            if (createdByUser) {
                // Получаем только тренировки, созданные ЭТИМ пользователем
                queryBuilder.where('workout.userId = :userId', { userId });
            } else if (includePublic) {
                // Если запрашиваем все, включая публичные
                queryBuilder.where('workout.userId = :userId OR workout.isPublic = :isPublic', { 
                    userId, 
                    isPublic: true 
                });
            } else {
                // По умолчанию - только тренировки этого пользователя
                queryBuilder.where('workout.userId = :userId', { userId });
            }
            
            // Если требуется исключить завершенные тренировки
            if (excludeCompleted) {
                queryBuilder.andWhere('(workout.status != :completed OR workout.status IS NULL)', { 
                    completed: WorkoutStatus.COMPLETED 
                });
            }
            
            const workouts = await queryBuilder
                .orderBy('workout.createdAt', 'DESC')
                .getMany();
            
            this.logger.log(`Найдено ${workouts.length} тренировок`);
            return workouts;
        } catch (error: any) {
            this.logger.error(`Ошибка при получении тренировок: ${error.message}`, error.stack);
            throw error;
        }
    }

    async getActiveWorkouts(userId: string) {
        return this.workoutRepository.find({
            where: { userId, status: WorkoutStatus.ACTIVE },
            relations: ['workoutExercises', 'workoutExercises.exercise'],
            order: { createdAt: 'DESC' }
        });
    }

    async getPublicWorkouts(type?: string) {
        try {
            this.logger.log(`Получение публичных тренировок${type ? ` типа ${type}` : ''}`);
            
            const queryBuilder = this.workoutRepository.createQueryBuilder('workout')
                .leftJoinAndSelect('workout.workoutExercises', 'workoutExercise')
                .leftJoinAndSelect('workoutExercise.exercise', 'exercise')
                .where('workout.isPublic = :isPublic', { isPublic: true });

            if (type) {
                queryBuilder.andWhere('workout.type = :type', { type });
            }

            const workouts = await queryBuilder
                .orderBy('workout.createdAt', 'DESC')
                .getMany();
                
            this.logger.log(`Найдено ${workouts.length} публичных тренировок`);
            return workouts;
        } catch (error: any) {
            this.logger.error(`Ошибка при получении публичных тренировок: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findOne(id: string, userId: string) {
        const workout = await this.workoutRepository.findOne({
            where: { id },
            relations: ['workoutExercises', 'workoutExercises.exercise', 'user']
        });

        if (!workout) {
            throw new NotFoundException('Тренировка не найдена');
        }

        if (workout.userId !== userId && !workout.isPublic) {
            throw new NotFoundException('Тренировка не найдена');
        }

        return workout;
    }

    async update(id: string, updateWorkoutDto: UpdateWorkoutDto, userId: string) {
        const workout = await this.findOne(id, userId);
        Object.assign(workout, updateWorkoutDto);
        return this.workoutRepository.save(workout);
    }

    async remove(id: string, userId: string) {
        const workout = await this.findOne(id, userId);
        await this.workoutRepository.remove(workout);
        return { message: 'Тренировка успешно удалена' };
    }

    async getWorkoutStats(userId: string): Promise<any> {
        // Получаем все тренировки пользователя
        const userWorkouts = await this.workoutRepository
            .createQueryBuilder('workout')
            .where('workout.userId = :userId', { userId })
            .getMany();

        // Получаем активные тренировки
        const activeWorkouts = await this.workoutRepository
            .createQueryBuilder('workout')
            .where('workout.userId = :userId', { userId })
            .andWhere('workout.status = :status', { status: WorkoutStatus.ACTIVE })
            .getMany();

        // Получаем завершенные тренировки
        const completedWorkouts = await this.workoutRepository
            .createQueryBuilder('workout')
            .where('workout.userId = :userId', { userId })
            .andWhere('workout.status = :status', { status: WorkoutStatus.COMPLETED })
            .getMany();

        // Получаем упражнения
        const workoutIds = userWorkouts.map(workout => workout.id);
        
        const workoutExercises = await this.workoutExerciseRepository
            .createQueryBuilder('workoutExercise')
            .where('workoutExercise.workoutId IN (:...workoutIds)', { workoutIds })
            .getMany();

        // Расчет общего количества упражнений
        const totalExercises = workoutExercises.length;

        // Расчет общей длительности всех тренировок
        const totalDuration = userWorkouts.reduce((sum, workout) => 
            sum + (workout.durationMinutes || 0), 0);

        // Расчет общего количества сожженных калорий
        const totalCalories = userWorkouts.reduce((sum, workout) => 
            sum + (workout.caloriesBurned || 0), 0);

        // Расчет процента выполнения (завершенные / общее количество)
        const completionRate = userWorkouts.length > 0 
            ? Math.round((completedWorkouts.length / userWorkouts.length) * 100) 
            : 0;

        // Получение тренировок за последний месяц
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const recentWorkouts = userWorkouts.filter(workout => 
            new Date(workout.createdAt) >= oneMonthAgo
        );

        return {
            totalWorkouts: userWorkouts.length,
            activeWorkouts: activeWorkouts.length,
            completedWorkouts: completedWorkouts.length,
            totalExercises,
            totalDuration,
            totalCalories,
            completionRate,
            recentWorkoutsCount: recentWorkouts.length
        };
    }

    async addToActive(workoutId: string, userId: string): Promise<Workout> {
        // Проверяем существование тренировки
        const workout = await this.workoutRepository.findOne({
            where: { id: workoutId }
        });
        if (!workout) {
            throw new NotFoundException('Тренировка не найдена');
        }

        // Добавляем в активные
        const activeWorkout: ActiveWorkout = {
            id: `active-${Date.now()}`, // Генерируем временный ID
            workoutId,
            userId,
            startTime: new Date(),
        };
        this.activeWorkouts.push(activeWorkout);

        return workout;
    }

    async removeFromActive(workoutId: string, userId: string): Promise<void> {
        const index = this.activeWorkouts.findIndex(
            aw => aw.workoutId === workoutId && aw.userId === userId
        );

        if (index === -1) {
            throw new NotFoundException('Активная тренировка не найдена');
        }

        this.activeWorkouts.splice(index, 1);
    }

    async updateProgress(data: {
        workoutId: string;
        date: string;
        completedExercises: string[];
        completionPercentage: number;
    }, userId: string): Promise<WorkoutProgress> {
        // Проверяем существование тренировки
        const workout = await this.workoutRepository.findOne({
            where: { id: data.workoutId }
        });
        if (!workout) {
            throw new NotFoundException('Тренировка не найдена');
        }

        // Создаем запись о прогрессе
        const progress: WorkoutProgress = {
            id: `progress-${Date.now()}`, // Генерируем временный ID
            workoutId: data.workoutId,
            userId,
            date: data.date,
            completedExercises: data.completedExercises,
            completionPercentage: data.completionPercentage,
        };
        this.workoutProgress.push(progress);

        // Удаляем тренировку из активных (если она там была)
        try {
            await this.removeFromActive(data.workoutId, userId);
        } catch (error) {
            // Игнорируем ошибку, если тренировка не была в активных
        }

        return progress;
    }

    async scheduleWorkout(userId: string, scheduleDto: { workoutId: string; date: string; time: string }) {
        const workout = await this.workoutRepository.findOne({
            where: { id: scheduleDto.workoutId }
        });

        if (!workout) {
            throw new NotFoundException('Тренировка не найдена');
        }

        const scheduledDate = new Date(`${scheduleDto.date}T${scheduleDto.time}`);
        
        const scheduledWorkout = this.workoutRepository.create({
            name: workout.name,
            description: workout.description,
            type: workout.type,
            status: WorkoutStatus.ACTIVE,
            durationMinutes: workout.durationMinutes,
            caloriesBurned: workout.caloriesBurned,
            distance: workout.distance,
            scheduledDate,
            userId,
            isPublic: false
        });

        await this.workoutRepository.save(scheduledWorkout);

        // Копируем упражнения из оригинальной тренировки
        const exercises = await this.workoutExerciseRepository.find({
            where: { workoutId: workout.id }
        });

        for (const exercise of exercises) {
            const workoutExercise = this.workoutExerciseRepository.create({
                workoutId: scheduledWorkout.id,
                exerciseId: exercise.exerciseId,
                sets: exercise.sets,
                reps: exercise.reps,
                weight: exercise.weight,
                durationSeconds: exercise.durationSeconds,
                order: exercise.order
            });
            await this.workoutExerciseRepository.save(workoutExercise);
        }

        return scheduledWorkout;
    }

    async createCompletedWorkout(data: {
        userId: string;
        workoutId: string;
        completedDate: Date;
        duration: number;
        calories: number;
        exercises: any[];
        completionPercentage: number;
    }) {
        const user = await this.userRepository.findOne({ where: { id: data.userId } });
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }

        const origWorkout = await this.workoutRepository.findOne({
            where: { id: data.workoutId }
        });
        if (!origWorkout) {
            throw new NotFoundException('Тренировка не найдена');
        }

        // Создаем объект с правильными полями, соответствующими модели Workout
        const workoutData = {
            name: origWorkout.name,
            description: origWorkout.description,
            type: origWorkout.type,
            status: WorkoutStatus.COMPLETED,
            durationMinutes: data.duration,
            caloriesBurned: data.calories,
            userId: data.userId,
            isPublic: false,
            scheduledDate: data.completedDate,
            completionPercentage: data.completionPercentage
        };

        // Создаем и сохраняем тренировку
        const completedWorkout = this.workoutRepository.create(workoutData);
        const savedWorkout = await this.workoutRepository.save(completedWorkout);

        if (data.exercises && data.exercises.length > 0) {
            for (const exerciseData of data.exercises) {
                const workoutExercise = this.workoutExerciseRepository.create({
                    workoutId: savedWorkout.id,
                    exerciseId: exerciseData.exercise,
                    sets: exerciseData.sets,
                    reps: exerciseData.reps,
                    weight: exerciseData.weight,
                    durationSeconds: exerciseData.duration,
                    order: data.exercises.indexOf(exerciseData)
                });
                await this.workoutExerciseRepository.save(workoutExercise);
            }
        }

        // Отправляем уведомление о выполненной тренировке
        try {
            await this.notificationsService.notifyWorkoutCompleted(
                user.id,
                savedWorkout.name,
                data.completionPercentage
            );
            
            // Проверяем достижения ПОСЛЕ выполнения тренировки
            const newAchievements = await this.achievementsService.checkAndAwardAchievements(user);
            if (newAchievements && newAchievements.length > 0) {
                this.logger.log(`Пользователь ${user.id} получил ${newAchievements.length} новых достижений!`);
            }
        } catch (error) {
            this.logger.error('Ошибка при создании уведомлений или проверке достижений:', error);
        }

        return savedWorkout;
    }

    async getCompletedWorkouts(userId: string) {
        // Получаем все завершенные тренировки пользователя с их упражнениями
        const completedWorkouts = await this.workoutRepository.find({
            where: { 
                userId,
                status: WorkoutStatus.COMPLETED
            },
            relations: ['workoutExercises', 'workoutExercises.exercise'],
            order: { 
                scheduledDate: 'DESC',
                createdAt: 'DESC'
            }
        });
        
        // Отладочная информация
        this.logger.log(`Найдено ${completedWorkouts.length} завершенных тренировок для пользователя ${userId}`);
        
        // Формируем данные в формате, ожидаемом на клиенте
        return await Promise.all(completedWorkouts.map(async workout => {
            // Получаем все упражнения для тренировки
            const exercises = await this.workoutExerciseRepository.find({
                where: { workoutId: workout.id },
                relations: ['exercise']
            });

            this.logger.log(`Тренировка ${workout.id} (${workout.name}) содержит ${exercises.length} упражнений`);
            
            // Если упражнений нет, попробуем найти упражнения из оригинальной тренировки
            let workoutExercises = exercises;
            if (!exercises || exercises.length === 0) {
                // Предполагаем, что тренировка могла быть создана на основе другой
                // Для этого ищем тренировку с таким же именем
                this.logger.log(`Пытаемся найти упражнения для тренировки ${workout.name} из исходных тренировок`);
                const originalWorkouts = await this.workoutRepository.find({
                    where: { name: workout.name, isPublic: true },
                    relations: ['workoutExercises', 'workoutExercises.exercise']
                });

                if (originalWorkouts.length > 0 && 
                    originalWorkouts[0].workoutExercises && 
                    originalWorkouts[0].workoutExercises.length > 0) {
                    
                    workoutExercises = originalWorkouts[0].workoutExercises;
                    this.logger.log(`Нашли ${workoutExercises.length} упражнений в исходной тренировке ${originalWorkouts[0].id}`);
                }
            }

            // Создаем объект для упрощения доступа к связанным данным на фронтенде
            return {
                id: workout.id,
                workoutId: workout.id,  // Для совместимости с историей
                workout: {
                    id: workout.id,
                    name: workout.name,
                    description: workout.description,
                    type: workout.type,
                    duration: workout.durationMinutes || 0,
                    calories: workout.caloriesBurned || 0,
                    exercises: workoutExercises?.map(ex => ({
                        id: ex.id,
                        exerciseId: ex.exerciseId,
                        exercise: ex.exercise || {
                            id: ex.exerciseId,
                            name: "Упражнение",
                            description: "",
                            muscleGroup: "Другое",
                            difficulty: "средний"
                        },
                        sets: ex.sets || 3,
                        reps: ex.reps || 10,
                        weight: ex.weight || 0,
                        duration: ex.durationSeconds || 0
                    })) || []
                },
                userId: workout.userId,
                date: workout.scheduledDate && workout.scheduledDate instanceof Date 
                    ? workout.scheduledDate.toISOString().split('T')[0] 
                    : typeof workout.scheduledDate === 'string' 
                        ? String(workout.scheduledDate).split('T')[0]
                        : new Date().toISOString().split('T')[0],
                completedExercises: workoutExercises?.map(ex => ex.id) || [],
                completionPercentage: workout.completionPercentage || 100
            };
        }));
    }
} 
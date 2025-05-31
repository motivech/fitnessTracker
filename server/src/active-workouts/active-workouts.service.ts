import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveWorkout } from '../entities/ActiveWorkout';
import { Workout, WorkoutStatus } from '../entities/Workout';
import { WorkoutProgress } from '../entities/WorkoutProgress';
import { User } from '../entities/User';
import { WorkoutExercise } from '../entities/WorkoutExercise';

@Injectable()
export class ActiveWorkoutsService {
  constructor(
    @InjectRepository(ActiveWorkout)
    private activeWorkoutRepository: Repository<ActiveWorkout>,
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(WorkoutProgress)
    private workoutProgressRepository: Repository<WorkoutProgress>,
  ) {}

  async getActiveWorkouts(userId: string): Promise<ActiveWorkout[]> {
    return this.activeWorkoutRepository.find({
      where: { userId },
      relations: ['workout'],
    });
  }

  async addToActive(workoutId: string, user: User): Promise<ActiveWorkout> {
    // Проверяем существование тренировки
    const workout = await this.workoutRepository.findOne({
      where: { id: workoutId }
    });
    
    if (!workout) {
      throw new NotFoundException('Тренировка не найдена');
    }

    // Проверяем, не активна ли уже эта тренировка
    const existingActive = await this.activeWorkoutRepository.findOne({
      where: { workoutId, userId: user.id }
    });

    if (existingActive) {
      return existingActive;
    }

    // Создаем активную тренировку
    const activeWorkout = this.activeWorkoutRepository.create({
      workoutId,
      userId: user.id,
      progress: 0,
    });

    return this.activeWorkoutRepository.save(activeWorkout);
  }

  async removeFromActive(workoutId: string, userId: string): Promise<void> {
    const activeWorkout = await this.activeWorkoutRepository.findOne({
      where: { workoutId, userId }
    });

    if (!activeWorkout) {
      throw new NotFoundException('Активная тренировка не найдена');
    }

    await this.activeWorkoutRepository.remove(activeWorkout);
  }

  async updateProgress(data: {
    workoutId: string;
    date: string;
    completedExercises: string[];
    completionPercentage: number;
    notes?: string;
    timeSpent?: number;
    caloriesBurned?: number;
  }, userId: string): Promise<WorkoutProgress> {
    // Проверяем существование тренировки
    const workout = await this.workoutRepository.findOne({
      where: { id: data.workoutId }
    });
    
    if (!workout) {
      throw new NotFoundException('Тренировка не найдена');
    }

    // Создаем запись о прогрессе
    const progress = this.workoutProgressRepository.create({
      workoutId: data.workoutId,
      userId,
      date: data.date,
      completedExercises: data.completedExercises,
      completionPercentage: data.completionPercentage,
      notes: data.notes,
      timeSpent: data.timeSpent,
      caloriesBurned: data.caloriesBurned,
    });

    const savedProgress = await this.workoutProgressRepository.save(progress);

    // Удаляем тренировку из активных (если она есть)
    try {
      await this.removeFromActive(data.workoutId, userId);
    } catch (error) {
      // Игнорируем ошибку, если тренировка не была в активных
    }

    return savedProgress;
  }

  async completeWorkout(data: {
    workoutId: string;
    date: string;
    completedExercises: Array<{
      exerciseId: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      completed?: boolean;
    }>;
    completionPercentage: number;
    caloriesBurned?: number;
    timeSpent?: number;
  }, userId: string): Promise<any> {
    // Проверяем существование тренировки
    const originalWorkout = await this.workoutRepository.findOne({
      where: { id: data.workoutId },
      relations: ['workoutExercises', 'workoutExercises.exercise']
    });
    
    if (!originalWorkout) {
      throw new NotFoundException('Тренировка не найдена');
    }

    // Получаем идентификаторы выполненных упражнений
    const completedExercisesIds = data.completedExercises
      .filter(ex => ex.completed)
      .map(ex => ex.exerciseId);

    // Создаем запись о выполненной тренировке
    const completedWorkout = this.workoutRepository.create({
      name: originalWorkout.name,
      description: originalWorkout.description,
      type: originalWorkout.type,
      status: WorkoutStatus.COMPLETED,
      durationMinutes: data.timeSpent || originalWorkout.durationMinutes,
      caloriesBurned: data.caloriesBurned || originalWorkout.caloriesBurned,
      userId: userId,
      isPublic: false,
      scheduledDate: new Date(data.date),
      completionPercentage: data.completionPercentage
    });

    // Сохраняем новую тренировку
    const savedWorkout = await this.workoutRepository.save(completedWorkout);

    // Копируем упражнения из оригинальной тренировки
    if (originalWorkout.workoutExercises && originalWorkout.workoutExercises.length > 0) {
      for (const exercise of data.completedExercises) {
        // Находим соответствующее упражнение в исходной тренировке для получения дополнительных данных
        const originalExercise = originalWorkout.workoutExercises.find(
          ex => ex.exerciseId === exercise.exerciseId
        );

        if (originalExercise) {
          const workoutExercise = this.workoutRepository.manager.create('workout_exercises', {
            workoutId: savedWorkout.id,
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            durationSeconds: exercise.duration,
            order: originalWorkout.workoutExercises.indexOf(originalExercise),
            completed: exercise.completed || false
          });

          await this.workoutRepository.manager.save('workout_exercises', workoutExercise);
        }
      }
    }

    // Удаляем тренировку из активных
    try {
      await this.removeFromActive(data.workoutId, userId);
    } catch (error) {
      // Игнорируем ошибку, если тренировка не была в активных
    }

    // Создаем запись о прогрессе
    const progress = this.workoutProgressRepository.create({
      workoutId: savedWorkout.id, // Используем ID новой сохраненной тренировки
      userId,
      date: data.date,
      completedExercises: completedExercisesIds,
      completionPercentage: data.completionPercentage,
      timeSpent: data.timeSpent,
      caloriesBurned: data.caloriesBurned,
    });

    await this.workoutProgressRepository.save(progress);

    // Возвращаем полные данные о завершенной тренировке
    return {
      ...savedWorkout,
      progress,
      workout: {
        ...savedWorkout,
        exercises: await this.workoutRepository.manager.find('workout_exercises', {
          where: { workoutId: savedWorkout.id }
        })
      }
    };
  }
} 
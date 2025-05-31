import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExercisesService } from './exercises/exercises.service';
import { exercisesSeed } from './seed-data/exercises';
import { workoutsSeed } from './seed-data/workouts';
import { programsSeed } from './seed-data/programs';
import { getConnection, Repository } from 'typeorm';
import { WorkoutsService } from './workouts/workouts.service';
import { AuthService } from './auth/auth.service';
import { UsersService } from './auth/users.service';
import { Gender, ActivityLevel, FitnessGoal } from './entities/User';
import { WorkoutType } from './entities/Workout';
import { ExerciseDto } from './workouts/dto/create-workout.dto';
import { ProgramsService } from './programs/programs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Program } from './entities/Program';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('Начинаем заполнение базы данных данными...');
    
    // Получаем сервисы
    const exercisesService = app.get(ExercisesService);
    const workoutsService = app.get(WorkoutsService);
    const authService = app.get(AuthService);
    const usersService = app.get(UsersService);
    const programsService = app.get(ProgramsService);
    
    // Создаем тестового пользователя
    console.log('Создаем тестового пользователя...');
    let testUser;
    try {
      testUser = await usersService.findByEmail('user@example.com');
      if (!testUser) {
        const userData = await authService.register({
          email: 'user@example.com',
          password: 'password123',
          firstName: 'Иван',
          lastName: 'Иванов',
          age: 30,
          gender: Gender.MALE,
          activityLevel: ActivityLevel.MODERATELY_ACTIVE,
          fitnessGoals: [FitnessGoal.WEIGHT_LOSS, FitnessGoal.ENDURANCE]
        });
        testUser = userData.user;
        console.log('Создан тестовый пользователь:', userData.user.email);
      } else {
        console.log('Тестовый пользователь уже существует:', testUser.email);
      }
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
    }
    
    // Добавляем упражнения
    console.log('Добавляем упражнения...');
    const existingExercises = await exercisesService.findAll();
    if (existingExercises.length === 0) {
      for (const exercise of exercisesSeed) {
        try {
          await exercisesService.create(exercise);
          console.log(`Добавлено упражнение: ${exercise.name}`);
        } catch (error) {
          console.error(`Ошибка при добавлении упражнения ${exercise.name}:`, error);
        }
      }
      console.log(`Всего добавлено ${exercisesSeed.length} упражнений`);
    } else {
      console.log('Упражнения уже существуют, пропускаем...');
    }
    
    // Добавляем тренировки
    console.log('Добавляем шаблоны тренировок...');
    const existingWorkouts = await workoutsService.findAll(testUser?.id || '');
    if (existingWorkouts.length === 0 && testUser) {
      for (const workout of workoutsSeed) {
        try {
          // Получаем упражнения по названию
          const workoutExercises: ExerciseDto[] = [];
          for (const ex of workout.exercises) {
            const exercise = await exercisesService.findByName(ex.name);
            if (exercise) {
              workoutExercises.push({
                name: exercise.id,
                exerciseId: exercise.id,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                duration: ex.duration
              });
            }
          }
          
          // Создаем тренировку
          const newWorkout = await workoutsService.create({
            name: workout.name,
            description: workout.description,
            type: workout.type,
            difficulty: workout.difficulty as 'начинающий' | 'средний' | 'продвинутый',
            duration: workout.duration,
            caloriesBurned: workout.caloriesBurned,
            isPublic: workout.isPublic,
            exercises: workoutExercises,
            userId: testUser.id,
            date: new Date()
          }, testUser.id);
          
          console.log(`Добавлена тренировка: ${workout.name}`);
          
          // Также создаем несколько выполненных тренировок за прошлые дни
          if (testUser) {
            // Создаем случайное количество завершенных тренировок
            const randomCount = Math.floor(Math.random() * 3) + 1; // 1-3 тренировки
            
            for (let i = 0; i < randomCount; i++) {
              // Создаем дату в последние 14 дней
              const daysAgo = Math.floor(Math.random() * 14);
              const completedDate = new Date();
              completedDate.setDate(completedDate.getDate() - daysAgo);
              
              // Рассчитываем случайное значение прогресса
              const completionPercentage = Math.floor(Math.random() * 30) + 70; // 70-100%
              
              await workoutsService.createCompletedWorkout({
                userId: testUser.id,
                workoutId: newWorkout.id,
                completedDate: completedDate,
                duration: workout.duration,
                calories: workout.caloriesBurned,
                exercises: workoutExercises,
                completionPercentage: completionPercentage
              });
              
              console.log(`Создана выполненная тренировка: ${workout.name} (${completedDate.toISOString()})`);
            }
          }
        } catch (error) {
          console.error(`Ошибка при добавлении тренировки ${workout.name}:`, error);
        }
      }
      console.log(`Всего добавлено ${workoutsSeed.length} тренировок`);
    } else {
      console.log('Тренировки уже существуют, пропускаем...');
    }
    
    // Добавляем программы тренировок
    console.log('Добавляем программы тренировок...');
    
    // Проверяем, есть ли уже программы
    let existingPrograms = [];
    try {
      if (testUser) {
        existingPrograms = await programsService.findAll(testUser);
      } else {
        console.log('Пользователь не найден, пропускаем проверку программ');
      }
    } catch (error) {
      console.log('Ошибка при проверке существующих программ:', error);
    }
    
    if (existingPrograms.length === 0 && testUser) {
      const workoutMap = new Map(); // Хранит соответствие между названием тренировки и её ID
      
      // Получаем все тренировки для создания карты названий-идентификаторов
      const allWorkouts = await workoutsService.findAll(testUser.id);
      
      for (const workout of allWorkouts) {
        workoutMap.set(workout.name, workout.id);
      }
      
      for (const program of programsSeed) {
        try {
          const workoutSchedule = [];
          
          // Создаем массив расписания с реальными ID тренировок
          for (const scheduleItem of program.workoutSchedule) {
            const workoutId = workoutMap.get(scheduleItem.workoutName);
            if (workoutId) {
              workoutSchedule.push({
                workoutId: workoutId,
                dayOfProgram: scheduleItem.dayOfProgram,
                timeOfDay: scheduleItem.timeOfDay
              });
            } else {
              console.log(`Тренировка "${scheduleItem.workoutName}" не найдена в базе данных`);
            }
          }
          
          // Создаем программу
          if (workoutSchedule.length > 0) {
            await programsService.create({
              name: program.name,
              description: program.description,
              duration: program.durationDays,
              createdBy: testUser.id,
              workouts: workoutSchedule,
              isPublic: program.isPublic
            }, testUser);
            
            console.log(`Добавлена программа тренировок: ${program.name}`);
          }
        } catch (error) {
          console.error(`Ошибка при добавлении программы ${program.name}:`, error);
        }
      }
      console.log(`Всего добавлено ${programsSeed.length} программ тренировок`);
    } else {
      console.log('Программы тренировок уже существуют, пропускаем...');
    }
    
    console.log('Заполнение базы данных успешно завершено');
  } catch (error) {
    console.error('Произошла ошибка при заполнении базы данных:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
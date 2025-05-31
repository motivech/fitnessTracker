import { createConnection, getRepository } from 'typeorm';
import { Program } from '../entities/Program';
import { Workout, WorkoutType, WorkoutStatus } from '../entities/Workout';
import { ScheduledWorkout } from '../entities/ScheduledWorkout';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../entities/User';
import { Exercise } from '../entities/Exercise';
import { WorkoutExercise } from '../entities/WorkoutExercise';
import { databaseConfig } from '../config/database.config';

// Определяем структуру для ProgramProgress, так как модуль не найден
interface ProgramProgress {
  id: string;
  programId: string;
  userId: string;
  startDate: string;
  endDate?: string;
  completionPercentage: number;
  isCompleted: boolean;
}

interface MockWorkout {
  name: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    muscleGroup: string;
  }[];
}

const mockWorkouts: MockWorkout[] = [
  {
    name: "Тренировка на мышцы кора",
    exercises: [
      { name: "Планка", sets: 3, reps: 60, muscleGroup: "core" },
      { name: "Скручивания", sets: 3, reps: 15, muscleGroup: "abs" },
      { name: "Боковая планка", sets: 3, reps: 45, muscleGroup: "core" },
      { name: "Супермен", sets: 3, reps: 12, muscleGroup: "lower_back" },
      { name: "Велосипед", sets: 3, reps: 20, muscleGroup: "abs" }
    ]
  },
  {
    name: "Интенсивная кардио тренировка",
    exercises: [
      { name: "Бег", sets: 1, reps: 1, muscleGroup: "full_body" },
      { name: "Эллиптический тренажер", sets: 1, reps: 1, muscleGroup: "full_body" },
      { name: "Прыжки со скакалкой", sets: 5, reps: 1, muscleGroup: "full_body" }
    ]
  },
  {
    name: "Тренировка верхней части тела",
    exercises: [
      { name: "Отжимания", sets: 3, reps: 15, muscleGroup: "chest" },
      { name: "Подтягивания", sets: 3, reps: 8, muscleGroup: "back" },
      { name: "Жим гантелей", sets: 3, reps: 12, muscleGroup: "shoulders" },
      { name: "Сгибания на бицепс", sets: 3, reps: 12, muscleGroup: "biceps" },
      { name: "Разгибания на трицепс", sets: 3, reps: 12, muscleGroup: "triceps" }
    ]
  },
  {
    name: "Тренировка нижней части тела",
    exercises: [
      { name: "Приседания", sets: 4, reps: 15, muscleGroup: "legs" },
      { name: "Выпады", sets: 3, reps: 10, muscleGroup: "legs" },
      { name: "Подъемы на носки", sets: 3, reps: 20, muscleGroup: "calves" },
      { name: "Румынская тяга", sets: 3, reps: 12, muscleGroup: "hamstrings" },
      { name: "Ягодичный мостик", sets: 3, reps: 15, muscleGroup: "glutes" }
    ]
  },
  {
    name: "Полноценная тренировка всего тела",
    exercises: [
      { name: "Берпи", sets: 3, reps: 10, muscleGroup: "full_body" },
      { name: "Приседания с прыжком", sets: 3, reps: 15, muscleGroup: "legs" },
      { name: "Отжимания", sets: 3, reps: 12, muscleGroup: "chest" },
      { name: "Планка с подъемом руки", sets: 3, reps: 10, muscleGroup: "core" },
      { name: "Ягодичный мостик", sets: 3, reps: 15, muscleGroup: "glutes" },
      { name: "Боковые выпады", sets: 3, reps: 10, muscleGroup: "legs" }
    ]
  },
  {
    name: "Растяжка и гибкость",
    exercises: [
      { name: "Растяжка передней поверхности бедра", sets: 2, reps: 30, muscleGroup: "quads" },
      { name: "Растяжка задней поверхности бедра", sets: 2, reps: 30, muscleGroup: "hamstrings" },
      { name: "Растяжка плеч", sets: 2, reps: 30, muscleGroup: "shoulders" },
      { name: "Растяжка спины", sets: 2, reps: 30, muscleGroup: "back" },
      { name: "Растяжка груди", sets: 2, reps: 30, muscleGroup: "chest" }
    ]
  }
];

const mockPrograms = [
  {
    name: "Программа для набора мышечной массы (30 дней)",
    description: "Месячная программа для увеличения мышечной массы с фокусом на силовые упражнения",
    durationDays: 30,
    isPublic: true,
    workoutSchedule: [
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 1, timeOfDay: "18:00" },
      { workoutName: "Тренировка нижней части тела", dayOfProgram: 2, timeOfDay: "18:00" },
      { workoutName: "Растяжка и гибкость", dayOfProgram: 3, timeOfDay: "18:00" },
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 4, timeOfDay: "18:00" },
      { workoutName: "Тренировка на мышцы кора", dayOfProgram: 5, timeOfDay: "18:00" },
      { workoutName: "Полноценная тренировка всего тела", dayOfProgram: 6, timeOfDay: "10:00" },
      { workoutName: "Отдых", dayOfProgram: 7 },
      
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 8, timeOfDay: "18:00" },
      { workoutName: "Тренировка нижней части тела", dayOfProgram: 9, timeOfDay: "18:00" },
      { workoutName: "Растяжка и гибкость", dayOfProgram: 10, timeOfDay: "18:00" },
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 11, timeOfDay: "18:00" },
      { workoutName: "Тренировка на мышцы кора", dayOfProgram: 12, timeOfDay: "18:00" },
      { workoutName: "Полноценная тренировка всего тела", dayOfProgram: 13, timeOfDay: "10:00" },
      { workoutName: "Отдых", dayOfProgram: 14 },
      
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 15, timeOfDay: "18:00" },
      { workoutName: "Тренировка нижней части тела", dayOfProgram: 16, timeOfDay: "18:00" },
      { workoutName: "Растяжка и гибкость", dayOfProgram: 17, timeOfDay: "18:00" },
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 18, timeOfDay: "18:00" },
      { workoutName: "Тренировка на мышцы кора", dayOfProgram: 19, timeOfDay: "18:00" },
      { workoutName: "Полноценная тренировка всего тела", dayOfProgram: 20, timeOfDay: "10:00" },
      { workoutName: "Отдых", dayOfProgram: 21 },
      
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 22, timeOfDay: "18:00" },
      { workoutName: "Тренировка нижней части тела", dayOfProgram: 23, timeOfDay: "18:00" },
      { workoutName: "Растяжка и гибкость", dayOfProgram: 24, timeOfDay: "18:00" },
      { workoutName: "Тренировка верхней части тела", dayOfProgram: 25, timeOfDay: "18:00" },
      { workoutName: "Тренировка на мышцы кора", dayOfProgram: 26, timeOfDay: "18:00" },
      { workoutName: "Полноценная тренировка всего тела", dayOfProgram: 27, timeOfDay: "10:00" },
      { workoutName: "Отдых", dayOfProgram: 28 },
      { workoutName: "Интенсивная кардио тренировка", dayOfProgram: 29, timeOfDay: "08:00" },
      { workoutName: "Растяжка и гибкость", dayOfProgram: 30, timeOfDay: "18:00" }
    ]
  }
];

async function createMockProgramsData() {
  try {
    console.log('Подключение к базе данных...');
    
    // Используем прямую конфигурацию для подключения к базе данных
    const connection = await createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "123",
      database: "fitness_app",
      entities: [User, Workout, Program, Exercise, WorkoutExercise, ScheduledWorkout],
      synchronize: false
    });
    
    console.log('Подключение успешно установлено.');

    // Удаление существующих данных через SQL-запросы
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Начинаем транзакцию
      await queryRunner.startTransaction();
      
      console.log('Удаление существующих записей о прогрессе программ...');
      await queryRunner.query('DELETE FROM program_progress');
      
      console.log('Удаление запланированных тренировок, связанных с программами...');
      await queryRunner.query('DELETE FROM scheduled_workouts WHERE "programId" IS NOT NULL');
      
      console.log('Удаление существующих программ тренировок...');
      await queryRunner.query('DELETE FROM program');
      
      // Фиксируем транзакцию
      await queryRunner.commitTransaction();
    } catch (error) {
      // Если произошла ошибка, откатываем транзакцию
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Освобождаем queryRunner
      await queryRunner.release();
    }

    // 4. Получаем список существующих тренировок
    console.log('Получение списка существующих тренировок...');
    const workoutRepo = getRepository(Workout);
    let existingWorkouts = await workoutRepo.find();
    
    // 5. Создаем новые тренировки, если необходимо
    console.log('Создание новых тренировок, если необходимо...');
    const workoutMap = new Map();
    
    for (const mockWorkout of mockWorkouts) {
      // Проверяем, существует ли тренировка с таким именем
      let workout = existingWorkouts.find(w => w.name === mockWorkout.name);
      
      if (!workout) {
        // Создаем новую тренировку
        workout = new Workout();
        workout.name = mockWorkout.name;
        workout.description = `${mockWorkout.name} - это эффективная тренировка для улучшения физической формы.`;
        workout.type = mockWorkout.name.toLowerCase().includes('кардио') ? WorkoutType.CARDIO : WorkoutType.STRENGTH;
        workout.durationMinutes = 45;
        workout.caloriesBurned = 300;
        workout.isPublic = true;
        workout.userId = '1'; // Используем ID администратора
        workout.status = WorkoutStatus.ACTIVE;
        
        workout = await workoutRepo.save(workout);
        existingWorkouts.push(workout);
        
        console.log(`Создана новая тренировка: ${workout.name} (${workout.id})`);
      }
      
      workoutMap.set(mockWorkout.name, workout);
    }
    
    // 6. Создаем новые программы тренировок
    console.log('Создание новых программ тренировок...');
    const programRepo = getRepository(Program);
    
    for (const mockProgram of mockPrograms) {
      const program = new Program();
      program.name = mockProgram.name;
      program.description = mockProgram.description;
      program.durationDays = mockProgram.durationDays;
      program.isPublic = mockProgram.isPublic;
      program.creatorId = '1'; // Используем ID администратора
      
      // Преобразуем расписание тренировок в формат с ID
      const workoutSchedule = [];
      
      for (const ws of mockProgram.workoutSchedule) {
        const workoutName = ws.workoutName;
        if (workoutName === 'Отдых') {
          // Для дней отдыха используем пустой ID
          workoutSchedule.push({
            workoutId: null,
            dayOfProgram: ws.dayOfProgram,
            timeOfDay: ws.timeOfDay
          });
          continue;
        }
        
        const workout = workoutMap.get(workoutName);
        if (!workout) {
          console.warn(`Тренировка "${workoutName}" не найдена для программы "${mockProgram.name}"`);
          continue;
        }
        
        workoutSchedule.push({
          workoutId: workout.id,
          dayOfProgram: ws.dayOfProgram,
          timeOfDay: ws.timeOfDay
        });
      }
      
      program.workoutSchedule = workoutSchedule;
      
      await programRepo.save(program);
      console.log(`Создана новая программа: ${program.name} (${program.id})`);
    }
    
    console.log('Создание моковых данных программ тренировок завершено успешно.');
    
    // Закрываем соединение
    await connection.close();
    console.log('Соединение с базой данных закрыто.');
    
  } catch (error) {
    console.error('Ошибка при создании моковых данных:', error);
    process.exit(1);
  }
}

// Запускаем функцию создания моковых данных
createMockProgramsData(); 
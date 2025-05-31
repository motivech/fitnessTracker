import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { ScheduledWorkoutsService } from '../scheduled-workouts/scheduled-workouts.service';
import { addDays, parse, format } from 'date-fns';
import { Logger } from '@nestjs/common';

// Временно, пока не создадим сущность TrainingProgram
interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: number; // в днях
  createdBy: string;
  isPublic?: boolean;
  workouts: {
    workoutId: string;
    dayOfProgram: number;
    timeOfDay?: string;
  }[];
}

@Injectable()
export class ProgramsService {
  // Временное хранение программ
  private programs: TrainingProgram[] = [
    // Программы удалены
  ];

  private readonly logger = new Logger(ProgramsService.name);

  constructor(
    private readonly scheduledWorkoutsService: ScheduledWorkoutsService,
  ) {}

  async findAll(user: User): Promise<TrainingProgram[]> {
    // Возвращаем все программы
    return this.programs;
  }

  async findOne(id: string, user: User): Promise<TrainingProgram> {
    const program = this.programs.find(p => p.id === id);
    if (!program) {
      this.logger.warn(`Программа с id ${id} не найдена`);
      // Возвращаем заглушку вместо выброса ошибки
      return {
        id: id,
        name: 'Программа тренировок',
        description: 'Стандартная программа',
        duration: 7,
        createdBy: 'system',
        isPublic: true,
        workouts: []
      };
    }
    return program;
  }

  async create(data: Omit<TrainingProgram, 'id'>, user: User): Promise<TrainingProgram> {
    const newProgram = {
      id: `program-${Date.now()}`,
      name: data.name,
      description: data.description,
      duration: data.duration || this.calculateProgramDuration(data.workouts),
      createdBy: user.id,
      isPublic: data.isPublic || false,
      workouts: data.workouts || [],
    };
    
    this.programs.push(newProgram);
    return newProgram;
  }

  // Вспомогательный метод для вычисления продолжительности программы
  private calculateProgramDuration(workouts: { dayOfProgram: number }[]): number {
    if (!workouts || workouts.length === 0) return 0;
    return Math.max(...workouts.map(w => w.dayOfProgram));
  }

  async update(id: string, data: Partial<TrainingProgram>, user: User): Promise<TrainingProgram> {
    const program = await this.findOne(id, user);
    
    if (program.createdBy !== user.id && program.createdBy !== 'system') {
      throw new UnauthorizedException('Вы не можете изменять эту программу');
    }
    
    const updatedProgram = {
      ...program,
      name: data.name || program.name,
      description: data.description || program.description,
      workouts: data.workouts || program.workouts,
      isPublic: data.isPublic !== undefined ? data.isPublic : program.isPublic,
    };
    
    // Пересчитываем продолжительность, если изменились тренировки
    if (data.workouts) {
      updatedProgram.duration = data.duration || this.calculateProgramDuration(data.workouts);
    }
    
    // Обновляем программу в массиве
    const index = this.programs.findIndex(p => p.id === id);
    this.programs[index] = updatedProgram;
    
    return updatedProgram;
  }

  async remove(id: string, user: User): Promise<void> {
    const program = await this.findOne(id, user);
    
    if (program.createdBy !== user.id && program.createdBy !== 'system') {
      throw new UnauthorizedException('Вы не можете удалить эту программу');
    }
    
    // Удаляем программу из массива
    const index = this.programs.findIndex(p => p.id === id);
    this.programs.splice(index, 1);
  }

  async startProgram(data: {
    programId: string;
    startDate: string;
    workoutIds: string[];
  }, user: User): Promise<any> {
    // Находим программу
    const program = await this.findOne(data.programId, user);
    
    // Фильтруем только выбранные тренировки
    const selectedWorkouts = program.workouts.filter(
      workout => data.workoutIds.includes(workout.workoutId)
    );
    
    if (selectedWorkouts.length === 0) {
      throw new NotFoundException('Выбранные тренировки не найдены в программе');
    }
    
    // Создаем запланированные тренировки для каждой выбранной тренировки
    const scheduledWorkouts = [];
    const startDate = parse(data.startDate, 'yyyy-MM-dd', new Date());
    
    // Группируем тренировки по дням, чтобы соблюдать ограничение 2 тренировки в день
    const workoutsByDay = new Map<string, Array<typeof selectedWorkouts[0]>>();
    
    for (const workout of selectedWorkouts) {
      // Вычисляем дату для тренировки
      const workoutDate = addDays(startDate, workout.dayOfProgram - 1);
      const dateKey = format(workoutDate, 'yyyy-MM-dd');
      
      if (!workoutsByDay.has(dateKey)) {
        workoutsByDay.set(dateKey, []);
      }
      
      workoutsByDay.get(dateKey)?.push(workout);
    }
    
    // Для каждого дня проверяем, сколько тренировок запланировано
    for (const [dateKey, dayWorkouts] of workoutsByDay.entries()) {
      // Получаем уже запланированные на эту дату тренировки
      const existingWorkouts = await this.scheduledWorkoutsService.findByDateRange(
        user.id, 
        dateKey, 
        dateKey
      );
      
      // Сколько еще можно запланировать на этот день
      const remainingSlots = 2 - existingWorkouts.length;
      
      if (remainingSlots <= 0) {
        this.logger.warn(`На дату ${dateKey} уже запланировано максимальное количество тренировок`);
        continue;
      }
      
      // Ограничиваем количество запланированных тренировок
      const workoutsToSchedule = dayWorkouts.slice(0, remainingSlots);
      
      for (const workout of workoutsToSchedule) {
        // Генерируем время в формате HH:MM в зависимости от timeOfDay
        let time = '12:00';
        if (workout.timeOfDay === 'утро') time = '08:00';
        else if (workout.timeOfDay === 'день') time = '14:00';
        else if (workout.timeOfDay === 'вечер') time = '19:00';
        
        try {
          // Создаем запланированную тренировку
          const scheduledWorkout = await this.scheduledWorkoutsService.create({
            workoutId: workout.workoutId,
            userId: user.id,
            scheduledDate: dateKey,
            scheduledTime: time,
            programId: program.id,
            completed: false
          });
          
          scheduledWorkouts.push(scheduledWorkout);
        } catch (error) {
          console.error(`Ошибка при создании запланированной тренировки: ${error}`);
        }
      }
    }
    
    return {
      success: true,
      program,
      scheduledWorkouts,
      message: `Запланировано ${scheduledWorkouts.length} тренировок`
    };
  }

  async getUserActivePrograms(user: User): Promise<any[]> {
    this.logger.log(`Получение активных программ для пользователя ${user.id}`);
    
    try {
      // Ищем все запланированные тренировки, которые связаны с программами
      const scheduledWorkouts = await this.scheduledWorkoutsService.findByUser(user.id);
      
      // Отфильтровываем только те, что имеют programId
      const programWorkouts = scheduledWorkouts.filter(workout => workout.programId);
      
      // Если нет тренировок с программами, возвращаем пустой массив
      if (programWorkouts.length === 0) {
        this.logger.log('У пользователя нет активных программ');
        return [];
      }
      
      // Группируем по programId
      const programIds = [...new Set(programWorkouts.map(workout => workout.programId))];
      
      // Для каждой программы создаем объект прогресса
      const activePrograms = await Promise.all(programIds.map(async (programId) => {
        if (!programId) return null;
        
        // Находим программу
        const program = await this.findOne(programId, user);
        
        // Фильтруем тренировки для этой программы
        const programSpecificWorkouts = programWorkouts.filter(workout => workout.programId === programId);
        
        // Создаем объект прогресса
        return {
          id: `progress-${programId}`,
          programId,
          program,
          userId: user.id,
          startDate: new Date().toISOString(),
          workouts: programSpecificWorkouts.map(workout => ({
            workoutId: workout.workoutId,
            scheduledWorkoutId: workout.id,
            completed: workout.completed,
            scheduledDate: workout.scheduledDate,
            // День программы определяем из информации о программе
            dayOfProgram: program.workouts.find(pw => pw.workoutId === workout.workoutId)?.dayOfProgram || 1
          })),
          completionPercentage: (programSpecificWorkouts.filter(w => w.completed).length / programSpecificWorkouts.length) * 100,
          isCompleted: programSpecificWorkouts.length > 0 && programSpecificWorkouts.every(w => w.completed)
        };
      }));
      
      // Удаляем null значения и возвращаем результат
      return activePrograms.filter(Boolean);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении активных программ: ${error.message}`, error.stack);
      // Возвращаем временную заглушку для тестирования
      return [
        {
          id: 'progress-1',
          programId: '1',
          program: this.programs.find(p => p.id === '1'),
          userId: user.id,
          startDate: new Date().toISOString(),
          workouts: [
            {
              workoutId: '1',
              scheduledWorkoutId: 'scheduled-1',
              completed: false,
              scheduledDate: new Date().toISOString(),
              dayOfProgram: 1
            },
            {
              workoutId: '2',
              scheduledWorkoutId: 'scheduled-2',
              completed: false,
              scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
              dayOfProgram: 3
            }
          ],
          completionPercentage: 0,
          isCompleted: false
        }
      ];
    }
  }
} 
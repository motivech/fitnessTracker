import { Controller, Get, Post, Body, Param, Delete, UseGuards, NotFoundException, Logger } from '@nestjs/common';
import { ActiveWorkoutsService } from './active-workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserDec } from '../decorators/user.decorator';
import { User } from '../entities/User';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('Активные тренировки')
@ApiBearerAuth()
@Controller('workouts/active')
@UseGuards(JwtAuthGuard)
export class ActiveWorkoutsController {
  private readonly logger = new Logger(ActiveWorkoutsController.name);
  
  constructor(private readonly activeWorkoutsService: ActiveWorkoutsService) {}

  @ApiOperation({ summary: 'Получение списка активных тренировок пользователя' })
  @ApiResponse({ status: 200, description: 'Список активных тренировок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get()
  async getActiveWorkouts(@UserDec() user: User) {
    return this.activeWorkoutsService.getActiveWorkouts(user.id);
  }

  @ApiOperation({ summary: 'Добавление тренировки в активные' })
  @ApiBody({ schema: { properties: { workoutId: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Тренировка добавлена в активные' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
  @Post()
  async addToActive(
    @Body() data: { workoutId: string },
    @UserDec() user: User,
  ) {
    return this.activeWorkoutsService.addToActive(data.workoutId, user);
  }

  @ApiOperation({ summary: 'Удаление тренировки из активных' })
  @ApiParam({ name: 'id', description: 'ID тренировки' })
  @ApiResponse({ status: 200, description: 'Тренировка удалена из активных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Активная тренировка не найдена' })
  @Delete(':id')
  async removeFromActive(
    @Param('id') id: string,
    @UserDec() user: User,
  ) {
    await this.activeWorkoutsService.removeFromActive(id, user.id);
    return { success: true };
  }

  @ApiOperation({ summary: 'Обновление прогресса тренировки' })
  @ApiBody({
    schema: {
      properties: {
        workoutId: { type: 'string' },
        date: { type: 'string', format: 'date' },
        completedExercises: { type: 'array', items: { type: 'string' } },
        completionPercentage: { type: 'number' },
        notes: { type: 'string' },
        timeSpent: { type: 'number' },
        caloriesBurned: { type: 'number' },
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Прогресс тренировки обновлен' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('progress')
  async updateProgress(
    @Body() data: {
      workoutId: string;
      date: string;
      completedExercises: string[];
      completionPercentage: number;
      notes?: string;
      timeSpent?: number;
      caloriesBurned?: number;
    },
    @UserDec() user: User,
  ) {
    return this.activeWorkoutsService.updateProgress(data, user.id);
  }

  @ApiOperation({ summary: 'Завершение тренировки с сохранением в историю' })
  @ApiBody({
    schema: {
      properties: {
        workoutId: { type: 'string' },
        date: { type: 'string', format: 'date' },
        completedExercises: { 
          type: 'array', 
          items: { 
            type: 'object',
            properties: {
              exerciseId: { type: 'string' },
              sets: { type: 'number' },
              reps: { type: 'number' },
              weight: { type: 'number' },
              duration: { type: 'number' },
              completed: { type: 'boolean' }
            }
          } 
        },
        completionPercentage: { type: 'number' },
        caloriesBurned: { type: 'number' },
        timeSpent: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Тренировка успешно завершена и сохранена в историю' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('complete')
  async completeWorkout(
    @Body() data: {
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
    },
    @UserDec() user: User,
  ) {
    this.logger.log(`Запрос на завершение тренировки ${data.workoutId} от пользователя ${user.id}`);
    return this.activeWorkoutsService.completeWorkout(data, user.id);
  }
} 
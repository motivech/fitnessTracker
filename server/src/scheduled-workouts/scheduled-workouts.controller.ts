import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  UnauthorizedException,
  Patch,
  Logger,
  InternalServerErrorException
} from '@nestjs/common';
import { ScheduledWorkoutsService } from './scheduled-workouts.service';
import { ScheduledWorkout } from '../entities/ScheduledWorkout';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserDec } from '../decorators/user.decorator';
import { User } from '../entities/User';

@Controller('scheduled-workouts')
export class ScheduledWorkoutsController {
  private readonly logger = new Logger(ScheduledWorkoutsController.name);
  
  constructor(private readonly scheduledWorkoutsService: ScheduledWorkoutsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@UserDec() user: User): Promise<ScheduledWorkout[]> {
    try {
      this.logger.log(`Получение всех запланированных тренировок для пользователя: ${user.id}`);
      return await this.scheduledWorkoutsService.findByUser(user.id);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении тренировок: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении запланированных тренировок');
    }
  }

  @Get('calendar')
  @UseGuards(JwtAuthGuard)
  async findByDateRange(
    @UserDec() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ScheduledWorkout[]> {
    try {
      this.logger.log(`Получение тренировок в диапазоне дат для пользователя: ${user.id}, с ${startDate} по ${endDate}`);
      return await this.scheduledWorkoutsService.findByDateRange(
        user.id, 
        startDate, 
        endDate
      );
    } catch (error: any) {
      this.logger.error(`Ошибка при получении тренировок в диапазоне дат: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении тренировок в диапазоне дат');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @UserDec() user: User
  ): Promise<ScheduledWorkout> {
    try {
      this.logger.log(`Получение тренировки по ID: ${id} для пользователя: ${user.id}`);
      const scheduledWorkout = await this.scheduledWorkoutsService.findOne(id);
      if (scheduledWorkout.userId !== user.id) {
        this.logger.warn(`Попытка доступа к чужой тренировке ${id} пользователем ${user.id}`);
        throw new UnauthorizedException('Вы не имеете доступа к этой тренировке');
      }
      return scheduledWorkout;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Ошибка при получении тренировки: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении тренировки');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() data: Partial<ScheduledWorkout>,
    @UserDec() user: User
  ): Promise<ScheduledWorkout> {
    try {
      this.logger.log(`Создание новой запланированной тренировки для пользователя: ${user.id}`);
      // Важно: явно устанавливаем идентификатор пользователя
      data.userId = user.id;
      
      // Проверка наличия необходимых данных
      if (!data.workoutId) {
        throw new Error('workoutId обязателен');
      }
      if (!data.scheduledDate) {
        throw new Error('scheduledDate обязателен');
      }
      if (!data.scheduledTime) {
        throw new Error('scheduledTime обязателен');
      }
      
      // Преобразуем числовой workoutId в UUID, если необходимо
      if (typeof data.workoutId === 'number' || /^\d+$/.test(data.workoutId)) {
        this.logger.debug(`Преобразование числового ID ${data.workoutId} в формат UUID`);
        data.workoutId = `00000000-0000-0000-0000-00000000000${data.workoutId}`.slice(-36);
      }
      
      this.logger.debug(`Данные для создания: workoutId=${data.workoutId}, date=${data.scheduledDate}, time=${data.scheduledTime}`);
      return await this.scheduledWorkoutsService.create(data);
    } catch (error: any) {
      this.logger.error(`Ошибка при создании тренировки: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Ошибка при создании запланированной тренировки: ${error.message}`);
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ScheduledWorkout>,
    @UserDec() user: User
  ): Promise<ScheduledWorkout> {
    try {
      this.logger.log(`Обновление тренировки: ${id} пользователем: ${user.id}`);
      const scheduledWorkout = await this.scheduledWorkoutsService.findOne(id);
      if (scheduledWorkout.userId !== user.id) {
        this.logger.warn(`Попытка обновления чужой тренировки ${id} пользователем ${user.id}`);
        throw new UnauthorizedException('Вы не имеете доступа к этой тренировке');
      }
      return await this.scheduledWorkoutsService.update(id, data);
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Ошибка при обновлении тренировки: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при обновлении тренировки');
    }
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  async markCompleted(
    @Param('id') id: string,
    @UserDec() user: User
  ): Promise<ScheduledWorkout> {
    try {
      this.logger.log(`Отметка тренировки как выполненной: ${id} пользователем: ${user.id}`);
      const scheduledWorkout = await this.scheduledWorkoutsService.findOne(id);
      if (scheduledWorkout.userId !== user.id) {
        this.logger.warn(`Попытка отметки чужой тренировки ${id} пользователем ${user.id}`);
        throw new UnauthorizedException('Вы не имеете доступа к этой тренировке');
      }
      return await this.scheduledWorkoutsService.markCompleted(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Ошибка при отметке выполнения тренировки: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при отметке тренировки как выполненной');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @UserDec() user: User
  ): Promise<void> {
    try {
      this.logger.log(`Удаление тренировки: ${id} пользователем: ${user.id}`);
      const scheduledWorkout = await this.scheduledWorkoutsService.findOne(id);
      if (scheduledWorkout.userId !== user.id) {
        this.logger.warn(`Попытка удаления чужой тренировки ${id} пользователем ${user.id}`);
        throw new UnauthorizedException('Вы не имеете доступа к этой тренировке');
      }
      return await this.scheduledWorkoutsService.remove(id);
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Ошибка при удалении тренировки: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при удалении тренировки');
    }
  }
} 
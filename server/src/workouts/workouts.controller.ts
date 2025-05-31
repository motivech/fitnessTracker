import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../entities/User';
import { Logger } from '@nestjs/common';

@ApiTags('Тренировки')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
    private readonly logger = new Logger(WorkoutsController.name);

    constructor(private readonly workoutsService: WorkoutsService) {}

    @Get()
    @ApiOperation({ summary: 'Получить все тренировки пользователя' })
    @ApiResponse({ status: 200, description: 'Список тренировок' })
    async findAll(
        @Request() req: { user: { id: string } },
        @Query('includePublic') includePublic?: string,
        @Query('createdByUser') createdByUser?: string,
        @Query('excludeCompleted') excludeCompleted?: string
    ) {
        try {
            const shouldIncludePublic = includePublic === 'true';
            const shouldFilterByCreatedUser = createdByUser === 'true';
            const shouldExcludeCompleted = excludeCompleted === 'true';
            
            this.logger.log(`Запрос на получение тренировок. includePublic: ${shouldIncludePublic}, createdByUser: ${shouldFilterByCreatedUser}, excludeCompleted: ${shouldExcludeCompleted}`);
            
            const workouts = await this.workoutsService.findAll(
                req.user.id, 
                shouldIncludePublic, 
                shouldFilterByCreatedUser,
                shouldExcludeCompleted
            );
            
            this.logger.log(`Получено ${workouts.length} тренировок для пользователя ${req.user.id}`);
            
            // Проверим наличие упражнений в тренировках
            if (workouts.length > 0) {
                const firstWorkout = workouts[0];
                this.logger.log(`Пример тренировки: ${firstWorkout.name}, ID: ${firstWorkout.id}`);
                this.logger.log(`Упражнения: ${firstWorkout.workoutExercises?.length || 0}`);
                
                if (firstWorkout.workoutExercises && firstWorkout.workoutExercises.length > 0) {
                    this.logger.log(`Первое упражнение: ${firstWorkout.workoutExercises[0].exerciseId}`);
                }
            }
            
            return workouts;
        } catch (error: any) {
            this.logger.error(`Ошибка при получении тренировок: ${error.message}`);
            throw error;
        }
    }

    @Get('active')
    @ApiOperation({ summary: 'Получить активные тренировки пользователя' })
    @ApiResponse({ status: 200, description: 'Список активных тренировок' })
    async getActiveWorkouts(@Request() req: { user: { id: string } }) {
        return this.workoutsService.getActiveWorkouts(req.user.id);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Получить статистику тренировок пользователя' })
    @ApiResponse({ status: 200, description: 'Статистика тренировок' })
    async getWorkoutStats(@Request() req: { user: { id: string } }) {
        return this.workoutsService.getWorkoutStats(req.user.id);
    }

    @Get('completed')
    @ApiOperation({ summary: 'Получить завершенные тренировки пользователя' })
    @ApiResponse({ status: 200, description: 'Список завершенных тренировок' })
    async getCompletedWorkouts(@Request() req: { user: { id: string } }) {
        return this.workoutsService.getCompletedWorkouts(req.user.id);
    }

    @ApiOperation({ summary: 'Получить общедоступные тренировки' })
    @ApiResponse({ status: 200, description: 'Список общедоступных тренировок' })
    @Get('public')
    async getPublicWorkouts(@Query('type') type?: string) {
        try {
            this.logger.log(`Запрос на получение общедоступных тренировок${type ? ` типа ${type}` : ''}`);
            const workouts = await this.workoutsService.getPublicWorkouts(type);
            
            this.logger.log(`Получено ${workouts.length} общедоступных тренировок`);
            if (workouts.length > 0) {
                this.logger.log(`Первая тренировка: ${workouts[0].name}, created by: ${workouts[0].userId}`);
            }
            
            return workouts;
        } catch (error: any) {
            this.logger.error(`Ошибка при получении общедоступных тренировок: ${error.message}`);
            throw error;
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить тренировку по ID' })
    @ApiResponse({ status: 200, description: 'Тренировка найдена' })
    @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
    async findOne(
        @Param('id') id: string,
        @Request() req: { user: { id: string } }
    ) {
        return this.workoutsService.findOne(id, req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Создать новую тренировку' })
    @ApiResponse({ status: 201, description: 'Тренировка создана' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    async create(
        @Body() createWorkoutDto: CreateWorkoutDto,
        @Request() req: { user: { id: string } }
    ) {
        return this.workoutsService.create(createWorkoutDto, req.user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить тренировку' })
    @ApiResponse({ status: 200, description: 'Тренировка обновлена' })
    @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
    async update(
        @Param('id') id: string,
        @Body() updateWorkoutDto: UpdateWorkoutDto,
        @Request() req: { user: { id: string } }
    ) {
        return this.workoutsService.update(id, updateWorkoutDto, req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить тренировку' })
    @ApiResponse({ status: 200, description: 'Тренировка удалена' })
    @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
    async remove(
        @Param('id') id: string,
        @Request() req: { user: { id: string } }
    ) {
        return this.workoutsService.remove(id, req.user.id);
    }

    @ApiOperation({ summary: 'Добавление тренировки в активные' })
    @ApiBody({ schema: { properties: { workoutId: { type: 'string' } } } })
    @ApiResponse({ status: 201, description: 'Тренировка успешно добавлена в активные' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
    @Post('active')
    addToActive(
        @Body() data: { workoutId: string },
        @Request() req: { user: { id: string } },
    ) {
        return this.workoutsService.addToActive(data.workoutId, req.user.id);
    }

    @ApiOperation({ summary: 'Удаление тренировки из активных' })
    @ApiParam({ name: 'id', description: 'Идентификатор тренировки', type: 'string' })
    @ApiResponse({ status: 200, description: 'Тренировка успешно удалена из активных' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Активная тренировка не найдена' })
    @Delete('active/:id')
    removeFromActive(
        @Param('id') id: string,
        @Request() req: { user: { id: string } },
    ) {
        return this.workoutsService.removeFromActive(id, req.user.id);
    }

    @ApiOperation({ summary: 'Обновление прогресса тренировки' })
    @ApiBody({ 
        schema: { 
            properties: { 
                workoutId: { type: 'string' },
                date: { type: 'string', format: 'date' },
                completedExercises: { type: 'array', items: { type: 'string' } },
                completionPercentage: { type: 'number' }
            } 
        } 
    })
    @ApiResponse({ status: 201, description: 'Прогресс тренировки успешно обновлен' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Post('progress')
    updateProgress(
        @Body() data: { 
            workoutId: string;
            date: string;
            completedExercises: string[];
            completionPercentage: number;
        },
        @Request() req: { user: { id: string } },
    ) {
        return this.workoutsService.updateProgress(data, req.user.id);
    }

    @Post('schedule')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Запланировать тренировку' })
    @ApiResponse({ status: 201, description: 'Тренировка успешно запланирована' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
    async scheduleWorkout(
        @Request() req: { user: { id: string } },
        @Body() scheduleDto: { workoutId: string; date: string; time: string }
    ) {
        return this.workoutsService.scheduleWorkout(req.user.id, scheduleDto);
    }

    @Get(':id/details')
    @ApiOperation({ summary: 'Получить детальную информацию о тренировке включая упражнения' })
    @ApiResponse({ status: 200, description: 'Детальная информация о тренировке' })
    @ApiResponse({ status: 404, description: 'Тренировка не найдена' })
    async getWorkoutDetails(
        @Param('id') id: string,
        @Request() req: { user: { id: string } }
    ) {
        try {
            this.logger.log(`Запрос на получение деталей тренировки: ${id} для пользователя ${req.user.id}`);
            const workout = await this.workoutsService.findOne(id, req.user.id);
            
            if (workout) {
                this.logger.log(`Тренировка ${workout.name} (${id}) получена успешно`);
                this.logger.log(`Количество упражнений: ${workout.workoutExercises?.length || 0}`);
                
                if (workout.workoutExercises && workout.workoutExercises.length > 0) {
                    this.logger.log(`Первое упражнение: ${workout.workoutExercises[0].exerciseId}`);
                }
            }
            
            return workout;
        } catch (error: any) {
            this.logger.error(`Ошибка при получении деталей тренировки ${id}: ${error.message}`);
            throw error;
        }
    }
} 
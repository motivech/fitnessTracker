import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExerciseType, MuscleGroup } from '../entities/Exercise';

@ApiTags('Упражнения')
@ApiBearerAuth()
@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
    constructor(private readonly exercisesService: ExercisesService) {}

    @ApiOperation({ summary: 'Создание нового упражнения' })
    @ApiBody({ type: CreateExerciseDto })
    @ApiResponse({ status: 201, description: 'Упражнение успешно создано' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Post()
    create(@Body() createExerciseDto: CreateExerciseDto) {
        return this.exercisesService.create(createExerciseDto);
    }

    @ApiOperation({ summary: 'Получение всех упражнений с возможностью фильтрации' })
    @ApiQuery({ name: 'type', enum: ExerciseType, required: false })
    @ApiQuery({ name: 'muscleGroup', enum: MuscleGroup, required: false })
    @ApiResponse({ status: 200, description: 'Список упражнений' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Get()
    findAll(
        @Query('type') type?: ExerciseType,
        @Query('muscleGroup') muscleGroup?: MuscleGroup
    ) {
        return this.exercisesService.findAll({ type, muscleGroup });
    }

    @ApiOperation({ summary: 'Получение упражнения по ID' })
    @ApiParam({ name: 'id', description: 'Идентификатор упражнения', type: 'string' })
    @ApiResponse({ status: 200, description: 'Информация об упражнении' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Упражнение не найдено' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.exercisesService.findOne(id);
    }

    @ApiOperation({ summary: 'Обновление упражнения' })
    @ApiParam({ name: 'id', description: 'Идентификатор упражнения', type: 'string' })
    @ApiBody({ type: UpdateExerciseDto })
    @ApiResponse({ status: 200, description: 'Упражнение успешно обновлено' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Упражнение не найдено' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
        return this.exercisesService.update(id, updateExerciseDto);
    }

    @ApiOperation({ summary: 'Удаление упражнения' })
    @ApiParam({ name: 'id', description: 'Идентификатор упражнения', type: 'string' })
    @ApiResponse({ status: 200, description: 'Упражнение успешно удалено' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Упражнение не найдено' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.exercisesService.remove(id);
    }
} 
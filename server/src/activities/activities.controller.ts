import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../entities/User';

@ApiTags('Активность')
@ApiBearerAuth()
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) {}

    @ApiOperation({ summary: 'Создание новой записи активности' })
    @ApiBody({ type: CreateActivityDto })
    @ApiResponse({ status: 201, description: 'Активность успешно создана' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Post()
    create(@Body() createActivityDto: CreateActivityDto, @Request() req: { user: User }) {
        return this.activitiesService.create(createActivityDto, req.user);
    }

    @ApiOperation({ summary: 'Получение всех записей активности' })
    @ApiResponse({ status: 200, description: 'Список активностей' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Get()
    findAll(@Request() req: { user: User }) {
        return this.activitiesService.findAll(req.user);
    }

    @ApiOperation({ summary: 'Статистика активности' })
    @ApiResponse({ status: 200, description: 'Статистика активности' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Get('stats')
    getStats(@Request() req: { user: User }) {
        return this.activitiesService.getActivityStats(req.user);
    }

    @ApiOperation({ summary: 'Получение активности по ID' })
    @ApiParam({ name: 'id', description: 'Идентификатор активности', type: 'string' })
    @ApiResponse({ status: 200, description: 'Информация об активности' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Активность не найдена' })
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: { user: User }) {
        return this.activitiesService.findOne(id, req.user);
    }

    @ApiOperation({ summary: 'Обновление активности' })
    @ApiParam({ name: 'id', description: 'Идентификатор активности', type: 'string' })
    @ApiBody({ type: UpdateActivityDto })
    @ApiResponse({ status: 200, description: 'Активность успешно обновлена' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Активность не найдена' })
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateActivityDto: UpdateActivityDto,
        @Request() req: { user: User },
    ) {
        return this.activitiesService.update(id, updateActivityDto, req.user);
    }

    @ApiOperation({ summary: 'Удаление активности' })
    @ApiParam({ name: 'id', description: 'Идентификатор активности', type: 'string' })
    @ApiResponse({ status: 200, description: 'Активность успешно удалена' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Активность не найдена' })
    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: { user: User }) {
        return this.activitiesService.remove(id, req.user);
    }
} 
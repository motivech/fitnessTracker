import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
    user: {
        id: string;
        email: string;
    };
}

@ApiTags('Вызовы')
@ApiBearerAuth()
@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) {}

    @ApiOperation({ summary: 'Создание нового вызова' })
    @ApiBody({ type: CreateChallengeDto })
    @ApiResponse({ status: 201, description: 'Вызов успешно создан' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Post()
    async create(@Body() createChallengeDto: CreateChallengeDto, @Request() req: RequestWithUser) {
        return this.challengesService.create(createChallengeDto, req.user.id);
    }

    @ApiOperation({ summary: 'Получение всех вызовов' })
    @ApiResponse({ status: 200, description: 'Список вызовов' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @Get()
    async findAll() {
        return this.challengesService.findAll();
    }

    @ApiOperation({ summary: 'Получение вызова по ID' })
    @ApiParam({ name: 'id', description: 'Идентификатор вызова', type: 'string' })
    @ApiResponse({ status: 200, description: 'Информация о вызове' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Вызов не найден' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.challengesService.findOne(id);
    }

    @ApiOperation({ summary: 'Присоединение к вызову' })
    @ApiParam({ name: 'id', description: 'Идентификатор вызова', type: 'string' })
    @ApiResponse({ status: 200, description: 'Успешное присоединение к вызову' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Вызов не найден' })
    @Post(':id/join')
    async joinChallenge(@Param('id') id: string, @Request() req: RequestWithUser) {
        return this.challengesService.joinChallenge(id, req.user.id);
    }

    @ApiOperation({ summary: 'Прогресс вызова' })
    @ApiParam({ name: 'id', description: 'Идентификатор вызова', type: 'string' })
    @ApiResponse({ status: 200, description: 'Прогресс вызова' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Вызов не найден' })
    @Get(':id/progress')
    async getChallengeProgress(@Param('id') id: string) {
        return this.challengesService.getChallengeProgress(id);
    }

    @ApiOperation({ summary: 'Таблица лидеров вызова' })
    @ApiParam({ name: 'id', description: 'Идентификатор вызова', type: 'string' })
    @ApiResponse({ status: 200, description: 'Таблица лидеров' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiResponse({ status: 404, description: 'Вызов не найден' })
    @Get(':id/leaderboard')
    async getLeaderboard(@Param('id') id: string) {
        return this.challengesService.getLeaderboard(id);
    }
} 
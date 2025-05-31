import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  Logger,
  InternalServerErrorException
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserDec } from '../decorators/user.decorator';
import { User } from '../entities/User';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Достижения')
@ApiBearerAuth()
@Controller('achievements')
export class AchievementsController {
  private readonly logger = new Logger(AchievementsController.name);
  
  constructor(
    private readonly achievementsService: AchievementsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    // Добавляем автоматическую инициализацию очков для существующих пользователей
    this.initializeUsersPoints();
  }

  private async initializeUsersPoints() {
    try {
      // Получаем всех пользователей без очков
      const usersWithoutPoints = await this.userRepository.find({
        where: { points: 0 }
      });

      if (usersWithoutPoints.length > 0) {
        this.logger.log(`Обнаружено ${usersWithoutPoints.length} пользователей без очков. Инициализируем базовые очки...`);
        
        // Добавляем базовые очки для каждого пользователя
        for (const user of usersWithoutPoints) {
          // Добавляем базовое количество очков (30-100)
          const basePoints = Math.floor(Math.random() * 70) + 30;
          user.points = basePoints;
          user.calculateLevel(); // Пересчитываем уровень
          
          await this.userRepository.save(user);
          
          // Проверяем достижения после добавления очков
          await this.achievementsService.checkAndAwardAchievements(user);
        }
        
        this.logger.log('Базовые очки успешно добавлены пользователям');
      }
    } catch (error) {
      this.logger.error('Ошибка при инициализации очков пользователей:', error);
    }
  }

  @ApiOperation({ summary: 'Создать новое достижение' })
  @ApiResponse({ status: 201, description: 'Достижение успешно создано' })
  @Post()
  async create(@Body() createAchievementDto: CreateAchievementDto) {
    this.logger.log(`Создание нового достижения: ${createAchievementDto.name}`);
    return await this.achievementsService.create(createAchievementDto);
  }

  @ApiOperation({ summary: 'Получить все достижения' })
  @ApiResponse({ status: 200, description: 'Список всех достижений' })
  @Get()
  async findAll() {
    try {
      this.logger.log('Получение списка всех достижений');
      return await this.achievementsService.getAllAchievements();
    } catch (error: any) {
      this.logger.error(`Ошибка при получении достижений: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении списка достижений');
    }
  }

  @ApiOperation({ summary: 'Получить достижения пользователя' })
  @ApiResponse({ status: 200, description: 'Список достижений пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getUserAchievements(@UserDec() user: User) {
    try {
      this.logger.log(`Получение достижений для пользователя: ${user.id}`);
      return await this.achievementsService.getUserAchievements(user);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении достижений пользователя: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении достижений пользователя');
    }
  }

  @ApiOperation({ summary: 'Проверить и обновить достижения пользователя' })
  @ApiResponse({ status: 200, description: 'Список новых достижений пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('check')
  async checkAchievements(@UserDec() user: User) {
    try {
      this.logger.log(`Проверка достижений для пользователя: ${user.id}`);
      return await this.achievementsService.checkAndAwardAchievements(user);
    } catch (error: any) {
      this.logger.error(`Ошибка при проверке достижений: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при проверке достижений');
    }
  }

  @ApiOperation({ summary: 'Получить таблицу лидеров' })
  @ApiResponse({ status: 200, description: 'Таблица лидеров по очкам достижений' })
  @UseGuards(JwtAuthGuard)
  @Get('leaderboard')
  async getLeaderboard() {
    try {
      this.logger.log('Получение таблицы лидеров');
      return await this.achievementsService.getLeaderboard();
    } catch (error: any) {
      this.logger.error(`Ошибка при получении таблицы лидеров: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении таблицы лидеров');
    }
  }

  @ApiOperation({ summary: 'Получить статистику пользователя для достижений' })
  @ApiResponse({ status: 200, description: 'Статистика пользователя для расчета прогресса достижений' })
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getUserStats(@UserDec() user: User) {
    try {
      this.logger.log(`Получение статистики для пользователя: ${user.id}`);
      return await this.achievementsService.getUserStats(user);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении статистики пользователя: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении статистики пользователя');
    }
  }

  @ApiOperation({ summary: 'Получить конкретное достижение по ID' })
  @ApiResponse({ status: 200, description: 'Информация о достижении' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`Получение информации о достижении: ${id}`);
      // Метод findOne отсутствует в сервисе, будем использовать реализацию с поиском по ID
      const achievements = await this.achievementsService.getAllAchievements();
      const achievement = achievements.find(a => a.id === id);
      
      if (!achievement) {
        throw new Error('Достижение не найдено');
      }
      
      return achievement;
    } catch (error: any) {
      this.logger.error(`Ошибка при получении информации о достижении: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении информации о достижении');
    }
  }

  @ApiOperation({ summary: 'Получить все достижения с прогрессом выполнения' })
  @ApiResponse({ status: 200, description: 'Список всех достижений с прогрессом выполнения для текущего пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('progress')
  async getAchievementsWithProgress(@UserDec() user: User) {
    try {
      this.logger.log(`Получение достижений с прогрессом для пользователя: ${user.id}`);
      return await this.achievementsService.getAchievementsWithProgress(user.id);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении достижений с прогрессом: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при получении достижений с прогрессом');
    }
  }
} 
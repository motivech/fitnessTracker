import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User as UserDec } from '../decorators/user.decorator';
import { User } from '../entities/User';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { Logger } from '@nestjs/common';

@ApiTags('Программы тренировок')
@ApiBearerAuth()
@Controller('programs')
@UseGuards(JwtAuthGuard)
export class ProgramsController {
  private readonly logger = new Logger(ProgramsController.name);

  constructor(private readonly programsService: ProgramsService) {}

  @ApiOperation({ summary: 'Получение всех программ тренировок' })
  @ApiResponse({ status: 200, description: 'Список программ тренировок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get()
  async findAll(@UserDec() user: User) {
    return this.programsService.findAll(user);
  }

  @ApiOperation({ summary: 'Получение программы тренировок по ID' })
  @ApiParam({ name: 'id', description: 'ID программы' })
  @ApiResponse({ status: 200, description: 'Данные программы тренировок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Программа не найдена' })
  @Get(':id')
  async findOne(@Param('id') id: string, @UserDec() user: User) {
    return this.programsService.findOne(id, user);
  }

  @ApiOperation({ summary: 'Создание новой программы тренировок' })
  @ApiResponse({ status: 201, description: 'Программа успешно создана' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post()
  async create(@Body() data: any, @UserDec() user: User) {
    return this.programsService.create(data, user);
  }

  @ApiOperation({ summary: 'Обновление программы тренировок' })
  @ApiParam({ name: 'id', description: 'ID программы' })
  @ApiResponse({ status: 200, description: 'Программа успешно обновлена' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Программа не найдена' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @UserDec() user: User) {
    return this.programsService.update(id, data, user);
  }

  @ApiOperation({ summary: 'Удаление программы тренировок' })
  @ApiParam({ name: 'id', description: 'ID программы' })
  @ApiResponse({ status: 200, description: 'Программа успешно удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Программа не найдена' })
  @Delete(':id')
  async remove(@Param('id') id: string, @UserDec() user: User) {
    await this.programsService.remove(id, user);
    return { success: true };
  }

  @ApiOperation({ summary: 'Запуск программы тренировок' })
  @ApiBody({
    schema: {
      properties: {
        programId: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        workoutIds: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Программа успешно запущена' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Программа не найдена' })
  @Post('start')
  async startProgram(
    @Body() data: {
      programId: string;
      startDate: string;
      workoutIds: string[];
    },
    @UserDec() user: User
  ) {
    this.logger.log(`Запуск программы тренировок: programId=${data.programId}, startDate=${data.startDate}, тренировок=${data.workoutIds.length}`);
    return this.programsService.startProgram(data, user);
  }

  @ApiOperation({ summary: 'Получение активных программ пользователя' })
  @ApiResponse({ status: 200, description: 'Список активных программ пользователя' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('active')
  async getUserActivePrograms(@UserDec() user: User) {
    this.logger.log(`Получение активных программ для пользователя: ${user.id}`);
    const activePrograms = await this.programsService.getUserActivePrograms(user);
    this.logger.log(`Найдено ${activePrograms.length} активных программ`);
    return activePrograms;
  }
} 
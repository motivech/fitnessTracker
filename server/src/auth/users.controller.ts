import { Controller, Get, Put, Post, Body, UseGuards, Logger, InternalServerErrorException, NotFoundException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User as UserDec } from '../decorators/user.decorator';
import { User } from '../entities/User';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserSettingsDto } from './dto/update-settings.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Пользователи')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Получить профиль пользователя' })
  @ApiResponse({ status: 200, description: 'Профиль успешно получен' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@UserDec() user: User) {
    try {
      this.logger.log(`Получение профиля пользователя с ID: ${user.id}`);
      return await this.usersService.getUserProfile(user.id);
    } catch (error: any) {
      this.logger.error(`Ошибка при получении профиля пользователя: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Ошибка при получении профиля пользователя');
    }
  }

  @ApiOperation({ summary: 'Обновить информацию профиля' })
  @ApiResponse({ status: 200, description: 'Профиль успешно обновлен' })
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@UserDec() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    try {
      this.logger.log(`Обновление профиля пользователя с ID: ${user.id}`);
      return await this.usersService.updateProfile(user.id, updateProfileDto);
    } catch (error: any) {
      this.logger.error(`Ошибка при обновлении профиля пользователя: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Ошибка при обновлении профиля пользователя');
    }
  }

  @ApiOperation({ summary: 'Обновить настройки пользователя' })
  @ApiResponse({ status: 200, description: 'Настройки успешно обновлены' })
  @UseGuards(JwtAuthGuard)
  @Put('settings')
  async updateSettings(@UserDec() user: User, @Body() updateSettingsDto: UpdateUserSettingsDto) {
    try {
      this.logger.log(`Обновление настроек пользователя с ID: ${user.id}`);
      return await this.usersService.updateSettings(user.id, updateSettingsDto);
    } catch (error: any) {
      this.logger.error(`Ошибка при обновлении настроек пользователя: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Ошибка при обновлении настроек пользователя');
    }
  }
  
  @ApiOperation({ summary: 'Загрузить аватар пользователя' })
  @ApiResponse({ status: 200, description: 'Аватар успешно загружен' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: (error: Error | null, destination: string) => void) => {
        const uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
        
        // Создаем директорию, если она не существует
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
      },
      filename: (_req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // Генерируем уникальное имя файла
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, fileName);
      },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
      // Проверяем тип файла
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new InternalServerErrorException('Только изображения форматов JPG, PNG, GIF и WebP могут быть загружены'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB - максимальный размер файла
    },
  }))
  async uploadAvatar(@UserDec() user: User, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new InternalServerErrorException('Файл не был загружен');
      }
      
      this.logger.log(`Загрузка аватара для пользователя с ID: ${user.id}`);
      
      // Получаем публичный URL для файла
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      
      // Обновляем аватар пользователя
      await this.usersService.updateProfile(user.id, { avatar: avatarUrl });
      
      return { avatarUrl };
    } catch (error: any) {
      this.logger.error(`Ошибка при загрузке аватара: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Ошибка при загрузке аватара');
    }
  }
} 
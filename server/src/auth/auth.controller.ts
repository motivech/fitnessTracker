import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../entities/User';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Пользователь успешно зарегистрирован' 
    })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    @ApiResponse({ status: 409, description: 'Пользователь с таким email уже существует' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @ApiOperation({ summary: 'Вход в систему' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Успешная аутентификация',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Неправильный email или пароль' })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @ApiOperation({ summary: 'Получение профиля пользователя' })
    @ApiResponse({ 
        status: 200, 
        description: 'Профиль пользователя'
    })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    @ApiBearerAuth()
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req: { user: User }) {
        return req.user;
    }
} 
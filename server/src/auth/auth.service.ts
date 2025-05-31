import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ) {}

    async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
        const { email, password, ...userData } = registerDto;

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new UnauthorizedException('Пользователь с таким email уже существует');
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем нового пользователя
        const user = this.userRepository.create({
            ...userData,
            email,
            password: hashedPassword,
        });

        await this.userRepository.save(user);

        // Генерируем JWT токен
        const token = this.jwtService.sign({ userId: user.id });

        return { user, token };
    }

    async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
        const { email, password } = loginDto;
        this.logger.log(`Попытка входа для пользователя: ${email}`);

        // Находим пользователя по email
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            this.logger.warn(`Пользователь с email ${email} не найден`);
            throw new UnauthorizedException('Неверный email или пароль');
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Неверный пароль для пользователя ${email}`);
            throw new UnauthorizedException('Неверный email или пароль');
        }

        // Генерируем JWT токен
        const token = this.jwtService.sign({ userId: user.id });
        this.logger.log(`Успешный вход пользователя: ${email}`);

        // Очищаем пароль перед отправкой
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword as User, token };
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
        }
        return user;
    }
} 
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
    
    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
        const user = await this.findById(userId);
        
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }
        
        // Обновляем основные данные профиля
        if (updateProfileDto.firstName !== undefined) {
            user.firstName = updateProfileDto.firstName;
        }
        
        if (updateProfileDto.lastName !== undefined) {
            user.lastName = updateProfileDto.lastName;
        }
        
        if (updateProfileDto.age !== undefined) {
            user.age = updateProfileDto.age;
        }
        
        if (updateProfileDto.weight !== undefined) {
            user.weight = updateProfileDto.weight;
        }
        
        if (updateProfileDto.height !== undefined) {
            user.height = updateProfileDto.height;
        }
        
        if (updateProfileDto.bio !== undefined) {
            user.bio = updateProfileDto.bio;
        }
        
        if (updateProfileDto.avatar !== undefined) {
            user.avatar = updateProfileDto.avatar;
        }
        
        return this.userRepository.save(user);
    }
    
    async updateSettings(userId: string, settingsDto: UpdateUserSettingsDto): Promise<User> {
        const user = await this.findById(userId);
        
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }
        
        // Обновляем настройки пользователя, создавая объект settings, если его нет
        if (!user.settings) {
            user.settings = {};
        }
        
        if (settingsDto.theme !== undefined) {
            user.settings.theme = settingsDto.theme;
        }
        
        if (settingsDto.measurementSystem !== undefined) {
            user.settings.measurementSystem = settingsDto.measurementSystem;
        }
        
        if (settingsDto.notifications !== undefined) {
            user.settings.notifications = settingsDto.notifications;
        }
        
        return this.userRepository.save(user);
    }
    
    async getUserProfile(userId: string): Promise<User> {
        const user = await this.findById(userId);
        
        if (!user) {
            throw new NotFoundException(`Пользователь с ID ${userId} не найден`);
        }
        
        return user;
    }
} 
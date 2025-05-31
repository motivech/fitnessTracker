import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { Achievement } from '../entities/Achievement';
import { User } from '../entities/User';
import { Workout } from '../entities/Workout';
import { ModuleRef } from '@nestjs/core';
import { SeedAchievements } from './seed-achievements';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Achievement, User, Workout]),
        NotificationsModule,
    ],
    controllers: [AchievementsController],
    providers: [AchievementsService, SeedAchievements],
    exports: [AchievementsService],
})
export class AchievementsModule implements OnModuleInit {
    constructor(private moduleRef: ModuleRef) {}

    async onModuleInit() {
        // Получаем сервис инициализации достижений
        const seedAchievements = this.moduleRef.get(SeedAchievements, { strict: false });
        
        // Запускаем инициализацию
        await this.initializeAchievements(seedAchievements);
    }

    private async initializeAchievements(seedAchievements: SeedAchievements) {
        try {
            await seedAchievements.seed();
        } catch (error) {
            console.error('Ошибка при инициализации достижений:', error);
        }
    }
} 
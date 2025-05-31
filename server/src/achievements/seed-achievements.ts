import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Achievement, AchievementType, AchievementRequirement } from '../entities/Achievement';

@Injectable()
export class SeedAchievements {
    private readonly logger = new Logger(SeedAchievements.name);
    
    constructor(
        @InjectRepository(Achievement)
        private achievementRepository: Repository<Achievement>,
    ) {}
    
    async seed() {
        const achievementsCount = await this.achievementRepository.count({
            where: { userId: IsNull() } // Считаем только глобальные достижения
        });
        
        // Если уже есть достижения, не создаем новые
        if (achievementsCount > 0) {
            this.logger.log(`Уже существует ${achievementsCount} достижений. Пропускаем инициализацию.`);
            return;
        }
        
        this.logger.log('Инициализация базовых достижений...');
        
        // Массив с базовыми достижениями
        const baseAchievements = [
            // Достижения за тренировки
            {
                name: 'Первая тренировка',
                description: 'Выполните свою первую тренировку',
                type: AchievementType.WORKOUT,
                points: 10,
                requirements: { metric: 'total_workouts' as const, value: 1 },
                icon: '🏋️'
            },
            {
                name: 'Любитель фитнеса',
                description: 'Выполните 5 тренировок',
                type: AchievementType.WORKOUT,
                points: 25,
                requirements: { metric: 'total_workouts' as const, value: 5 },
                icon: '🏃'
            },
            {
                name: 'На пути к силе',
                description: 'Выполните 10 тренировок',
                type: AchievementType.WORKOUT,
                points: 50,
                requirements: { metric: 'total_workouts' as const, value: 10 },
                icon: '💪'
            },
            {
                name: 'Целеустремленность',
                description: 'Выполните 25 тренировок',
                type: AchievementType.WORKOUT,
                points: 100,
                requirements: { metric: 'total_workouts' as const, value: 25 },
                icon: '🎯'
            },
            {
                name: 'Фитнес-гуру',
                description: 'Выполните 50 тренировок',
                type: AchievementType.WORKOUT,
                points: 200,
                requirements: { metric: 'total_workouts' as const, value: 50 },
                icon: '🏆'
            },
            
            // Достижения за регулярность
            {
                name: 'Последовательность',
                description: 'Тренируйтесь 3 дня подряд',
                type: AchievementType.STREAK,
                points: 30,
                requirements: { metric: 'streak_days' as const, value: 3 },
                icon: '📅'
            },
            {
                name: 'Недельная привычка',
                description: 'Тренируйтесь 7 дней подряд',
                type: AchievementType.STREAK,
                points: 70,
                requirements: { metric: 'streak_days' as const, value: 7 },
                icon: '🔄'
            },
            
            // Достижения за дистанцию
            {
                name: 'Первые шаги',
                description: 'Пробегите суммарно 5 км',
                type: AchievementType.DISTANCE,
                points: 20,
                requirements: { metric: 'total_distance' as const, value: 5 },
                icon: '👣'
            },
            {
                name: 'Городской бегун',
                description: 'Пробегите суммарно 20 км',
                type: AchievementType.DISTANCE,
                points: 60,
                requirements: { metric: 'total_distance' as const, value: 20 },
                icon: '🏙️'
            },
            {
                name: 'Марафонец',
                description: 'Пробегите суммарно 42 км',
                type: AchievementType.DISTANCE,
                points: 150,
                requirements: { metric: 'total_distance' as const, value: 42 },
                icon: '🏅'
            },
            
            // Достижения за уровень
            {
                name: 'Новичок',
                description: 'Достигните 2 уровня',
                type: AchievementType.LEVEL,
                points: 15,
                requirements: { metric: 'level' as const, value: 2 },
                icon: '⭐'
            },
            {
                name: 'Прогрессирующий',
                description: 'Достигните 3 уровня',
                type: AchievementType.LEVEL,
                points: 30,
                requirements: { metric: 'level' as const, value: 3 },
                icon: '⭐⭐'
            },
            {
                name: 'Опытный',
                description: 'Достигните 5 уровня',
                type: AchievementType.LEVEL,
                points: 100,
                requirements: { metric: 'level' as const, value: 5 },
                icon: '⭐⭐⭐'
            },
            
            // Достижения за разнообразие упражнений
            {
                name: 'Разминка',
                description: 'Выполните 5 различных упражнений',
                type: AchievementType.EXERCISE,
                points: 15,
                requirements: { metric: 'exercise_count' as const, value: 5 },
                icon: '🔄'
            },
            {
                name: 'Разносторонний',
                description: 'Выполните 10 различных упражнений',
                type: AchievementType.EXERCISE,
                points: 40,
                requirements: { metric: 'exercise_count' as const, value: 10 },
                icon: '🌟'
            },
            {
                name: 'Мастер упражнений',
                description: 'Выполните 20 различных упражнений',
                type: AchievementType.EXERCISE,
                points: 90,
                requirements: { metric: 'exercise_count' as const, value: 20 },
                icon: '🌈'
            },
            
            // Бонусное легко получаемое достижение для демонстрации
            {
                name: 'Первый шаг',
                description: 'Начало вашего фитнес-пути',
                type: AchievementType.WORKOUT,
                points: 5,
                requirements: { metric: 'total_workouts' as const, value: 0 }, // Будет доступно сразу
                icon: '🚶'
            }
        ];
        
        // Создаем достижения в базе данных
        for (const achievementData of baseAchievements) {
            const achievement = new Achievement();
            achievement.name = achievementData.name;
            achievement.description = achievementData.description;
            achievement.type = achievementData.type;
            achievement.points = achievementData.points;
            achievement.requirements = achievementData.requirements;
            achievement.icon = achievementData.icon;
            
            await this.achievementRepository.save(achievement);
        }
        
        this.logger.log(`Создано ${baseAchievements.length} достижений`);
    }
} 
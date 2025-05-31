import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Achievement, AchievementType, AchievementRequirement } from '../entities/Achievement';
import { User } from '../entities/User';
import { Workout, WorkoutStatus } from '../entities/Workout';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AchievementsService implements OnModuleInit {
    private readonly logger = new Logger(AchievementsService.name);
    
    constructor(
        @InjectRepository(Achievement)
        private achievementRepository: Repository<Achievement>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Workout)
        private workoutRepository: Repository<Workout>,
        private notificationsService: NotificationsService,
    ) {}

    async create(createAchievementDto: CreateAchievementDto): Promise<Achievement> {
        // Преобразуем DTO в объект сущности Achievement
        const achievement = new Achievement();
        achievement.name = createAchievementDto.name;
        achievement.description = createAchievementDto.description;
        achievement.type = createAchievementDto.type;
        achievement.points = createAchievementDto.points;
        achievement.requirements = createAchievementDto.requirements as AchievementRequirement;
        
        if (createAchievementDto.badge) {
            achievement.badge = createAchievementDto.badge;
        }
        
        if (createAchievementDto.icon) {
            achievement.icon = createAchievementDto.icon;
        }
        
        return await this.achievementRepository.save(achievement);
    }

    async checkAndAwardAchievements(user: User): Promise<Achievement[]> {
        try {
            // Получаем все глобальные достижения (шаблоны)
            const globalAchievements = await this.achievementRepository.find({
                where: { userId: IsNull() }
            });
            
            // Получаем уже полученные пользователем достижения
            const userAchievements = await this.achievementRepository.find({
                where: { user: { id: user.id } },
            });
            
            const newAchievements: Achievement[] = [];

            // Проверка и создание базовых достижений если они отсутствуют
            await this.ensureBasicAchievements(globalAchievements);

            // Удаляем дублирующиеся достижения у пользователя по названиям
            const uniqueUserAchievements = await this.removeDuplicateAchievements(userAchievements);
            
            // Если количество достижений изменилось после удаления дубликатов - логируем
            if (uniqueUserAchievements.length !== userAchievements.length) {
                this.logger.warn(`Удалено ${userAchievements.length - uniqueUserAchievements.length} дубликатов достижений для пользователя ${user.id}`);
            }

            for (const globalAchievement of globalAchievements) {
                // Проверяем, есть ли у пользователя это достижение по имени (более надежно, чем по ID)
                if (uniqueUserAchievements.some(ua => ua.name === globalAchievement.name)) {
                    this.logger.log(`Пользователь ${user.id} уже имеет достижение "${globalAchievement.name}"`);
                    continue;
                }

                // Проверяем условия достижения
                const isAchieved = await this.checkAchievementRequirements(user, globalAchievement);
                if (isAchieved) {
                    this.logger.log(`Пользователь ${user.id} выполнил достижение "${globalAchievement.name}"`);
                    
                    // Начисляем очки пользователю и обновляем уровень с помощью метода updateUserXP
                    await this.updateUserXP(user, globalAchievement);

                    // Создаем запись о получении достижения
                    const userAchievement = new Achievement();
                    userAchievement.name = globalAchievement.name;
                    userAchievement.description = globalAchievement.description;
                    userAchievement.type = globalAchievement.type;
                    userAchievement.points = globalAchievement.points;
                    userAchievement.requirements = globalAchievement.requirements;
                    userAchievement.badge = globalAchievement.badge;
                    userAchievement.icon = globalAchievement.icon;
                    userAchievement.user = user;
                    userAchievement.userId = user.id;
                    userAchievement.dateEarned = new Date();
                    
                    const savedAchievement = await this.achievementRepository.save(userAchievement);
                    newAchievements.push(savedAchievement);
                    
                    // Отправляем уведомление о полученном достижении
                    try {
                        await this.notificationsService.notifyAchievement(
                            user.id,
                            globalAchievement.name,
                            globalAchievement.points
                        );
                        this.logger.log(`Отправлено уведомление пользователю ${user.id} о достижении "${globalAchievement.name}"`);
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
                        const errorStack = error instanceof Error ? error.stack : '';
                        this.logger.error(`Не удалось отправить уведомление о достижении: ${errorMessage}`, errorStack);
                    }
                }
            }

            return newAchievements;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            const errorStack = error instanceof Error ? error.stack : '';
            this.logger.error(`Ошибка при проверке и выдаче достижений: ${errorMessage}`, errorStack);
            return [];
        }
    }

    /**
     * Метод для создания базовых достижений, если они отсутствуют в системе
     */
    private async ensureBasicAchievements(globalAchievements: Achievement[]): Promise<void> {
        // Проверяем наличие базового достижения "Активный старт"
        const activistAchievement = globalAchievements.find(a => a.name === "Активный старт");
        if (!activistAchievement) {
            // Создаем базовое достижение для первой тренировки
            const baseAchievement = this.achievementRepository.create({
                name: "Активный старт",
                description: "Выполните свою первую тренировку",
                type: AchievementType.WORKOUT,
                points: 10,
                requirements: { metric: "total_workouts", value: 1 },
                badge: "start_badge.png",
                icon: "🏅"
            });
            
            await this.achievementRepository.save(baseAchievement);
            globalAchievements.push(baseAchievement);
            this.logger.log(`Создано базовое достижение "Активный старт"`);
        }

        // Проверяем наличие достижения "Постоянство"
        const consistencyAchievement = globalAchievements.find(a => a.name === "Постоянство");
        if (!consistencyAchievement) {
            // Создаем достижение за регулярные тренировки
            const streakAchievement = this.achievementRepository.create({
                name: "Постоянство",
                description: "Тренируйтесь 5 дней подряд",
                type: AchievementType.STREAK,
                points: 25,
                requirements: { metric: "streak_days", value: 5 },
                badge: "streak_badge.png",
                icon: "🔥"
            });
            
            await this.achievementRepository.save(streakAchievement);
            globalAchievements.push(streakAchievement);
            this.logger.log(`Создано базовое достижение "Постоянство"`);
        }

        // Проверяем наличие достижения "Разнообразие"
        const diversityAchievement = globalAchievements.find(a => a.name === "Разнообразие");
        if (!diversityAchievement) {
            // Создаем достижение за разнообразие упражнений
            const diverseAchievement = this.achievementRepository.create({
                name: "Разнообразие",
                description: "Выполните 10 различных упражнений",
                type: AchievementType.EXERCISE,
                points: 20,
                requirements: { metric: "exercise_count", value: 10 },
                badge: "diversity_badge.png",
                icon: "🔄"
            });
            
            await this.achievementRepository.save(diverseAchievement);
            globalAchievements.push(diverseAchievement);
            this.logger.log(`Создано базовое достижение "Разнообразие"`);
        }

        // Проверяем наличие достижения "Спортсмен"
        const athleteAchievement = globalAchievements.find(a => a.name === "Спортсмен");
        if (!athleteAchievement) {
            // Создаем достижение за количество тренировок
            const athleteAch = this.achievementRepository.create({
                name: "Спортсмен",
                description: "Выполните 10 тренировок",
                type: AchievementType.WORKOUT,
                points: 30,
                requirements: { metric: "total_workouts", value: 10 },
                badge: "athlete_badge.png",
                icon: "🏋️"
            });
            
            await this.achievementRepository.save(athleteAch);
            globalAchievements.push(athleteAch);
            this.logger.log(`Создано базовое достижение "Спортсмен"`);
        }

        // Проверяем наличие достижения "Марафонец"
        const marathonAchievement = globalAchievements.find(a => a.name === "Марафонец");
        if (!marathonAchievement) {
            // Создаем достижение за пройденную дистанцию
            const marathonAch = this.achievementRepository.create({
                name: "Марафонец",
                description: "Пройдите в общей сложности 42 км",
                type: AchievementType.DISTANCE,
                points: 50,
                requirements: { metric: "total_distance", value: 42 },
                badge: "marathon_badge.png",
                icon: "🏃"
            });
            
            await this.achievementRepository.save(marathonAch);
            globalAchievements.push(marathonAch);
            this.logger.log(`Создано базовое достижение "Марафонец"`);
        }

        // Проверяем наличие достижения "Прогресс"
        const progressAchievement = globalAchievements.find(a => a.name === "Прогресс");
        if (!progressAchievement) {
            // Создаем достижение за достижение определенного уровня
            const progressAch = this.achievementRepository.create({
                name: "Прогресс",
                description: "Достигните 5 уровня",
                type: AchievementType.LEVEL,
                points: 40,
                requirements: { metric: "level", value: 5 },
                badge: "progress_badge.png",
                icon: "📈"
            });
            
            await this.achievementRepository.save(progressAch);
            globalAchievements.push(progressAch);
            this.logger.log(`Создано базовое достижение "Прогресс"`);
        }
    }

    private async checkAchievementRequirements(user: User, achievement: Achievement): Promise<boolean> {
        // Проверяем наличие требований и их формат
        if (!achievement.requirements || !achievement.requirements.metric) {
            this.logger.warn(`Достижение ${achievement.id} имеет неверный формат требований`);
            return false;
        }
        
        const { metric, value } = achievement.requirements;

        switch (metric) {
            case 'total_workouts':
                // Получаем количество ВЫПОЛНЕННЫХ тренировок (статус COMPLETED), а не всех
                const totalWorkouts = await this.workoutRepository.count({
                    where: { 
                        user: { id: user.id },
                        status: WorkoutStatus.COMPLETED // Только ВЫПОЛНЕННЫЕ тренировки
                    },
                });
                this.logger.log(`Проверка достижения '${achievement.name}' для пользователя ${user.id}: ${totalWorkouts}/${value} тренировок`);
                return totalWorkouts >= value;

            case 'total_distance':
                // Считаем общее пройденное расстояние только в ВЫПОЛНЕННЫХ тренировках
                const workouts = await this.workoutRepository.find({
                    where: { 
                        user: { id: user.id },
                        status: WorkoutStatus.COMPLETED // Только ВЫПОЛНЕННЫЕ тренировки 
                    },
                });
                const totalDistance = workouts.reduce((sum, workout) => sum + (workout.distance || 0), 0);
                this.logger.log(`Проверка достижения '${achievement.name}' для пользователя ${user.id}: ${totalDistance}/${value} км`);
                return totalDistance >= value;

            case 'streak_days': {
                // Улучшенная проверка серии тренировок подряд
                const completedWorkouts = await this.workoutRepository.find({
                    where: { 
                        user: { id: user.id },
                        status: WorkoutStatus.COMPLETED
                    },
                    order: { 
                        scheduledDate: 'DESC',
                        createdAt: 'DESC'
                    }
                });
                
                // Если совсем нет тренировок, серия равна 0
                if (completedWorkouts.length === 0) {
                    return false;
                }
                
                // Находим даты всех тренировок и сортируем их
                const workoutDates = completedWorkouts.map(workout => {
                    // Используем дату завершения (если есть) или дату создания
                    if (workout.scheduledDate) {
                        return new Date(workout.scheduledDate);
                    }
                    return new Date(workout.createdAt);
                }).sort((a, b) => b.getTime() - a.getTime()); // Сортируем по убыванию
                
                // Группируем тренировки по дням
                const workoutsByDay = new Map<string, boolean>();
                workoutDates.forEach(date => {
                    const dateString = date.toISOString().split('T')[0];
                    workoutsByDay.set(dateString, true);
                });
                
                // Получаем уникальные даты тренировок
                const uniqueDates = Array.from(workoutsByDay.keys()).sort().reverse();
                
                // Находим максимальную непрерывную серию дней
                let maxStreak = 0;
                let currentStreak = 0;
                
                // Начинаем с сегодняшнего дня
                const today = new Date().toISOString().split('T')[0];
                
                // Проверяем, есть ли тренировка сегодня
                if (workoutsByDay.has(today)) {
                    currentStreak = 1;
                    
                    // Проверяем предыдущие дни
                    const checkDate = new Date();
                    
                    for (let i = 1; i < 30; i++) { // Проверяем последние 30 дней
                        checkDate.setDate(checkDate.getDate() - 1);
                        const dateString = checkDate.toISOString().split('T')[0];
                        
                        if (workoutsByDay.has(dateString)) {
                            currentStreak++;
                        } else {
                            // Прерывание серии
                            break;
                        }
                    }
                }
                
                // Используем текущую серию как максимальную
                maxStreak = currentStreak;
                
                this.logger.log(`Проверка достижения '${achievement.name}' для пользователя ${user.id}: ${maxStreak}/${value} дней подряд`);
                return maxStreak >= value;
            }

            case 'level':
                // Проверяем уровень пользователя
                const currentLevel = user.level || 1;
                this.logger.log(`Проверка достижения '${achievement.name}' для пользователя ${user.id}: ${currentLevel}/${value} уровень`);
                return currentLevel >= value;
                
            case 'exercise_count': {
                // Считаем количество разных упражнений только в ВЫПОЛНЕННЫХ тренировках
                const userWorkouts = await this.workoutRepository.find({
                    where: { 
                        user: { id: user.id },
                        status: WorkoutStatus.COMPLETED
                    },
                    relations: ['workoutExercises'],
                });
                
                // Используем Set для хранения уникальных идентификаторов упражнений
                const uniqueExercises = new Set<string>();
                
                // Заполняем множество уникальных идентификаторов
                userWorkouts.forEach(workout => {
                    workout.workoutExercises?.forEach(exercise => {
                        if (exercise.exerciseId) {
                            uniqueExercises.add(exercise.exerciseId);
                        }
                    });
                });
                
                const exerciseCount = uniqueExercises.size;
                this.logger.log(`Проверка достижения '${achievement.name}' для пользователя ${user.id}: ${exerciseCount}/${value} упражнений`);
                
                return exerciseCount >= value;
            }

            default:
                this.logger.warn(`Неизвестный тип метрики для достижения: ${metric}`);
                return false;
        }
    }

    // Обновляет уровень пользователя на основе его очков
    private updateUserLevel(user: User): void {
        // Повышаем уровень, пока очки позволяют
        while (user.points >= user.level * 100) {
            user.level += 1;
        }
    }

    async getAllAchievements(): Promise<Achievement[]> {
        // Получаем все доступные достижения
        return this.achievementRepository.find({
            where: { userId: IsNull() }, // Только глобальные достижения, не привязанные к пользователям
            order: { type: 'ASC', points: 'ASC' }
        });
    }

    async getUserAchievements(user: User): Promise<Achievement[]> {
        // Получаем достижения, которые привязаны к пользователю
        const userAchievements = await this.achievementRepository.find({
            where: { user: { id: user.id } },
            order: { dateEarned: 'DESC' },
        });
        
        // Если достижений нет, возвращаем пустой массив
        if (!userAchievements || userAchievements.length === 0) {
            return [];
        }
        
        // Проверяем и удаляем дубликаты (достижения с одинаковыми названиями)
        const uniqueAchievements = await this.removeDuplicateAchievements(userAchievements);
        
        // Если после удаления дубликатов количество изменилось, логируем это
        if (uniqueAchievements.length !== userAchievements.length) {
            this.logger.warn(`Удалено ${userAchievements.length - uniqueAchievements.length} дубликатов достижений для пользователя ${user.id}`);
            
            // Сохраняем изменения в базе данных - удаляем дубликаты физически
            for (const achievement of userAchievements) {
                if (!uniqueAchievements.some(a => a.id === achievement.id)) {
                    await this.achievementRepository.remove(achievement);
                }
            }
        }
        
        // Если достижения есть, возвращаем их
        return uniqueAchievements;
    }
    
    // Вспомогательный метод для удаления дубликатов достижений
    private async removeDuplicateAchievements(achievements: Achievement[]): Promise<Achievement[]> {
        const uniqueMap = new Map<string, Achievement>();
        
        // Для каждого имени достижения оставляем только самое раннее полученное
        for (const achievement of achievements) {
            if (!uniqueMap.has(achievement.name)) {
                uniqueMap.set(achievement.name, achievement);
            } else {
                const existing = uniqueMap.get(achievement.name);
                // Если текущее достижение получено раньше, чем существующее - заменяем
                if (existing && achievement.dateEarned && existing.dateEarned && 
                    new Date(achievement.dateEarned) < new Date(existing.dateEarned)) {
                    uniqueMap.set(achievement.name, achievement);
                }
            }
        }
        
        return Array.from(uniqueMap.values());
    }

    // Метод для пересчета очков пользователя на основе его уникальных достижений
    async recalculateUserPoints(userId: string): Promise<User> {
        try {
            // Получаем пользователя
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('Пользователь не найден');
            }
            
            // Получаем все достижения пользователя
            const achievements = await this.achievementRepository.find({
                where: { user: { id: userId } }
            });
            
            // Удаляем дубликаты
            const uniqueAchievements = await this.removeDuplicateAchievements(achievements);
            
            // Пересчитываем очки
            const totalPoints = uniqueAchievements.reduce((sum, achievement) => sum + achievement.points, 0);
            
            // Обновляем очки пользователя
            user.points = totalPoints;
            user.calculateLevel(); // Пересчитываем уровень на основе очков
            
            // Сохраняем обновленные данные
            await this.userRepository.save(user);
            
            this.logger.log(`Пересчитаны очки пользователя ${userId}: ${totalPoints} очков, уровень ${user.level}`);
            
            return user;
        } catch (err: any) {
            this.logger.error(`Ошибка при пересчете очков пользователя: ${err.message}`, err.stack);
            throw new Error('Не удалось пересчитать очки пользователя');
        }
    }

    async getLeaderboard(): Promise<{ id: string; username: string; points: number; level: number }[]> {
        try {
            // Получаем всех пользователей с их очками и уровнями
            const users = await this.userRepository.find();

            // Создаем массив данных для таблицы лидеров
            const leaderboardEntries = users.map(user => ({
                userId: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                // Используем поле points из пользователя (общее количество XP пользователя)
                points: user.points || 0,
                level: user.level || 1
            }));
            
            // Сортируем по очкам (от большего к меньшему)
            const sortedUsers = leaderboardEntries
                .sort((a, b) => b.points - a.points)
                .slice(0, 10);
            
            // Преобразуем в нужный формат
            return sortedUsers.map(user => ({
                id: user.userId,
                username: `${user.firstName} ${user.lastName}`.trim() || 'Пользователь',
                points: user.points,
                level: user.level
            }));
        } catch (err: any) {
            this.logger.error(`Ошибка при получении таблицы лидеров: ${err.message}`, err.stack);
            throw new Error('Не удалось получить таблицу лидеров');
        }
    }

    async getUserStats(user: User): Promise<{
        totalWorkouts: number;
        streakDays: number;
        totalDistance: number;
        level: number;
        totalExercises: number;
        completedPrograms: number;
        totalXP: number;
    }> {
        try {
            // Получаем количество выполненных тренировок пользователя
            const totalWorkouts = await this.workoutRepository.count({
                where: { 
                    // Здесь можно добавить фильтр по завершенным тренировкам, если есть соответствующее поле
                    user: { id: user.id } 
                }
            });

            // Получаем все тренировки пользователя
            const userWorkouts = await this.workoutRepository.find({
                where: { user: { id: user.id } },
                relations: ['workoutExercises'],
                order: { createdAt: 'DESC' }
            });
            
            // Вычисляем серию тренировок подряд (дней)
            let streakDays = 0;
            if (userWorkouts.length > 0) {
                // Здесь должна быть логика расчета непрерывных дней тренировок
                // Для простоты возьмем количество тренировок за последние 30 дней
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                
                const recentWorkouts = userWorkouts.filter(workout => 
                    new Date(workout.createdAt) >= startDate
                );
                
                // Группируем тренировки по дням
                const workoutsByDay = new Map<string, boolean>();
                recentWorkouts.forEach(workout => {
                    const date = new Date(workout.createdAt).toISOString().split('T')[0];
                    workoutsByDay.set(date, true);
                });
                
                // Находим максимальную непрерывную серию дней
                const days = Array.from(workoutsByDay.keys()).sort();
                let maxStreak = 0;
                let currentStreak = 0;
                
                for (let i = 0; i < days.length; i++) {
                    if (i === 0) {
                        currentStreak = 1;
                    } else {
                        const currentDate = new Date(days[i]);
                        const prevDate = new Date(days[i-1]);
                        
                        // Проверяем, идут ли даты подряд
                        const diffInDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
                        
                        if (diffInDays === 1) {
                            currentStreak++;
                        } else {
                            maxStreak = Math.max(maxStreak, currentStreak);
                            currentStreak = 1;
                        }
                    }
                }
                
                maxStreak = Math.max(maxStreak, currentStreak);
                streakDays = maxStreak;
            }
            
            // Подсчитываем пройденную дистанцию
            const totalDistance = userWorkouts.reduce((sum, workout) => 
                sum + (workout.distance || 0), 0
            );
            
            // Подсчитываем количество уникальных выполненных упражнений
            const uniqueExercises = new Set<string>();
            userWorkouts.forEach(workout => {
                workout.workoutExercises?.forEach(exercise => {
                    if (exercise.exerciseId) {
                        uniqueExercises.add(exercise.exerciseId);
                    }
                });
            });
            const totalExercises = uniqueExercises.size;
            
            // Получаем количество завершенных программ
            // Если есть отдельная сущность программ, нужно добавить соответствующий репозиторий
            const completedPrograms = 0; // Пока заглушка
            
            // Возвращаем собранную статистику
            return {
                totalWorkouts,
                streakDays,
                totalDistance,
                level: user.level || 1,
                totalExercises,
                completedPrograms,
                totalXP: user.points || 0
            };
        } catch (err: any) {
            this.logger.error(`Ошибка при получении статистики пользователя: ${err.message}`, err.stack);
            throw new Error('Не удалось получить статистику пользователя');
        }
    }

    async onModuleInit() {
        // При запуске приложения удаляем дублирующиеся достижения
        await this.removeDuplicatedAchievements();
    }
    
    /**
     * Удаляет дублирующиеся достижения из системы
     */
    private async removeDuplicatedAchievements() {
        try {
            // Найдем достижение "Первый шаг", которое дублирует "Активный старт"
            const firstStepAchievements = await this.achievementRepository.find({
                where: { name: "Первый шаг" }
            });
            
            if (firstStepAchievements.length > 0) {
                this.logger.log(`Найдено ${firstStepAchievements.length} дублирующихся достижений "Первый шаг"`);
                
                // Удаляем все дублирующиеся достижения "Первый шаг"
                for (const achievement of firstStepAchievements) {
                    await this.achievementRepository.remove(achievement);
                }
                
                this.logger.log(`Удалены дублирующиеся достижения "Первый шаг"`);
            }
            
            // Проверим наличие других дублирующихся достижений у пользователей
            const users = await this.userRepository.find();
            
            for (const user of users) {
                const userAchievements = await this.achievementRepository.find({
                    where: { userId: user.id }
                });
                
                if (userAchievements.length > 0) {
                    const uniqueAchievements = await this.removeDuplicateAchievements(userAchievements);
                    
                    if (uniqueAchievements.length !== userAchievements.length) {
                        this.logger.log(`Удалено ${userAchievements.length - uniqueAchievements.length} дубликатов достижений для пользователя ${user.id}`);
                    }
                }
            }
        } catch (error) {
            this.logger.error('Ошибка при удалении дублирующихся достижений:', error);
        }
    }

    /**
     * Получает список всех доступных достижений с их прогрессом выполнения для пользователя
     */
    async getAchievementsWithProgress(userId: string): Promise<any[]> {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException('Пользователь не найден');
            }
            
            // Получаем все глобальные достижения
            const globalAchievements = await this.achievementRepository.find({
                where: { userId: IsNull() }
            });
            
            // Получаем достижения, полученные пользователем
            const userAchievements = await this.getUserAchievements(user);
            
            // Статистика для расчета прогресса
            const userStats = await this.getUserStats(user);
            
            // Формируем результат
            const achievementsWithProgress = await Promise.all(globalAchievements.map(async (achievement) => {
                // Проверяем, получено ли это достижение пользователем
                const userAchievement = userAchievements.find(ua => ua.name === achievement.name);
                const isUnlocked = !!userAchievement;
                
                // Рассчитываем текущий прогресс
                let progress = 0;
                
                if (isUnlocked) {
                    progress = 100; // Если достижение получено, прогресс 100%
                } else {
                    // Вычисляем прогресс на основе метрики
                    progress = await this.calculateAchievementProgress(user, achievement, userStats);
                }
                
                return {
                    id: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    type: achievement.type,
                    points: achievement.points,
                    icon: achievement.icon || '🏆',
                    badge: achievement.badge,
                    requirements: achievement.requirements,
                    isUnlocked,
                    progress,
                    dateEarned: userAchievement?.dateEarned,
                };
            }));
            
            return achievementsWithProgress;
        } catch (error) {
            this.logger.error('Ошибка при получении достижений с прогрессом:', error);
            return [];
        }
    }
    
    /**
     * Рассчитывает процент выполнения достижения
     */
    private async calculateAchievementProgress(user: User, achievement: Achievement, userStats?: any): Promise<number> {
        if (!achievement.requirements || !achievement.requirements.metric) {
            return 0;
        }
        
        const { metric, value } = achievement.requirements;
        
        // Если статистика уже загружена, используем её
        if (userStats) {
            switch (metric) {
                case 'total_workouts':
                    return Math.min(100, Math.round((userStats.totalWorkouts / value) * 100));
                case 'total_distance':
                    return Math.min(100, Math.round((userStats.totalDistance / value) * 100));
                case 'streak_days':
                    return Math.min(100, Math.round((userStats.streakDays / value) * 100));
                case 'level':
                    return Math.min(100, Math.round((userStats.level / value) * 100));
                case 'exercise_count':
                    return Math.min(100, Math.round((userStats.totalExercises / value) * 100));
                default:
                    return 0;
            }
        }
        
        // Если статистика не загружена, вычисляем для конкретной метрики
        switch (metric) {
            case 'total_workouts': {
                const totalWorkouts = await this.workoutRepository.count({
                    where: { 
                        user: { id: user.id },
                        status: WorkoutStatus.COMPLETED
                    }
                });
                return Math.min(100, Math.round((totalWorkouts / value) * 100));
            }
            case 'total_distance': {
                const workouts = await this.workoutRepository.find({
                    where: { 
                        user: { id: user.id },
                        status: WorkoutStatus.COMPLETED
                    }
                });
                const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
                return Math.min(100, Math.round((totalDistance / value) * 100));
            }
            case 'streak_days': {
                // Упрощенный вариант - берем только как процент от требуемого значения
                const streakDays = await this.calculateStreakDays(user);
                return Math.min(100, Math.round((streakDays / value) * 100));
            }
            case 'level': {
                const level = user.level || 1;
                return Math.min(100, Math.round((level / value) * 100));
            }
            case 'exercise_count': {
                const uniqueExercises = await this.countUniqueExercises(user);
                return Math.min(100, Math.round((uniqueExercises / value) * 100));
            }
            default:
                return 0;
        }
    }
    
    /**
     * Вспомогательный метод для расчета количества дней подряд с тренировками
     */
    private async calculateStreakDays(user: User): Promise<number> {
        const completedWorkouts = await this.workoutRepository.find({
            where: { 
                user: { id: user.id },
                status: WorkoutStatus.COMPLETED
            },
            order: { 
                scheduledDate: 'DESC',
                createdAt: 'DESC'
            }
        });
        
        if (completedWorkouts.length === 0) {
            return 0;
        }
        
        // Группируем тренировки по дням
        const workoutsByDay = new Map<string, boolean>();
        completedWorkouts.forEach(workout => {
            const date = workout.scheduledDate || workout.createdAt;
            const dateString = new Date(date).toISOString().split('T')[0];
            workoutsByDay.set(dateString, true);
        });
        
        // Находим максимальную непрерывную серию
        const today = new Date().toISOString().split('T')[0];
        
        // Если сегодня была тренировка
        if (workoutsByDay.has(today)) {
            // Проверяем предыдущие дни
            let currentStreak = 1;
            const checkDate = new Date();
            
            for (let i = 1; i < 30; i++) { // Проверяем последние 30 дней
                checkDate.setDate(checkDate.getDate() - 1);
                const dateString = checkDate.toISOString().split('T')[0];
                
                if (workoutsByDay.has(dateString)) {
                    currentStreak++;
                } else {
                    break; // Прерывание серии
                }
            }
            
            return currentStreak;
        }
        
        return 0; // Если сегодня не было тренировки, серия равна 0
    }
    
    /**
     * Вспомогательный метод для подсчета уникальных упражнений
     */
    private async countUniqueExercises(user: User): Promise<number> {
        const workouts = await this.workoutRepository.find({
            where: { 
                user: { id: user.id },
                status: WorkoutStatus.COMPLETED
            },
            relations: ['workoutExercises']
        });
        
        // Используем Set для хранения уникальных идентификаторов
        const uniqueExercises = new Set<string>();
        
        workouts.forEach(workout => {
            workout.workoutExercises?.forEach(exercise => {
                if (exercise.exerciseId) {
                    uniqueExercises.add(exercise.exerciseId);
                }
            });
        });
        
        return uniqueExercises.size;
    }

    /**
     * Обновляет общий XP пользователя после получения достижения
     */
    private async updateUserXP(user: User, achievement: Achievement): Promise<void> {
        try {
            // Получаем текущие очки пользователя
            const currentPoints = user.points || 0;
            
            // Добавляем очки за новое достижение
            const newPoints = currentPoints + (achievement.points || 0);
            
            // Обновляем значение points в пользователе
            await this.userRepository.update(user.id, { 
                points: newPoints 
            });
            
            // Также обновляем уровень
            this.updateUserLevel(user);
            
            this.logger.log(`Обновлен XP пользователя ${user.id}: ${currentPoints} -> ${newPoints}`);
        } catch (error: any) {
            this.logger.error(`Ошибка при обновлении XP пользователя: ${error.message}`);
        }
    }
} 
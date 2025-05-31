import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Workout } from './Workout';
import { Achievement } from './Achievement';
import { Challenge } from './Challenge';
import { HealthMetric } from './HealthMetric';
import { Activity } from './Activity';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

export enum ActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHTLY_ACTIVE = 'lightly_active',
    MODERATELY_ACTIVE = 'moderately_active',
    VERY_ACTIVE = 'very_active',
    EXTRA_ACTIVE = 'extra_active'
}

export enum FitnessGoal {
    WEIGHT_LOSS = 'weight_loss',
    MUSCLE_GAIN = 'muscle_gain',
    ENDURANCE = 'endurance',
    FLEXIBILITY = 'flexibility',
    GENERAL_FITNESS = 'general_fitness'
}

export enum MeasurementSystem {
    METRIC = 'metric',
    IMPERIAL = 'imperial'
}

export enum ThemeOption {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system'
}

export interface UserSettings {
    theme?: ThemeOption;
    measurementSystem?: MeasurementSystem;
    notifications?: {
        workoutReminders?: boolean;
        achievementNotifications?: boolean;
        newsletterSubscription?: boolean;
        reminderTime?: number;
        newContentNotifications?: boolean;
    };
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ type: 'int' })
    age!: number;

    @Column({ type: 'enum', enum: Gender })
    gender!: Gender;

    @Column({ type: 'enum', enum: ActivityLevel })
    activityLevel!: ActivityLevel;

    @Column('simple-array')
    fitnessGoals!: FitnessGoal[];

    @Column({ default: 0 })
    points!: number;

    @Column({ default: 1 })
    level!: number;
    
    @Column({ type: 'float', nullable: true })
    weight?: number;
    
    @Column({ type: 'int', nullable: true })
    height?: number;
    
    @Column({ type: 'text', nullable: true })
    bio?: string;
    
    @Column({ nullable: true })
    avatar?: string;
    
    @Column({ type: 'jsonb', nullable: true })
    settings?: UserSettings;

    @OneToMany(() => Workout, workout => workout.user)
    workouts!: Workout[];

    @OneToMany(() => Activity, activity => activity.user)
    activities!: Activity[];

    @OneToMany(() => Achievement, achievement => achievement.user)
    achievements!: Achievement[];

    @OneToMany(() => Challenge, challenge => challenge.creator)
    createdChallenges!: Challenge[];

    @ManyToMany(() => Challenge, challenge => challenge.participants)
    @JoinTable()
    challenges!: Challenge[];

    @OneToMany(() => HealthMetric, healthMetric => healthMetric.user)
    healthMetrics!: HealthMetric[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    constructor() {
        this.points = 0;
        this.level = 1;
        this.fitnessGoals = [];
        this.settings = {
            theme: ThemeOption.SYSTEM,
            measurementSystem: MeasurementSystem.METRIC,
            notifications: {
                workoutReminders: true,
                achievementNotifications: true,
                newsletterSubscription: false,
                reminderTime: 30,
                newContentNotifications: true
            }
        };
    }
    
    /**
     * Рассчитывает и обновляет уровень пользователя на основе накопленных очков
     * Формула: Каждый уровень требует level * 100 очков
     * Например, для уровня 2 нужно 200 очков, для уровня 3 - 300 очков, и т.д.
     * 
     * @returns текущий уровень пользователя
     */
    calculateLevel(): number {
        // Базовый уровень
        let currentLevel = 1;
        
        // Оставшиеся очки для расчета
        let remainingPoints = this.points;
        
        // Вычисляем максимальный возможный уровень на основе очков
        while (remainingPoints >= currentLevel * 100) {
            // Вычитаем очки, необходимые для достижения текущего уровня
            remainingPoints -= currentLevel * 100;
            // Увеличиваем уровень
            currentLevel++;
        }
        
        // Обновляем уровень пользователя
        this.level = currentLevel;
        
        return this.level;
    }
    
    /**
     * Добавляет очки пользователю и пересчитывает уровень
     * 
     * @param points количество очков для добавления
     * @returns обновленный уровень пользователя
     */
    addPoints(points: number): number {
        if (points > 0) {
            this.points += points;
            return this.calculateLevel();
        }
        return this.level;
    }
} 
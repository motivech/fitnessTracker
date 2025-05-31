import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { ApiProperty } from '@nestjs/swagger';

export enum AchievementType {
    WORKOUT = 'workout',
    STREAK = 'streak',
    DISTANCE = 'distance',
    LEVEL = 'level',
    EXERCISE = 'exercise',
}

export interface AchievementRequirement {
    metric: 'total_workouts' | 'total_distance' | 'streak_days' | 'level' | 'exercise_count';
    value: number;
}

@Entity()
export class Achievement {
    @ApiProperty({ description: 'Уникальный идентификатор достижения', example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'Название достижения', example: 'Марафонец' })
    @Column()
    name!: string;

    @ApiProperty({ description: 'Описание достижения', example: 'Пробежать в сумме 42км' })
    @Column({ type: 'text' })
    description!: string;

    @ApiProperty({ description: 'Очки за достижение', example: 100 })
    @Column()
    points!: number;

    @ApiProperty({ description: 'Тип достижения', enum: AchievementType })
    @Column({
        type: 'enum',
        enum: AchievementType,
    })
    type!: AchievementType;

    @ApiProperty({ description: 'Требования для получения достижения' })
    @Column({ type: 'json' })
    requirements!: AchievementRequirement;

    @ApiProperty({ description: 'Изображение/значок достижения' })
    @Column({ nullable: true })
    badge!: string;

    @ApiProperty({ description: 'Иконка достижения (эмодзи или название иконки)' })
    @Column({ nullable: true })
    icon!: string;

    @ApiProperty({ description: 'Дата получения достижения' })
    @Column({ type: 'timestamp', nullable: true })
    dateEarned!: Date;

    @ApiProperty({ description: 'Пользователь, получивший достижение' })
    @ManyToOne(() => User, user => user.achievements)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ApiProperty({ description: 'ID пользователя' })
    @Column({ nullable: true })
    userId!: string;

    @ApiProperty({ description: 'Дата создания достижения' })
    @CreateDateColumn()
    createdAt!: Date;
} 
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { WorkoutExercise } from './WorkoutExercise';
import { ApiProperty } from '@nestjs/swagger';

export enum WorkoutType {
    STRENGTH = 'strength',
    CARDIO = 'cardio',
    HIIT = 'hiit',
    FLEXIBILITY = 'flexibility',
    CUSTOM = 'custom'
}

export enum WorkoutStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    ARCHIVED = 'archived'
}

@Entity()
export class Workout {
    @ApiProperty({ description: 'Уникальный идентификатор тренировки', example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'Название тренировки', example: 'Тренировка грудных мышц' })
    @Column()
    name!: string;

    @ApiProperty({ description: 'Описание тренировки', example: 'Комплексная тренировка для увеличения силы грудных мышц' })
    @Column({ type: 'text', nullable: true })
    description!: string;

    @ApiProperty({ description: 'Тип тренировки', enum: WorkoutType, example: WorkoutType.STRENGTH })
    @Column({
        type: 'enum',
        enum: WorkoutType,
        default: WorkoutType.CUSTOM
    })
    type!: WorkoutType;

    @ApiProperty({ description: 'Статус тренировки', enum: WorkoutStatus, example: WorkoutStatus.ACTIVE })
    @Column({
        type: 'enum',
        enum: WorkoutStatus,
        default: WorkoutStatus.DRAFT
    })
    status!: WorkoutStatus;

    @ApiProperty({ description: 'Продолжительность тренировки в минутах', example: 60 })
    @Column({ type: 'int', nullable: true })
    durationMinutes!: number;

    @ApiProperty({ description: 'Общая продолжительность в секундах', example: 3600 })
    @Column({ type: 'int', nullable: true })
    duration!: number;

    @ApiProperty({ description: 'Пройденное расстояние в км', example: 5.5 })
    @Column({ type: 'float', nullable: true })
    distance!: number;

    @ApiProperty({ description: 'Потраченные калории', example: 450 })
    @Column({ type: 'int', nullable: true })
    caloriesBurned!: number;

    @ApiProperty({ description: 'Запланированная дата тренировки', example: '2023-06-15' })
    @Column({ type: 'date', nullable: true })
    scheduledDate!: Date;

    @ApiProperty({ description: 'Запланированное время начала тренировки', example: '2023-06-15T14:30:00' })
    @Column({ type: 'timestamp', nullable: true })
    scheduledFor!: Date;

    @ApiProperty({ description: 'Дата создания', example: '2023-05-15T10:30:00Z' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: 'Дата обновления', example: '2023-05-15T10:30:00Z' })
    @UpdateDateColumn()
    updatedAt!: Date;

    @ApiProperty({ description: 'Пользователь, создавший тренировку' })
    @ManyToOne(() => User, user => user.workouts)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ApiProperty({ description: 'ID пользователя', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Column()
    userId!: string;

    @ApiProperty({ description: 'Упражнения в тренировке' })
    @OneToMany(() => WorkoutExercise, workoutExercise => workoutExercise.workout, { cascade: true })
    workoutExercises!: WorkoutExercise[];

    @ApiProperty({ description: 'Публичная ли тренировка', example: false })
    @Column({ default: false })
    isPublic!: boolean;

    @ApiProperty({ description: 'Процент выполнения тренировки', example: 85 })
    @Column({ type: 'float', nullable: true })
    completionPercentage!: number;
} 
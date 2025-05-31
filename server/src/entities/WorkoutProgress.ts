import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Workout } from './Workout';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class WorkoutProgress {
    @ApiProperty({ description: 'Уникальный идентификатор прогресса тренировки', example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'ID тренировки', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Column()
    workoutId!: string;

    @ApiProperty({ description: 'Тренировка' })
    @ManyToOne(() => Workout)
    @JoinColumn({ name: 'workoutId' })
    workout!: Workout;

    @ApiProperty({ description: 'ID пользователя', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Column()
    userId!: string;

    @ApiProperty({ description: 'Пользователь' })
    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ApiProperty({ description: 'Дата выполнения тренировки', example: '2023-05-15' })
    @Column({ type: 'date' })
    date!: string;

    @ApiProperty({ description: 'Завершенные упражнения', type: 'array', items: { type: 'string' } })
    @Column('simple-array')
    completedExercises!: string[];

    @ApiProperty({ description: 'Процент выполнения тренировки', example: 75 })
    @Column({ type: 'float' })
    completionPercentage!: number;

    @ApiProperty({ description: 'Потраченное время в минутах', example: 45 })
    @Column({ type: 'int', nullable: true })
    timeSpent!: number;

    @ApiProperty({ description: 'Потраченные калории', example: 350 })
    @Column({ type: 'int', nullable: true })
    caloriesBurned!: number;

    @ApiProperty({ description: 'Комментарий к тренировке', example: 'Хорошая тренировка, но была тяжелой' })
    @Column({ type: 'text', nullable: true })
    notes!: string;

    @ApiProperty({ description: 'Дата создания записи', example: '2023-05-15T10:30:00Z' })
    @CreateDateColumn()
    createdAt!: Date;
} 
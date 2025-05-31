import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Workout } from './Workout';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ActiveWorkout {
    @ApiProperty({ description: 'Уникальный идентификатор активной тренировки', example: '123e4567-e89b-12d3-a456-426614174000' })
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

    @ApiProperty({ description: 'Время начала тренировки', example: '2023-05-15T10:30:00Z' })
    @CreateDateColumn()
    startTime!: Date;

    @ApiProperty({ description: 'Прогресс выполнения в процентах', example: 75 })
    @Column({ type: 'float', default: 0 })
    progress!: number;
} 
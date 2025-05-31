import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Workout } from './Workout';
import { WorkoutExercise } from './WorkoutExercise';
import { ApiProperty } from '@nestjs/swagger';

export enum MuscleGroup {
    CHEST = 'chest',
    BACK = 'back',
    SHOULDERS = 'shoulders',
    BICEPS = 'biceps',
    TRICEPS = 'triceps',
    LEGS = 'legs',
    CORE = 'core',
    FULLBODY = 'fullbody',
    ARMS = 'arms',
    FULL_BODY = 'full_body',
    CARDIO = 'cardio'
}

export enum ExerciseType {
    STRENGTH = 'strength',
    CARDIO = 'cardio',
    FLEXIBILITY = 'flexibility',
    BALANCE = 'balance',
    PLYOMETRIC = 'plyometric'
}

@Entity()
export class Exercise {
    @ApiProperty({ description: 'Уникальный идентификатор упражнения', example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'Название упражнения', example: 'Жим лежа' })
    @Column({ nullable: false })
    name!: string;

    @ApiProperty({ description: 'Тип упражнения', enum: ExerciseType, example: ExerciseType.STRENGTH })
    @Column({
        type: 'enum',
        enum: ExerciseType
    })
    type!: ExerciseType;

    @ApiProperty({ description: 'Целевая группа мышц', enum: MuscleGroup, example: MuscleGroup.CHEST })
    @Column({
        type: 'enum',
        enum: MuscleGroup
    })
    muscleGroup!: MuscleGroup;

    @ApiProperty({ description: 'Описание упражнения', example: 'Базовое упражнение для груди' })
    @Column({ type: 'text' })
    description!: string;

    @ApiProperty({ description: 'Инструкции по выполнению', example: 'Лягте на скамью, расположите гриф на уровне глаз...' })
    @Column({ type: 'text', nullable: true })
    instructions!: string;

    @ApiProperty({ description: 'Ссылка на изображение', example: 'https://example.com/bench-press.jpg' })
    @Column({ type: 'varchar', nullable: true })
    imageUrl!: string;

    @ApiProperty({ description: 'Ссылка на видео', example: 'https://youtube.com/watch?v=rT7DgCr-3pg' })
    @Column({ type: 'varchar', nullable: true })
    videoUrl!: string;

    @ApiProperty({ description: 'Необходимое оборудование', example: ['штанга', 'скамья'] })
    @Column('simple-array', { nullable: true })
    equipment!: string[];

    @ApiProperty({ description: 'Дата создания', example: '2023-01-01T00:00:00.000Z' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: 'Дата обновления', example: '2023-01-01T00:00:00.000Z' })
    @UpdateDateColumn()
    updatedAt!: Date;

    @ApiProperty({ description: 'Связь с тренировками через промежуточную таблицу' })
    @OneToMany(() => WorkoutExercise, workoutExercise => workoutExercise.exercise)
    workoutExercises!: WorkoutExercise[];
} 
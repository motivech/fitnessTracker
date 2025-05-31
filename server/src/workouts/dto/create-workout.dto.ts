import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, ValidateNested, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutType } from '../../entities/Workout';

export class ExerciseDto {
    @ApiProperty({ description: 'Название упражнения (устаревшее)' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: 'Количество подходов',
        example: 3
    })
    @IsNumber()
    sets: number = 0;

    @ApiProperty({
        description: 'Количество повторений',
        example: 10
    })
    @IsNumber()
    reps: number = 0;

    @ApiProperty({
        description: 'Вес в килограммах',
        example: 70,
        required: false
    })
    @IsNumber()
    @IsOptional()
    weight?: number = 0;

    @ApiProperty({
        description: 'Длительность в секундах',
        example: 60,
        required: false
    })
    @IsNumber()
    @IsOptional()
    duration?: number;

    @ApiProperty({ description: 'ID упражнения' })
    @IsString()
    exerciseId: string = '';
}

export class CreateWorkoutDto {
    @ApiProperty({
        description: 'Название тренировки',
        example: 'Утренняя пробежка'
    })
    @IsString()
    name: string = '';

    @ApiProperty({
        description: 'Описание тренировки',
        example: 'Легкая кардио тренировка для утра'
    })
    @IsString()
    @IsOptional()
    description?: string = '';

    @ApiProperty({
        description: 'Тип тренировки',
        enum: WorkoutType,
        example: WorkoutType.CUSTOM
    })
    @IsString()
    type: string = WorkoutType.CUSTOM;

    @ApiProperty({
        description: 'Сложность тренировки',
        enum: ['начинающий', 'средний', 'продвинутый'],
        example: 'начинающий'
    })
    @IsEnum(['начинающий', 'средний', 'продвинутый'])
    difficulty: 'начинающий' | 'средний' | 'продвинутый' = 'начинающий';

    @ApiProperty({
        description: 'Дата тренировки',
        example: '2024-05-01'
    })
    @IsDate()
    @Type(() => Date)
    date: Date = new Date();

    @ApiProperty({
        description: 'Длительность тренировки в минутах',
        example: 30
    })
    @IsNumber()
    @IsOptional()
    duration?: number = 0;

    @ApiProperty({
        description: 'Количество сожженных калорий',
        example: 300
    })
    @IsNumber()
    @IsOptional()
    caloriesBurned?: number = 0;

    @ApiProperty({
        description: 'Пройденное расстояние в км',
        example: 5,
        required: false
    })
    @IsNumber()
    @IsOptional()
    distance?: number = 0;

    @ApiProperty({
        description: 'Публичная ли тренировка',
        example: false
    })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean = false;

    @ApiProperty({
        description: 'Список упражнений',
        type: [ExerciseDto],
        required: false
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExerciseDto)
    @IsOptional()
    exercises?: ExerciseDto[] = [];

    @ApiProperty({
        description: 'Заметки к тренировке',
        required: false
    })
    @IsString()
    @IsOptional()
    notes?: string = '';

    @ApiProperty({
        description: 'ID пользователя',
        required: false
    })
    @IsString()
    @IsOptional()
    userId?: string;
} 
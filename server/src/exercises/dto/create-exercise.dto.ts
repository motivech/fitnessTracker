import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsArray } from 'class-validator';
import { ExerciseType, MuscleGroup } from '../../entities/Exercise';

export class CreateExerciseDto {
    @ApiProperty({ description: 'Название упражнения', example: 'Жим лежа' })
    @IsNotEmpty()
    @IsString()
    name: string = '';

    @ApiProperty({ description: 'Тип упражнения', enum: ExerciseType, example: ExerciseType.STRENGTH })
    @IsNotEmpty()
    @IsEnum(ExerciseType)
    type: ExerciseType = ExerciseType.STRENGTH;

    @ApiProperty({ description: 'Целевая группа мышц', enum: MuscleGroup, example: MuscleGroup.CHEST })
    @IsNotEmpty()
    @IsEnum(MuscleGroup)
    muscleGroup: MuscleGroup = MuscleGroup.CHEST;

    @ApiProperty({ description: 'Описание упражнения', example: 'Базовое упражнение для груди' })
    @IsNotEmpty()
    @IsString()
    description: string = '';

    @ApiProperty({ description: 'Инструкции по выполнению', example: 'Лягте на скамью, расположите гриф на уровне глаз...' })
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiProperty({ description: 'Ссылка на изображение', example: 'https://example.com/bench-press.jpg' })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiProperty({ description: 'Ссылка на видео', example: 'https://youtube.com/watch?v=rT7DgCr-3pg' })
    @IsOptional()
    @IsUrl()
    videoUrl?: string;

    @ApiProperty({ description: 'Необходимое оборудование', example: ['штанга', 'скамья'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    equipment?: string[];
} 
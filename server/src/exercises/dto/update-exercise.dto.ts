import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString, IsArray, IsOptional, IsUrl } from 'class-validator';
import { MuscleGroup, ExerciseType } from '../../entities/Exercise';

export class UpdateExerciseDto {
    @ApiProperty({ description: 'Название упражнения', example: 'Жим лежа', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ 
        description: 'Тип упражнения', 
        enum: ExerciseType, 
        example: ExerciseType.STRENGTH,
        required: false
    })
    @IsOptional()
    @IsEnum(ExerciseType)
    type?: ExerciseType;

    @ApiProperty({ 
        description: 'Целевая группа мышц', 
        enum: MuscleGroup, 
        example: MuscleGroup.CHEST,
        required: false
    })
    @IsOptional()
    @IsEnum(MuscleGroup)
    muscleGroup?: MuscleGroup;

    @ApiProperty({ 
        description: 'Описание упражнения', 
        example: 'Базовое упражнение для груди',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ 
        description: 'Инструкции по выполнению', 
        example: 'Лягте на скамью, расположите гриф на уровне глаз...', 
        required: false 
    })
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiProperty({ 
        description: 'Ссылка на изображение', 
        example: 'https://example.com/bench-press.jpg', 
        required: false 
    })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiProperty({ 
        description: 'Ссылка на видео', 
        example: 'https://youtube.com/watch?v=rT7DgCr-3pg', 
        required: false 
    })
    @IsOptional()
    @IsUrl()
    videoUrl?: string;

    @ApiProperty({ 
        description: 'Необходимое оборудование', 
        example: ['штанга', 'скамья'], 
        required: false,
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    equipment?: string[];
} 
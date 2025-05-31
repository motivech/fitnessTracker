import { IsString, IsEnum, IsInt, IsObject, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AchievementType, AchievementRequirement } from '../../entities/Achievement';
import { Type } from 'class-transformer';

export class RequirementDto implements AchievementRequirement {
    @ApiProperty({ 
        description: 'Метрика достижения', 
        enum: ['total_workouts', 'total_distance', 'streak_days', 'level', 'exercise_count'],
        example: 'total_distance' 
    })
    @IsString()
    metric!: 'total_workouts' | 'total_distance' | 'streak_days' | 'level' | 'exercise_count';

    @ApiProperty({ description: 'Значение для достижения', example: 42 })
    @IsInt()
    value!: number;
}

export class CreateAchievementDto {
    @ApiProperty({ description: 'Название достижения', example: 'Марафонец' })
    @IsString()
    name!: string;

    @ApiProperty({ description: 'Описание достижения', example: 'Пробежать в сумме 42км' })
    @IsString()
    description!: string;

    @ApiProperty({ description: 'Тип достижения', enum: AchievementType, example: AchievementType.DISTANCE })
    @IsEnum(AchievementType)
    type!: AchievementType;

    @ApiProperty({ description: 'Очки за достижение', example: 100 })
    @IsInt()
    points!: number;

    @ApiProperty({ 
        description: 'Требования для получения достижения',
        type: RequirementDto,
        example: { metric: 'total_distance', value: 42 }
    })
    @IsObject()
    @Type(() => RequirementDto)
    requirements!: RequirementDto;

    @ApiProperty({ description: 'Изображение/значок достижения', required: false })
    @IsOptional()
    @IsUrl()
    badge?: string;
    
    @ApiProperty({ description: 'Иконка достижения (эмодзи или название иконки)', required: false, example: '🏆' })
    @IsOptional()
    @IsString()
    icon?: string;
} 
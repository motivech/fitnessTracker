import { IsString, IsEnum, IsNumber, IsDate, IsOptional, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ChallengeType } from '../../entities/Challenge';

export class CreateChallengeDto {
    @ApiProperty({
        description: 'Название вызова',
        example: 'Майский марафон'
    })
    @IsString()
    name = '';

    @ApiProperty({
        description: 'Описание вызова',
        example: 'Пробегите 100 км за май'
    })
    @IsString()
    description = '';

    @ApiProperty({
        description: 'Тип вызова',
        enum: ChallengeType,
        example: ChallengeType.DISTANCE
    })
    @IsEnum(ChallengeType)
    type: ChallengeType = ChallengeType.DISTANCE;

    @ApiProperty({
        description: 'Дата начала вызова',
        example: '2024-05-01T00:00:00Z'
    })
    @IsDate()
    @Type(() => Date)
    startDate: Date = new Date();

    @ApiProperty({
        description: 'Дата окончания вызова',
        example: '2024-05-31T23:59:59Z'
    })
    @IsDate()
    @Type(() => Date)
    endDate: Date = new Date();

    @ApiProperty({
        description: 'Целевое значение для выполнения вызова',
        example: 100
    })
    @IsNumber()
    targetValue = 0;

    @ApiProperty({
        description: 'Количество очков за выполнение вызова',
        example: 1000
    })
    @IsNumber()
    rewardPoints = 0;

    @ApiProperty({
        description: 'Идентификаторы пользователей, которых нужно пригласить',
        type: [String],
        required: false,
        example: ['user1-uuid', 'user2-uuid']
    })
    @IsOptional()
    @IsArray()
    participantIds?: string[];
} 
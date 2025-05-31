import { IsEmail, IsString, MinLength, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, ActivityLevel, FitnessGoal } from '../../entities/User';

export class RegisterDto {
    @ApiProperty({
        description: 'Email пользователя',
        example: 'user@example.com'
    })
    @IsEmail()
    email = '';

    @ApiProperty({
        description: 'Пароль пользователя',
        example: 'password123',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password = '';

    @ApiProperty({
        description: 'Имя пользователя',
        example: 'Иван'
    })
    @IsString()
    firstName = '';

    @ApiProperty({
        description: 'Фамилия пользователя',
        example: 'Иванов'
    })
    @IsString()
    lastName = '';

    @ApiProperty({
        description: 'Возраст пользователя',
        example: 30
    })
    @IsNumber()
    age = 0;

    @ApiProperty({
        description: 'Пол пользователя',
        enum: Gender,
        example: Gender.MALE
    })
    @IsEnum(Gender)
    gender = Gender.OTHER;

    @ApiProperty({
        description: 'Уровень активности пользователя',
        enum: ActivityLevel,
        example: ActivityLevel.MODERATELY_ACTIVE
    })
    @IsEnum(ActivityLevel)
    activityLevel = ActivityLevel.SEDENTARY;

    @ApiProperty({
        description: 'Цели фитнеса пользователя',
        type: [String],
        enum: FitnessGoal,
        example: [FitnessGoal.WEIGHT_LOSS, FitnessGoal.ENDURANCE]
    })
    @IsArray()
    @IsEnum(FitnessGoal, { each: true })
    fitnessGoals: FitnessGoal[] = [];
} 
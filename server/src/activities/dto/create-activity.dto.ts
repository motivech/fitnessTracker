import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ActivityType {
  WALKING = 'walking',
  RUNNING = 'running',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  GYM = 'gym',
  OTHER = 'other',
}

export class CreateActivityDto {
  @ApiProperty({
    description: 'Тип активности',
    enum: ActivityType,
    example: ActivityType.RUNNING,
  })
  @IsNotEmpty()
  @IsEnum(ActivityType)
  type: ActivityType = ActivityType.OTHER;

  @ApiProperty({
    description: 'Длительность активности в минутах',
    example: 45,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  duration: number = 0;

  @ApiProperty({
    description: 'Пройденное расстояние в километрах',
    example: 5.5,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  distance: number = 0;

  @ApiProperty({
    description: 'Количество шагов',
    example: 6000,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  steps: number = 0;

  @ApiProperty({
    description: 'Потраченные калории',
    example: 350,
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  calories: number = 0;

  @ApiProperty({
    description: 'Дата активности',
    example: '2023-05-15T10:30:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date?: Date;

  @ApiProperty({
    description: 'Комментарий к активности',
    example: 'Пробежка в парке',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
} 
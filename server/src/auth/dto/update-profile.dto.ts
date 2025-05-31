import { IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Имя пользователя', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Фамилия пользователя', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Email пользователя', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Возраст пользователя', required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({ description: 'Вес пользователя (кг)', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: 'Рост пользователя (см)', required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ description: 'Краткая биография пользователя', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'URL аватара пользователя', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
} 
import { IsEnum, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ThemeOption, MeasurementSystem } from '../../entities/User';

class NotificationSettingsDto {
  @ApiProperty({ description: 'Напоминания о тренировках', required: false })
  @IsOptional()
  @IsBoolean()
  workoutReminders?: boolean;

  @ApiProperty({ description: 'Уведомления о достижениях', required: false })
  @IsOptional()
  @IsBoolean()
  achievementNotifications?: boolean;

  @ApiProperty({ description: 'Подписка на рассылку', required: false })
  @IsOptional()
  @IsBoolean()
  newsletterSubscription?: boolean;
}

export class UpdateUserSettingsDto {
  @ApiProperty({ 
    description: 'Тема оформления', 
    required: false,
    enum: ThemeOption
  })
  @IsOptional()
  @IsEnum(ThemeOption)
  theme?: ThemeOption;

  @ApiProperty({ 
    description: 'Система измерения', 
    required: false,
    enum: MeasurementSystem
  })
  @IsOptional()
  @IsEnum(MeasurementSystem)
  measurementSystem?: MeasurementSystem;

  @ApiProperty({ 
    description: 'Настройки уведомлений', 
    required: false,
    type: NotificationSettingsDto 
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;
} 
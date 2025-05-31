import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { Workout } from '../entities/Workout';
import { Program } from '../entities/Program';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Workout, Program]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledWorkoutsController } from './scheduled-workouts.controller';
import { ScheduledWorkoutsService } from './scheduled-workouts.service';
import { ScheduledWorkout } from '../entities/ScheduledWorkout';
import { Workout } from '../entities/Workout';
import { User } from '../entities/User';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledWorkout, Workout, User])],
  controllers: [ScheduledWorkoutsController],
  providers: [ScheduledWorkoutsService],
  exports: [ScheduledWorkoutsService],
})
export class ScheduledWorkoutsModule {} 
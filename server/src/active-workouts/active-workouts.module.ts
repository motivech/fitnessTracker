import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveWorkoutsController } from './active-workouts.controller';
import { ActiveWorkoutsService } from './active-workouts.service';
import { ActiveWorkout } from '../entities/ActiveWorkout';
import { Workout } from '../entities/Workout';
import { WorkoutProgress } from '../entities/WorkoutProgress';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActiveWorkout, Workout, WorkoutProgress]),
  ],
  controllers: [ActiveWorkoutsController],
  providers: [ActiveWorkoutsService],
  exports: [ActiveWorkoutsService],
})
export class ActiveWorkoutsModule {} 
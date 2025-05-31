import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { Workout } from '../entities/Workout';
import { User } from '../entities/User';
import { WorkoutExercise } from '../entities/WorkoutExercise';
import { Exercise } from '../entities/Exercise';
import { NotificationsModule } from '../notifications/notifications.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Workout, User, WorkoutExercise, Exercise]),
        NotificationsModule,
        AchievementsModule
    ],
    controllers: [WorkoutsController],
    providers: [WorkoutsService],
    exports: [WorkoutsService]
})
export class WorkoutsModule {} 
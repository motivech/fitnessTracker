import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { ExercisesModule } from './exercises/exercises.module';
import { ActivitiesModule } from './activities/activities.module';
import { ChallengesModule } from './challenges/challenges.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ScheduledWorkoutsModule } from './scheduled-workouts/scheduled-workouts.module';
import { ActiveWorkoutsModule } from './active-workouts/active-workouts.module';
import { ProgramsModule } from './programs/programs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './entities/User';
import { databaseConfig } from './config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule.forFeature([User]),
        ScheduleModule.forRoot(),
        AuthModule,
        WorkoutsModule,
        ExercisesModule,
        ActivitiesModule,
        ChallengesModule,
        ScheduledWorkoutsModule,
        AchievementsModule,
        ActiveWorkoutsModule,
        ProgramsModule,
        NotificationsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

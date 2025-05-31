import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { ScheduledWorkoutsModule } from '../scheduled-workouts/scheduled-workouts.module';

@Module({
  imports: [
    ScheduledWorkoutsModule,
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {} 
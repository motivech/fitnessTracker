import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/User';
import { Workout } from '../entities/Workout';
import { WorkoutExercise } from '../entities/WorkoutExercise';
import { Exercise } from '../entities/Exercise';
import { Achievement } from '../entities/Achievement';
import { Challenge } from '../entities/Challenge';
import { HealthMetric } from '../entities/HealthMetric';
import { Activity } from '../entities/Activity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123',
  database: 'fitness_app',
  entities: [
    User, 
    Workout, 
    WorkoutExercise, 
    Exercise, 
    Achievement, 
    Challenge, 
    HealthMetric, 
    Activity
  ],
  synchronize: true,
  autoLoadEntities: true,
  // Для отладки SQL запросов
  logging: ['error']
}; 
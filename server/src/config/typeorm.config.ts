import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Workout } from '../entities/Workout';
import { Achievement } from '../entities/Achievement';
import { Challenge } from '../entities/Challenge';
import { HealthMetric } from '../entities/HealthMetric';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'fitness_app',
    synchronize: true,
    logging: true,
    entities: [User, Workout, Achievement, Challenge, HealthMetric],
    subscribers: [],
    migrations: [],
}); 
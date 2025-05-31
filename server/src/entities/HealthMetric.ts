import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

export enum MetricType {
    HEART_RATE = 'heart_rate',
    SLEEP = 'sleep',
    STEPS = 'steps',
    WEIGHT = 'weight',
    BODY_FAT = 'body_fat',
    BLOOD_PRESSURE = 'blood_pressure'
}

@Entity()
export class HealthMetric {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'enum',
        enum: MetricType
    })
    type!: MetricType;

    @Column({ type: 'timestamp' })
    date!: Date;

    @Column({ type: 'float' })
    value!: number;

    @Column({ type: 'jsonb', nullable: true })
    additionalData!: {
        systolic?: number;
        diastolic?: number;
        duration?: number;
        quality?: number;
    };

    @Column({ type: 'text', nullable: true })
    notes!: string;

    @ManyToOne(() => User, user => user.healthMetrics)
    user!: User;
} 
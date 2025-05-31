import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

export enum ChallengeType {
    DISTANCE = 'distance',
    CALORIES = 'calories',
    WORKOUTS = 'workouts',
    STREAK = 'streak'
}

export enum ChallengeStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

@Entity()
export class Challenge {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({
        type: 'enum',
        enum: ChallengeType
    })
    type!: ChallengeType;

    @Column({ type: 'timestamp' })
    startDate!: Date;

    @Column({ type: 'timestamp' })
    endDate!: Date;

    @Column({ type: 'int' })
    targetValue!: number;

    @Column({
        type: 'enum',
        enum: ChallengeStatus,
        default: ChallengeStatus.ACTIVE
    })
    status!: ChallengeStatus;

    @Column({ type: 'int', default: 0 })
    currentValue!: number;

    @Column({ type: 'int' })
    rewardPoints!: number;

    @ManyToOne(() => User, user => user.createdChallenges)
    creator!: User;

    @ManyToMany(() => User, user => user.challenges)
    participants!: User[];

    constructor() {
        this.currentValue = 0;
        this.status = ChallengeStatus.ACTIVE;
    }
} 
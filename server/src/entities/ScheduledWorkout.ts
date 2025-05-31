import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './User';
import { Workout } from './Workout';

@Entity('scheduled_workouts')
export class ScheduledWorkout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  workoutId!: string;

  @ManyToOne(() => Workout)
  @JoinColumn({ name: 'workoutId' })
  workout!: Workout;

  @Column({ nullable: true })
  programId?: string;

  @Column('date')
  scheduledDate!: string;

  @Column('time')
  scheduledTime!: string;
  
  @Column({ default: false })
  completed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Workout } from './Workout';
import { Exercise } from './Exercise';

@Entity()
export class WorkoutExercise {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Workout, workout => workout.workoutExercises, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'workoutId' })
    workout!: Workout;

    @Column()
    workoutId!: string;

    @ManyToOne(() => Exercise, exercise => exercise.workoutExercises)
    @JoinColumn({ name: 'exerciseId' })
    exercise!: Exercise;

    @Column()
    exerciseId!: string;

    @Column({ type: 'int' })
    order!: number;

    @Column({ type: 'int', nullable: true })
    sets!: number;

    @Column({ type: 'int', nullable: true })
    reps!: number;

    @Column({ type: 'float', nullable: true })
    weight!: number;

    @Column({ type: 'int', nullable: true })
    durationSeconds!: number;

    @Column({ type: 'float', nullable: true })
    distance!: number;

    @Column({ type: 'text', nullable: true })
    notes!: string;
} 
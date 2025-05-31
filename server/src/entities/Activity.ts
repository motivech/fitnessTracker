import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn, 
    CreateDateColumn 
} from 'typeorm';
import { User } from './User';
import { ApiProperty } from '@nestjs/swagger';

export enum ActivityType {
    WALKING = 'walking',
    RUNNING = 'running',
    CYCLING = 'cycling',
    SWIMMING = 'swimming',
    GYM = 'gym',
    OTHER = 'other',
}

@Entity()
export class Activity {
    @ApiProperty({ description: 'Уникальный идентификатор активности', example: '123e4567-e89b-12d3-a456-426614174000' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'Тип активности', enum: ActivityType, example: ActivityType.RUNNING })
    @Column({
        type: 'enum',
        enum: ActivityType,
        default: ActivityType.OTHER
    })
    type!: ActivityType;

    @ApiProperty({ description: 'Продолжительность активности в минутах', example: 45 })
    @Column()
    duration!: number;

    @ApiProperty({ description: 'Пройденное расстояние в километрах', example: 5.5 })
    @Column({ type: 'float' })
    distance!: number;

    @ApiProperty({ description: 'Количество шагов', example: 6000 })
    @Column({ type: 'int' })
    steps!: number;

    @ApiProperty({ description: 'Потраченные калории', example: 350 })
    @Column({ type: 'int' })
    calories!: number;

    @ApiProperty({ description: 'Дата активности', example: '2023-05-15T10:30:00Z' })
    @Column({ type: 'timestamp' })
    date!: Date;

    @ApiProperty({ description: 'Комментарий к активности', example: 'Пробежка в парке' })
    @Column({ type: 'text', nullable: true })
    comment!: string;

    @ApiProperty({ description: 'Дата создания записи', example: '2023-05-15T10:30:00Z' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: 'Пользователь, создавший активность' })
    @ManyToOne(() => User, user => user.activities)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ApiProperty({ description: 'ID пользователя', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Column()
    userId!: string;
} 
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    OneToMany,
    JoinColumn, 
    CreateDateColumn 
} from 'typeorm';
import { User } from './User';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Сущность программы тренировок
 */
@Entity()
export class Program {
    @ApiProperty({ description: 'Уникальный идентификатор программы' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'Название программы тренировок' })
    @Column()
    name!: string;

    @ApiProperty({ description: 'Описание программы тренировок' })
    @Column({ type: 'text' })
    description!: string;

    @ApiProperty({ description: 'Длительность программы в днях' })
    @Column()
    durationDays!: number;

    @ApiProperty({ description: 'Структура программы в формате JSON' })
    @Column({ type: 'jsonb' })
    workoutSchedule!: {
        workoutId: string;
        dayOfProgram: number;
        timeOfDay?: string;
    }[];

    @ApiProperty({ description: 'Является ли программа публичной' })
    @Column({ default: false })
    isPublic!: boolean;

    @ApiProperty({ description: 'Дата создания программы' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: 'ID пользователя, создавшего программу' })
    @Column()
    creatorId!: string;

    @ApiProperty({ description: 'Пользователь, создавший программу' })
    @ManyToOne(() => User, user => user.createdChallenges)
    @JoinColumn({ name: 'creatorId' })
    creator!: User;
} 
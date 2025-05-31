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

export enum NotificationType {
    WORKOUT_REMINDER = 'workout_reminder', // Напоминание о тренировке
    ACHIEVEMENT = 'achievement',           // Получено новое достижение
    NEW_WORKOUT = 'new_workout',           // Добавлена новая общедоступная тренировка
    NEW_PROGRAM = 'new_program',           // Добавлена новая программа тренировок
    WORKOUT_COMPLETED = 'workout_completed', // Тренировка завершена
    SYSTEM = 'system'                      // Системное уведомление
}

@Entity()
export class Notification {
    @ApiProperty({ description: 'Уникальный идентификатор уведомления' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'Заголовок уведомления' })
    @Column()
    title!: string;

    @ApiProperty({ description: 'Содержание уведомления' })
    @Column({ type: 'text' })
    message!: string;

    @ApiProperty({ description: 'Тип уведомления', enum: NotificationType })
    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type!: NotificationType;

    @ApiProperty({ description: 'Статус прочтения' })
    @Column({ default: false })
    read!: boolean;

    @ApiProperty({ description: 'Дата создания уведомления' })
    @CreateDateColumn()
    createdAt!: Date;

    @ApiProperty({ description: 'ID связанного элемента (тренировка, достижение и т.д.)' })
    @Column({ nullable: true })
    relatedItemId?: string;

    @ApiProperty({ description: 'Пользователь, которому адресовано уведомление' })
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @ApiProperty({ description: 'ID пользователя' })
    @Column()
    userId!: string;
} 
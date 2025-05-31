import { WorkoutType } from '../entities/Workout';

export interface ProgramSeed {
    name: string;
    description: string;
    durationDays: number;
    isPublic: boolean;
    workoutSchedule: {
        workoutName: string; // Название тренировки для поиска
        dayOfProgram: number; // День программы
        timeOfDay?: string; // Время дня (опционально)
    }[];
}

export const programsSeed: ProgramSeed[] = [
    // Программа для начинающих
    {
        name: 'Фитнес для начинающих: 7 дней',
        description: 'Недельная программа для новичков, помогающая войти в ритм тренировок и освоить базовые упражнения',
        durationDays: 7,
        isPublic: true,
        workoutSchedule: [
            { workoutName: 'Базовая тренировка для новичков', dayOfProgram: 1, timeOfDay: '08:00' },
            { workoutName: 'Йога для начинающих', dayOfProgram: 2, timeOfDay: '19:00' },
            { workoutName: 'Тренировка для новичков: верхняя часть тела', dayOfProgram: 3, timeOfDay: '08:00' },
            { workoutName: 'Утренняя пробежка', dayOfProgram: 5, timeOfDay: '08:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 6, timeOfDay: '19:00' },
            { workoutName: 'Тренировка ног', dayOfProgram: 7, timeOfDay: '10:00' }
        ]
    },
    
    // Программа для похудения
    {
        name: 'Программа для снижения веса: 14 дней',
        description: 'Интенсивная двухнедельная программа, направленная на сжигание жира и улучшение метаболизма',
        durationDays: 14,
        isPublic: true,
        workoutSchedule: [
            { workoutName: 'Кардио + Сила', dayOfProgram: 1, timeOfDay: '08:00' },
            { workoutName: 'HIIT тренировка для жиросжигания', dayOfProgram: 2, timeOfDay: '19:00' },
            { workoutName: 'Утренняя пробежка', dayOfProgram: 3, timeOfDay: '08:00' },
            { workoutName: 'Интервальная тренировка', dayOfProgram: 4, timeOfDay: '19:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 5, timeOfDay: '08:00' },
            { workoutName: 'Круговая тренировка', dayOfProgram: 6, timeOfDay: '10:00' },
            { workoutName: 'Плавание', dayOfProgram: 7, timeOfDay: '09:00' },
            { workoutName: 'Кардио + Сила', dayOfProgram: 8, timeOfDay: '08:00' },
            { workoutName: 'Силовая выносливость', dayOfProgram: 9, timeOfDay: '19:00' },
            { workoutName: 'Кардио на велосипеде', dayOfProgram: 10, timeOfDay: '08:00' },
            { workoutName: 'Интервальная тренировка', dayOfProgram: 11, timeOfDay: '19:00' },
            { workoutName: 'Йога для начинающих', dayOfProgram: 12, timeOfDay: '08:00' },
            { workoutName: 'Круговая тренировка', dayOfProgram: 13, timeOfDay: '10:00' },
            { workoutName: 'Беговая тренировка', dayOfProgram: 14, timeOfDay: '09:00' }
        ]
    },
    
    // Программа для набора мышечной массы
    {
        name: 'Программа для набора мышечной массы: 30 дней',
        description: 'Полная месячная программа для новичков и среднего уровня, направленная на увеличение мышечной массы и силы',
        durationDays: 30,
        isPublic: true,
        workoutSchedule: [
            // Неделя 1
            { workoutName: 'Тренировка верхней части тела', dayOfProgram: 1, timeOfDay: '18:00' },
            { workoutName: 'Тренировка ног', dayOfProgram: 2, timeOfDay: '18:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 3, timeOfDay: '18:00' },
            { workoutName: 'Силовая тренировка верхней части тела', dayOfProgram: 4, timeOfDay: '18:00' },
            { workoutName: 'Тренировка рук', dayOfProgram: 5, timeOfDay: '18:00' },
            { workoutName: 'Утренняя пробежка', dayOfProgram: 6, timeOfDay: '09:00' },
            { workoutName: 'Отдых', dayOfProgram: 7 },
            
            // Неделя 2
            { workoutName: 'Тренировка верхней части тела', dayOfProgram: 8, timeOfDay: '18:00' },
            { workoutName: 'Тренировка ног', dayOfProgram: 9, timeOfDay: '18:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 10, timeOfDay: '18:00' },
            { workoutName: 'Силовая тренировка верхней части тела', dayOfProgram: 11, timeOfDay: '18:00' },
            { workoutName: 'Тренировка спины', dayOfProgram: 12, timeOfDay: '18:00' },
            { workoutName: 'Утренняя пробежка', dayOfProgram: 13, timeOfDay: '09:00' },
            { workoutName: 'Отдых', dayOfProgram: 14 },
            
            // Неделя 3
            { workoutName: 'Полноценная тренировка всего тела', dayOfProgram: 15, timeOfDay: '18:00' },
            { workoutName: 'Тренировка ног', dayOfProgram: 16, timeOfDay: '18:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 17, timeOfDay: '18:00' },
            { workoutName: 'Силовая тренировка верхней части тела', dayOfProgram: 18, timeOfDay: '18:00' },
            { workoutName: 'Тренировка рук', dayOfProgram: 19, timeOfDay: '18:00' },
            { workoutName: 'Кардио + Сила', dayOfProgram: 20, timeOfDay: '09:00' },
            { workoutName: 'Отдых', dayOfProgram: 21 },
            
            // Неделя 4
            { workoutName: 'Тренировка верхней части тела', dayOfProgram: 22, timeOfDay: '18:00' },
            { workoutName: 'Тренировка ног', dayOfProgram: 23, timeOfDay: '18:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 24, timeOfDay: '18:00' },
            { workoutName: 'Силовая тренировка верхней части тела', dayOfProgram: 25, timeOfDay: '18:00' },
            { workoutName: 'Тренировка спины', dayOfProgram: 26, timeOfDay: '18:00' },
            { workoutName: 'Утренняя пробежка', dayOfProgram: 27, timeOfDay: '09:00' },
            { workoutName: 'Отдых', dayOfProgram: 28 },
            { workoutName: 'Полноценная тренировка всего тела', dayOfProgram: 29, timeOfDay: '18:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 30, timeOfDay: '18:00' }
        ]
    },
    
    // Программа гибкости и растяжки
    {
        name: 'Программа гибкость и йога: 21 день',
        description: 'Трехнедельная программа для улучшения гибкости, подвижности суставов и расслабления мышц',
        durationDays: 21,
        isPublic: true,
        workoutSchedule: [
            // Неделя 1
            { workoutName: 'Йога для начинающих', dayOfProgram: 1, timeOfDay: '19:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 2, timeOfDay: '19:00' },
            { workoutName: 'Утренняя зарядка', dayOfProgram: 3, timeOfDay: '08:00' },
            { workoutName: 'Йога для начинающих', dayOfProgram: 4, timeOfDay: '19:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 5, timeOfDay: '19:00' },
            { workoutName: 'Утренняя зарядка', dayOfProgram: 6, timeOfDay: '08:00' },
            { workoutName: 'Отдых', dayOfProgram: 7 },
            
            // Неделя 2
            { workoutName: 'Йога для начинающих', dayOfProgram: 8, timeOfDay: '19:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 9, timeOfDay: '19:00' },
            { workoutName: 'Утренняя зарядка', dayOfProgram: 10, timeOfDay: '08:00' },
            { workoutName: 'Йога для начинающих', dayOfProgram: 11, timeOfDay: '19:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 12, timeOfDay: '19:00' },
            { workoutName: 'Утренняя зарядка', dayOfProgram: 13, timeOfDay: '08:00' },
            { workoutName: 'Отдых', dayOfProgram: 14 },
            
            // Неделя 3
            { workoutName: 'Йога для начинающих', dayOfProgram: 15, timeOfDay: '19:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 16, timeOfDay: '19:00' },
            { workoutName: 'Утренняя зарядка', dayOfProgram: 17, timeOfDay: '08:00' },
            { workoutName: 'Йога для начинающих', dayOfProgram: 18, timeOfDay: '19:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 19, timeOfDay: '19:00' },
            { workoutName: 'Утренняя зарядка', dayOfProgram: 20, timeOfDay: '08:00' },
            { workoutName: 'Йога для начинающих', dayOfProgram: 21, timeOfDay: '19:00' }
        ]
    },
    
    // Программа для улучшения выносливости
    {
        name: 'Программа для выносливости: 28 дней',
        description: 'Четырехнедельная программа для повышения выносливости и улучшения работы сердечно-сосудистой системы',
        durationDays: 28,
        isPublic: true,
        workoutSchedule: [
            // Неделя 1
            { workoutName: 'Утренняя пробежка', dayOfProgram: 1, timeOfDay: '08:00' },
            { workoutName: 'Интервальная тренировка', dayOfProgram: 2, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 3 },
            { workoutName: 'Кардио на велосипеде', dayOfProgram: 4, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 5 },
            { workoutName: 'Беговая тренировка', dayOfProgram: 6, timeOfDay: '08:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 7, timeOfDay: '18:00' },
            
            // Неделя 2
            { workoutName: 'Утренняя пробежка', dayOfProgram: 8, timeOfDay: '08:00' },
            { workoutName: 'Интервальная тренировка', dayOfProgram: 9, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 10 },
            { workoutName: 'Велосипедная прогулка', dayOfProgram: 11, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 12 },
            { workoutName: 'Беговая тренировка', dayOfProgram: 13, timeOfDay: '08:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 14, timeOfDay: '18:00' },
            
            // Неделя 3
            { workoutName: 'Кардио + Сила', dayOfProgram: 15, timeOfDay: '08:00' },
            { workoutName: 'Плавание', dayOfProgram: 16, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 17 },
            { workoutName: 'Кардио на велосипеде', dayOfProgram: 18, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 19 },
            { workoutName: 'Беговая тренировка', dayOfProgram: 20, timeOfDay: '08:00' },
            { workoutName: 'Растяжка и гибкость', dayOfProgram: 21, timeOfDay: '18:00' },
            
            // Неделя 4
            { workoutName: 'Кардио + Сила', dayOfProgram: 22, timeOfDay: '08:00' },
            { workoutName: 'Интервальная тренировка', dayOfProgram: 23, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 24 },
            { workoutName: 'Велосипедная прогулка', dayOfProgram: 25, timeOfDay: '18:00' },
            { workoutName: 'Отдых', dayOfProgram: 26 },
            { workoutName: 'Беговая тренировка', dayOfProgram: 27, timeOfDay: '08:00' },
            { workoutName: 'Плавание', dayOfProgram: 28, timeOfDay: '10:00' }
        ]
    }
]; 
import { WorkoutType } from '../entities/Workout';

export interface WorkoutSeed {
    name: string;
    description: string;
    type: WorkoutType;
    difficulty: string;
    duration: number;
    caloriesBurned: number;
    isPublic: boolean;
    exercises: {
        name: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
    }[];
}

export const workoutsSeed: WorkoutSeed[] = [
    // Кардио тренировки
    {
        name: 'Утренняя кардио тренировка',
        description: 'Легкая кардио тренировка для утренней зарядки и заряда энергией на весь день',
        type: WorkoutType.CARDIO,
        difficulty: 'начинающий',
        duration: 30,
        caloriesBurned: 250,
        isPublic: true,
        exercises: [
            {
                name: 'Бег',
                sets: 1,
                reps: 1,
                duration: 15
            },
            {
                name: 'Прыжки со скакалкой',
                sets: 3,
                reps: 1,
                duration: 3
            },
            {
                name: 'Велотренажер',
                sets: 1,
                reps: 1,
                duration: 10
            }
        ]
    },
    {
        name: 'Интенсивная кардио тренировка',
        description: 'Высокоинтенсивная кардио тренировка для максимального сжигания калорий',
        type: WorkoutType.CARDIO,
        difficulty: 'продвинутый',
        duration: 45,
        caloriesBurned: 500,
        isPublic: true,
        exercises: [
            {
                name: 'Бег',
                sets: 1,
                reps: 1,
                duration: 20
            },
            {
                name: 'Прыжки со скакалкой',
                sets: 5,
                reps: 1,
                duration: 3
            },
            {
                name: 'Эллиптический тренажер',
                sets: 1,
                reps: 1,
                duration: 15
            }
        ]
    },
    
    // Силовые тренировки
    {
        name: 'Тренировка верхней части тела',
        description: 'Полная тренировка мышц груди, спины и рук',
        type: WorkoutType.STRENGTH,
        difficulty: 'средний',
        duration: 60,
        caloriesBurned: 400,
        isPublic: true,
        exercises: [
            {
                name: 'Жим лежа',
                sets: 4,
                reps: 10,
                weight: 60
            },
            {
                name: 'Подтягивания',
                sets: 3,
                reps: 8
            },
            {
                name: 'Разводка гантелей лежа',
                sets: 3,
                reps: 12,
                weight: 16
            },
            {
                name: 'Тяга верхнего блока',
                sets: 3,
                reps: 12,
                weight: 50
            },
            {
                name: 'Сгибание рук с гантелями',
                sets: 3,
                reps: 12,
                weight: 12
            }
        ]
    },
    {
        name: 'День ног',
        description: 'Тренировка для развития силы и объема мышц ног',
        type: WorkoutType.STRENGTH,
        difficulty: 'продвинутый',
        duration: 70,
        caloriesBurned: 500,
        isPublic: true,
        exercises: [
            {
                name: 'Приседания со штангой',
                sets: 5,
                reps: 8,
                weight: 80
            },
            {
                name: 'Жим ногами',
                sets: 4,
                reps: 12,
                weight: 150
            },
            {
                name: 'Выпады с гантелями',
                sets: 3,
                reps: 10,
                weight: 16
            },
            {
                name: 'Становая тяга',
                sets: 3,
                reps: 8,
                weight: 100
            }
        ]
    },
    {
        name: 'Тренировка плеч и рук',
        description: 'Фокусированная тренировка на развитие плечевого пояса и рук',
        type: WorkoutType.STRENGTH,
        difficulty: 'средний',
        duration: 45,
        caloriesBurned: 350,
        isPublic: true,
        exercises: [
            {
                name: 'Жим гантелей сидя',
                sets: 4,
                reps: 10,
                weight: 16
            },
            {
                name: 'Разведение гантелей в стороны',
                sets: 3,
                reps: 15,
                weight: 8
            },
            {
                name: 'Сгибание рук с гантелями',
                sets: 3,
                reps: 12,
                weight: 12
            },
            {
                name: 'Французский жим',
                sets: 3,
                reps: 12,
                weight: 20
            }
        ]
    },
    
    // Комплексные тренировки
    {
        name: 'Полноценная тренировка всего тела',
        description: 'Эффективная тренировка для проработки всех основных групп мышц за одно занятие',
        type: WorkoutType.CUSTOM,
        difficulty: 'средний',
        duration: 75,
        caloriesBurned: 450,
        isPublic: true,
        exercises: [
            {
                name: 'Жим лежа',
                sets: 3,
                reps: 10,
                weight: 60
            },
            {
                name: 'Приседания со штангой',
                sets: 3,
                reps: 12,
                weight: 70
            },
            {
                name: 'Тяга штанги в наклоне',
                sets: 3,
                reps: 10,
                weight: 50
            },
            {
                name: 'Жим гантелей сидя',
                sets: 3,
                reps: 12,
                weight: 14
            },
            {
                name: 'Скручивания',
                sets: 3,
                reps: 15
            }
        ]
    },
    {
        name: 'Круговая тренировка',
        description: 'Высокоинтенсивная круговая тренировка для сжигания жира и повышения выносливости',
        type: WorkoutType.HIIT,
        difficulty: 'продвинутый',
        duration: 40,
        caloriesBurned: 500,
        isPublic: true,
        exercises: [
            {
                name: 'Отжимания',
                sets: 3,
                reps: 15
            },
            {
                name: 'Приседания со штангой',
                sets: 3,
                reps: 15,
                weight: 40
            },
            {
                name: 'Подтягивания',
                sets: 3,
                reps: 8
            },
            {
                name: 'Скручивания',
                sets: 3,
                reps: 20
            },
            {
                name: 'Прыжки со скакалкой',
                sets: 3,
                reps: 1,
                duration: 1
            }
        ]
    },
    
    // Тренировки для начинающих
    {
        name: 'Базовая тренировка для новичков',
        description: 'Идеальная тренировка для тех, кто только начинает заниматься',
        type: WorkoutType.CUSTOM,
        difficulty: 'начинающий',
        duration: 40,
        caloriesBurned: 250,
        isPublic: true,
        exercises: [
            {
                name: 'Отжимания',
                sets: 3,
                reps: 10
            },
            {
                name: 'Приседания',
                sets: 3,
                reps: 15
            },
            {
                name: 'Планка',
                sets: 3,
                reps: 1,
                duration: 0.5
            }
        ]
    },
    {
        name: 'Тренировка для новичков: верхняя часть тела',
        description: 'Мягкое введение в силовые тренировки для верхней части тела',
        type: WorkoutType.CUSTOM,
        difficulty: 'начинающий',
        duration: 35,
        caloriesBurned: 200,
        isPublic: true,
        exercises: [
            {
                name: 'Отжимания',
                sets: 3,
                reps: 8
            },
            {
                name: 'Разводка гантелей лежа',
                sets: 3,
                reps: 10,
                weight: 8
            },
            {
                name: 'Тяга верхнего блока',
                sets: 3,
                reps: 10,
                weight: 30
            }
        ]
    }
]; 
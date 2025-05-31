export interface AchievementSeed {
    name: string;
    description: string;
    type: string;
    points: number;
    requirements: {
        metric: string;
        value: number;
    };
}

export const achievementsSeed: AchievementSeed[] = [
    // Достижения за тренировки
    {
        name: 'Новичок',
        description: 'Выполните свою первую тренировку',
        type: 'workout',
        points: 20,
        requirements: {
            metric: 'total_workouts',
            value: 1
        }
    },
    {
        name: 'Любитель',
        description: 'Выполните 10 тренировок',
        type: 'workout',
        points: 20,
        requirements: {
            metric: 'total_workouts',
            value: 10
        }
    },
    {
        name: 'Энтузиаст',
        description: 'Выполните 25 тренировок',
        type: 'workout',
        points: 20,
        requirements: {
            metric: 'total_workouts',
            value: 25
        }
    },
    {
        name: 'Опытный',
        description: 'Выполните 50 тренировок',
        type: 'workout',
        points: 20,
        requirements: {
            metric: 'total_workouts',
            value: 50
        }
    },
    {
        name: 'Профессионал',
        description: 'Выполните 100 тренировок',
        type: 'workout',
        points: 20,
        requirements: {
            metric: 'total_workouts',
            value: 100
        }
    },
    
    // Достижения за непрерывность
    {
        name: 'Начало привычки',
        description: 'Занимайтесь 3 дня подряд',
        type: 'streak',
        points: 20,
        requirements: {
            metric: 'streak_days',
            value: 3
        }
    },
    {
        name: 'На верном пути',
        description: 'Занимайтесь 7 дней подряд',
        type: 'streak',
        points: 20,
        requirements: {
            metric: 'streak_days',
            value: 7
        }
    },
    {
        name: 'Последовательность',
        description: 'Занимайтесь 14 дней подряд',
        type: 'streak',
        points: 20,
        requirements: {
            metric: 'streak_days',
            value: 14
        }
    },
    {
        name: 'Упорство',
        description: 'Занимайтесь 30 дней подряд',
        type: 'streak',
        points: 20,
        requirements: {
            metric: 'streak_days',
            value: 30
        }
    },
    
    // Достижения за дистанцию
    {
        name: 'Первые шаги',
        description: 'Преодолейте дистанцию в 5 км',
        type: 'distance',
        points: 20,
        requirements: {
            metric: 'total_distance',
            value: 5
        }
    },
    {
        name: 'Марафонец',
        description: 'Преодолейте дистанцию в 42 км',
        type: 'distance',
        points: 20,
        requirements: {
            metric: 'total_distance',
            value: 42
        }
    },
    {
        name: 'Путешественник',
        description: 'Преодолейте дистанцию в 100 км',
        type: 'distance',
        points: 20,
        requirements: {
            metric: 'total_distance',
            value: 100
        }
    },
    
    // Достижения за уровень
    {
        name: 'Рост',
        description: 'Достигните 5 уровня',
        type: 'level',
        points: 20,
        requirements: {
            metric: 'level',
            value: 5
        }
    },
    {
        name: 'Прогресс',
        description: 'Достигните 10 уровня',
        type: 'level',
        points: 20,
        requirements: {
            metric: 'level',
            value: 10
        }
    },
    {
        name: 'Мастерство',
        description: 'Достигните 20 уровня',
        type: 'level',
        points: 20,
        requirements: {
            metric: 'level',
            value: 20
        }
    },
    
    // Достижения за упражнения
    {
        name: 'Разнообразие',
        description: 'Выполните 10 различных упражнений',
        type: 'exercise',
        points: 20,
        requirements: {
            metric: 'exercise_count',
            value: 10
        }
    },
    {
        name: 'Коллекционер',
        description: 'Выполните 20 различных упражнений',
        type: 'exercise',
        points: 20,
        requirements: {
            metric: 'exercise_count',
            value: 20
        }
    },
    {
        name: 'Знаток',
        description: 'Выполните 30 различных упражнений',
        type: 'exercise',
        points: 20,
        requirements: {
            metric: 'exercise_count',
            value: 30
        }
    }
]; 
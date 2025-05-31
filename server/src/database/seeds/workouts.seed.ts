import { DataSource } from 'typeorm';
import { Workout, WorkoutType, WorkoutStatus } from '../../entities/Workout';
import { WorkoutExercise } from '../../entities/WorkoutExercise';
import { Exercise, ExerciseType, MuscleGroup } from '../../entities/Exercise';
import { User } from '../../entities/User';

interface WorkoutExerciseData {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
}

interface WorkoutData {
    name: string;
    description: string;
    type: WorkoutType;
    durationMinutes: number;
    caloriesBurned: number;
    distance?: number;
    exercises: WorkoutExerciseData[];
}

export const workoutsSeed = async (dataSource: DataSource) => {
    const workoutRepository = dataSource.getRepository(Workout);
    const exerciseRepository = dataSource.getRepository(Exercise);
    const workoutExerciseRepository = dataSource.getRepository(WorkoutExercise);
    const userRepository = dataSource.getRepository(User);

    // Создаем базовые упражнения, если их нет
    const exercises = await exerciseRepository.find();
    if (exercises.length === 0) {
        const basicExercises = [
            { name: 'Бег', description: 'Бег в среднем темпе', type: ExerciseType.CARDIO, muscleGroup: MuscleGroup.CARDIO },
            { name: 'Приседания', description: 'Приседания со штангой', type: ExerciseType.STRENGTH, muscleGroup: MuscleGroup.LEGS },
            { name: 'Жим лежа', description: 'Жим штанги лежа', type: ExerciseType.STRENGTH, muscleGroup: MuscleGroup.CHEST },
            { name: 'Подтягивания', description: 'Подтягивания на перекладине', type: ExerciseType.STRENGTH, muscleGroup: MuscleGroup.BACK },
            { name: 'Планка', description: 'Статическое упражнение для кора', type: ExerciseType.STRENGTH, muscleGroup: MuscleGroup.CORE },
            { name: 'Отжимания', description: 'Классические отжимания от пола', type: ExerciseType.STRENGTH, muscleGroup: MuscleGroup.CHEST },
            { name: 'Выпады', description: 'Выпады с гантелями', type: ExerciseType.STRENGTH, muscleGroup: MuscleGroup.LEGS },
            { name: 'Тяга верхнего блока', description: 'Тяга к груди', type: ExerciseType.STRENGTH, muscleGroup: MuscleGroup.BACK },
            { name: 'Плавание', description: 'Плавание различными стилями', type: ExerciseType.CARDIO, muscleGroup: MuscleGroup.FULLBODY },
            { name: 'Велосипед', description: 'Езда на велосипеде', type: ExerciseType.CARDIO, muscleGroup: MuscleGroup.CARDIO }
        ];

        for (const exercise of basicExercises) {
            const newExercise = exerciseRepository.create({
                name: exercise.name,
                description: exercise.description,
                type: exercise.type,
                muscleGroup: exercise.muscleGroup
            });
            await exerciseRepository.save(newExercise);
        }
    }

    // Создаем тренировки
    const workouts: WorkoutData[] = [
        {
            name: 'Утренняя пробежка',
            description: 'Легкая кардио тренировка для утра',
            type: WorkoutType.CARDIO,
            durationMinutes: 30,
            caloriesBurned: 300,
            distance: 3.5,
            exercises: [
                { name: 'Бег', sets: 1, reps: 1, duration: 1800 },
                { name: 'Растяжка', sets: 1, reps: 1, duration: 300 }
            ]
        },
        {
            name: 'Силовая тренировка верхней части тела',
            description: 'Комплексная тренировка для мышц груди, спины и рук',
            type: WorkoutType.STRENGTH,
            durationMinutes: 60,
            caloriesBurned: 450,
            exercises: [
                { name: 'Жим лежа', sets: 4, reps: 10, weight: 70 },
                { name: 'Тяга верхнего блока', sets: 4, reps: 12, weight: 60 },
                { name: 'Отжимания', sets: 3, reps: 15 }
            ]
        },
        {
            name: 'Тренировка ног',
            description: 'Интенсивная тренировка для мышц ног',
            type: WorkoutType.STRENGTH,
            durationMinutes: 45,
            caloriesBurned: 400,
            exercises: [
                { name: 'Приседания', sets: 4, reps: 12, weight: 80 },
                { name: 'Выпады', sets: 3, reps: 10, weight: 20 },
                { name: 'Планка', sets: 3, reps: 1, duration: 60 }
            ]
        },
        {
            name: 'Кардио + Сила',
            description: 'Комбинированная тренировка для выносливости и силы',
            type: WorkoutType.HIIT,
            durationMinutes: 40,
            caloriesBurned: 350,
            exercises: [
                { name: 'Бег', sets: 1, reps: 1, duration: 600 },
                { name: 'Отжимания', sets: 3, reps: 10 },
                { name: 'Планка', sets: 3, reps: 1, duration: 45 }
            ]
        },
        {
            name: 'Плавание',
            description: 'Тренировка в бассейне',
            type: WorkoutType.CARDIO,
            durationMinutes: 45,
            caloriesBurned: 380,
            distance: 1.5,
            exercises: [
                { name: 'Плавание', sets: 1, reps: 1, duration: 1800 },
                { name: 'Растяжка', sets: 1, reps: 1, duration: 300 }
            ]
        },
        {
            name: 'Йога для начинающих',
            description: 'Базовые асаны для гибкости и расслабления',
            type: WorkoutType.FLEXIBILITY,
            durationMinutes: 30,
            caloriesBurned: 150,
            exercises: [
                { name: 'Планка', sets: 3, reps: 1, duration: 30 },
                { name: 'Растяжка', sets: 1, reps: 1, duration: 1200 }
            ]
        },
        {
            name: 'Интервальная тренировка',
            description: 'Высокоинтенсивные интервалы для сжигания жира',
            type: WorkoutType.HIIT,
            durationMinutes: 25,
            caloriesBurned: 300,
            exercises: [
                { name: 'Бег', sets: 8, reps: 1, duration: 30 },
                { name: 'Отжимания', sets: 8, reps: 10 }
            ]
        },
        {
            name: 'Тренировка спины',
            description: 'Упражнения для укрепления мышц спины',
            type: WorkoutType.STRENGTH,
            durationMinutes: 50,
            caloriesBurned: 320,
            exercises: [
                { name: 'Подтягивания', sets: 4, reps: 8 },
                { name: 'Тяга верхнего блока', sets: 4, reps: 12, weight: 50 }
            ]
        },
        {
            name: 'Велосипедная прогулка',
            description: 'Кардио тренировка на велосипеде',
            type: WorkoutType.CARDIO,
            durationMinutes: 60,
            caloriesBurned: 400,
            distance: 15,
            exercises: [
                { name: 'Велосипед', sets: 1, reps: 1, duration: 3600 }
            ]
        },
        {
            name: 'Круговая тренировка',
            description: 'Комплексная тренировка всего тела',
            type: WorkoutType.HIIT,
            durationMinutes: 35,
            caloriesBurned: 350,
            exercises: [
                { name: 'Приседания', sets: 3, reps: 15 },
                { name: 'Отжимания', sets: 3, reps: 12 },
                { name: 'Планка', sets: 3, reps: 1, duration: 45 }
            ]
        },
        {
            name: 'Растяжка и гибкость',
            description: 'Комплекс упражнений для развития гибкости',
            type: WorkoutType.FLEXIBILITY,
            durationMinutes: 40,
            caloriesBurned: 150,
            exercises: [
                { name: 'Растяжка', sets: 1, reps: 1, duration: 2400 }
            ]
        },
        {
            name: 'Силовая выносливость',
            description: 'Тренировка для развития силовой выносливости',
            type: WorkoutType.STRENGTH,
            durationMinutes: 55,
            caloriesBurned: 400,
            exercises: [
                { name: 'Приседания', sets: 4, reps: 15, weight: 50 },
                { name: 'Отжимания', sets: 4, reps: 15 },
                { name: 'Планка', sets: 4, reps: 1, duration: 60 }
            ]
        },
        {
            name: 'Кардио на велосипеде',
            description: 'Интенсивная кардио тренировка',
            type: WorkoutType.CARDIO,
            durationMinutes: 45,
            caloriesBurned: 350,
            distance: 12,
            exercises: [
                { name: 'Велосипед', sets: 1, reps: 1, duration: 2700 }
            ]
        },
        {
            name: 'Тренировка рук',
            description: 'Изолированная тренировка бицепса и трицепса',
            type: WorkoutType.STRENGTH,
            durationMinutes: 40,
            caloriesBurned: 250,
            exercises: [
                { name: 'Отжимания', sets: 4, reps: 12 },
                { name: 'Планка', sets: 3, reps: 1, duration: 45 }
            ]
        },
        {
            name: 'Утренняя зарядка',
            description: 'Легкая утренняя тренировка для бодрости',
            type: WorkoutType.CUSTOM,
            durationMinutes: 15,
            caloriesBurned: 100,
            exercises: [
                { name: 'Растяжка', sets: 1, reps: 1, duration: 300 },
                { name: 'Отжимания', sets: 2, reps: 10 }
            ]
        },
        {
            name: 'Тренировка кора',
            description: 'Упражнения для укрепления мышц кора',
            type: WorkoutType.STRENGTH,
            durationMinutes: 30,
            caloriesBurned: 200,
            exercises: [
                { name: 'Планка', sets: 4, reps: 1, duration: 45 },
                { name: 'Растяжка', sets: 1, reps: 1, duration: 300 }
            ]
        },
        {
            name: 'Беговая тренировка',
            description: 'Интервальный бег для развития выносливости',
            type: WorkoutType.CARDIO,
            durationMinutes: 35,
            caloriesBurned: 300,
            distance: 4,
            exercises: [
                { name: 'Бег', sets: 1, reps: 1, duration: 2100 }
            ]
        },
        {
            name: 'Тренировка плеч',
            description: 'Упражнения для развития дельтовидных мышц',
            type: WorkoutType.STRENGTH,
            durationMinutes: 45,
            caloriesBurned: 280,
            exercises: [
                { name: 'Отжимания', sets: 4, reps: 12 },
                { name: 'Планка', sets: 3, reps: 1, duration: 45 }
            ]
        },
        {
            name: 'Вечерняя растяжка',
            description: 'Расслабляющая растяжка перед сном',
            type: WorkoutType.FLEXIBILITY,
            durationMinutes: 20,
            caloriesBurned: 80,
            exercises: [
                { name: 'Растяжка', sets: 1, reps: 1, duration: 1200 }
            ]
        },
        {
            name: 'Функциональная тренировка',
            description: 'Комплекс упражнений для развития функциональной силы',
            type: WorkoutType.HIIT,
            durationMinutes: 40,
            caloriesBurned: 350,
            exercises: [
                { name: 'Приседания', sets: 3, reps: 15 },
                { name: 'Отжимания', sets: 3, reps: 12 },
                { name: 'Планка', sets: 3, reps: 1, duration: 45 }
            ]
        }
    ];

    // Проверяем, есть ли уже тренировки в базе
    const workoutCount = await workoutRepository.count();
    
    if (workoutCount === 0) {
        // Проверяем существование демо-пользователя или создаем его
        let userId = '';
        const userCheck = await dataSource.query(`
            SELECT id FROM "user" WHERE email = 'demo@example.com' LIMIT 1
        `);
        
        if (userCheck.length === 0) {
            // Пользователь не найден, создаем нового с минимальными требуемыми полями
            const result = await dataSource.query(`
                INSERT INTO "user" (email, password, "firstName", "lastName", age, gender, "activityLevel", "fitnessGoals", "createdAt", "updatedAt")
                VALUES ('demo@example.com', 'hashed_password', 'Demo', 'User', 30, 'male', 'moderately_active', '{}', NOW(), NOW())
                RETURNING id
            `);
            userId = result[0].id;
        } else {
            userId = userCheck[0].id;
        }

        for (const workoutData of workouts) {
            const workout = workoutRepository.create({
                name: workoutData.name,
                description: workoutData.description,
                type: workoutData.type,
                status: WorkoutStatus.ACTIVE,
                durationMinutes: workoutData.durationMinutes,
                caloriesBurned: workoutData.caloriesBurned,
                distance: workoutData.distance,
                userId: userId
            });

            const savedWorkout = await workoutRepository.save(workout);

            // Создаем упражнения для тренировки
            for (const exerciseData of workoutData.exercises) {
                const exercise = await exerciseRepository.findOne({ where: { name: exerciseData.name } });
                if (exercise) {
                    const workoutExercise = new WorkoutExercise();
                    workoutExercise.workoutId = savedWorkout.id;
                    workoutExercise.exerciseId = exercise.id;
                    workoutExercise.sets = exerciseData.sets || 0;
                    workoutExercise.reps = exerciseData.reps || 0;
                    workoutExercise.weight = exerciseData.weight || 0;
                    workoutExercise.durationSeconds = exerciseData.duration || 0;
                    workoutExercise.order = workoutData.exercises.indexOf(exerciseData);
                    await workoutExerciseRepository.save(workoutExercise);
                }
            }
        }
    }
};

// Функция для обновления тренировок, делая их публичными
export const updateWorkoutsPublicStatus = async (dataSource: DataSource) => {
    const workoutRepository = dataSource.getRepository(Workout);
    
    // Получаем все тренировки
    const workouts = await workoutRepository.find();
    
    // Выбираем первые 20 тренировок и делаем их публичными
    const workoutsToUpdate = workouts.slice(0, 20);
    
    for (const workout of workoutsToUpdate) {
        workout.isPublic = true;
        await workoutRepository.save(workout);
    }
    
    console.log(`Обновлено ${workoutsToUpdate.length} тренировок, установлен флаг isPublic=true`);
};
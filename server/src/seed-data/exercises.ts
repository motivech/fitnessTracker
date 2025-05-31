import { ExerciseType, MuscleGroup } from '../entities/Exercise';

export interface ExerciseSeed {
    name: string;
    description: string;
    type: ExerciseType;
    muscleGroup: MuscleGroup;
    instructions?: string;
    imageUrl?: string;
    videoUrl?: string;
    equipment?: string[];
}

export const exercisesSeed: ExerciseSeed[] = [
    // Упражнения для груди
    {
        name: 'Жим лежа',
        description: 'Базовое упражнение для развития грудных мышц',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.CHEST,
        instructions: 'Лягте на скамью, поднимите штангу с упоров, опустите к груди и поднимите обратно',
        equipment: ['скамья', 'штанга', 'блины']
    },
    {
        name: 'Отжимания',
        description: 'Классическое упражнение для верхней части тела',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.CHEST,
        instructions: 'Примите упор лежа, опуститесь почти до пола и вернитесь в исходное положение'
    },
    {
        name: 'Разводка гантелей лежа',
        description: 'Изолирующее упражнение для грудных мышц',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.CHEST,
        equipment: ['скамья', 'гантели']
    },
    {
        name: 'Кроссовер',
        description: 'Изолирующее упражнение для грудных мышц',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.CHEST,
        equipment: ['тросовый тренажер']
    },

    // Упражнения для спины
    {
        name: 'Подтягивания',
        description: 'Базовое упражнение для развития мышц спины',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.BACK,
        instructions: 'Повисните на перекладине и подтянитесь так, чтобы подбородок оказался над ней'
    },
    {
        name: 'Тяга верхнего блока',
        description: 'Упражнение для развития широчайших мышц спины',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.BACK,
        equipment: ['верхний блок']
    },
    {
        name: 'Тяга штанги в наклоне',
        description: 'Базовое упражнение для средней части спины',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.BACK,
        equipment: ['штанга', 'блины']
    },
    {
        name: 'Гиперэкстензия',
        description: 'Упражнение для укрепления нижней части спины',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.BACK,
        equipment: ['гиперэкстензия']
    },

    // Упражнения для ног
    {
        name: 'Приседания со штангой',
        description: 'Базовое упражнение для развития мышц ног',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.LEGS,
        equipment: ['штанга', 'блины']
    },
    {
        name: 'Жим ногами',
        description: 'Упражнение для квадрицепсов и ягодиц',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.LEGS,
        equipment: ['тренажер для жима ногами']
    },
    {
        name: 'Выпады с гантелями',
        description: 'Упражнение для ног и ягодиц',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.LEGS,
        equipment: ['гантели']
    },
    {
        name: 'Становая тяга',
        description: 'Комплексное упражнение для ног и спины',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.LEGS,
        equipment: ['штанга', 'блины']
    },

    // Упражнения для плеч
    {
        name: 'Жим гантелей сидя',
        description: 'Упражнение для плечевого пояса',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.SHOULDERS,
        equipment: ['гантели', 'скамья']
    },
    {
        name: 'Разведение гантелей в стороны',
        description: 'Изолирующее упражнение для средней части дельтовидных мышц',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.SHOULDERS,
        equipment: ['гантели']
    },
    {
        name: 'Тяга штанги к подбородку',
        description: 'Упражнение для трапециевидных и дельтовидных мышц',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.SHOULDERS,
        equipment: ['штанга', 'блины']
    },

    // Упражнения для рук
    {
        name: 'Сгибание рук с гантелями',
        description: 'Изолирующее упражнение для бицепсов',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.ARMS,
        equipment: ['гантели']
    },
    {
        name: 'Французский жим',
        description: 'Изолирующее упражнение для трицепсов',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.ARMS,
        equipment: ['штанга EZ', 'блины']
    },
    {
        name: 'Отжимания на брусьях',
        description: 'Упражнение для трицепсов и груди',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.ARMS,
        equipment: ['брусья']
    },

    // Упражнения для пресса
    {
        name: 'Скручивания',
        description: 'Базовое упражнение для прямой мышцы живота',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.CORE
    },
    {
        name: 'Планка',
        description: 'Статическое упражнение для кора',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.CORE
    },
    {
        name: 'Подъем ног в висе',
        description: 'Сложное упражнение для нижней части пресса',
        type: ExerciseType.STRENGTH,
        muscleGroup: MuscleGroup.CORE,
        equipment: ['турник']
    },

    // Кардио упражнения
    {
        name: 'Бег',
        description: 'Аэробное упражнение для всего тела',
        type: ExerciseType.CARDIO,
        muscleGroup: MuscleGroup.FULL_BODY
    },
    {
        name: 'Велотренажер',
        description: 'Кардио упражнение с низкой нагрузкой на суставы',
        type: ExerciseType.CARDIO,
        muscleGroup: MuscleGroup.LEGS,
        equipment: ['велотренажер']
    },
    {
        name: 'Эллиптический тренажер',
        description: 'Низкоударное кардио для всего тела',
        type: ExerciseType.CARDIO,
        muscleGroup: MuscleGroup.FULL_BODY,
        equipment: ['эллиптический тренажер']
    },
    {
        name: 'Прыжки со скакалкой',
        description: 'Эффективное кардио упражнение',
        type: ExerciseType.CARDIO,
        muscleGroup: MuscleGroup.FULL_BODY,
        equipment: ['скакалка']
    }
]; 
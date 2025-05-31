import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Achievement } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Функция для склонения существительных в зависимости от числа
 * @param count Число
 * @param forms Массив форм слова [единственное, двойственное, множественное]
 * @returns Правильная форма слова
 */
export function pluralize(count: number, forms: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
  return forms[index];
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours} ч ${mins > 0 ? `${mins} мин` : ''}`
  }
  
  return `${mins} мин`
}

export function formatCalories(calories: number): string {
  return calories >= 1000 ? `${(calories / 1000).toFixed(1)}k` : calories.toString()
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 80) {
    return 'bg-green-500'
  } else if (percentage >= 50) {
    return 'bg-yellow-500'
  } else {
    return 'bg-red-500'
  }
}

export function getWorkoutDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'начинающий':
      return 'bg-green-100 text-green-800'
    case 'средний':
      return 'bg-yellow-100 text-yellow-800'
    case 'продвинутый':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateWorkoutSummary(workoutType: string, exercises: { name: string }[]): string {
  const exerciseList = exercises.slice(0, 3).map(e => e.name)
  let summary = `${workoutType}: ${exerciseList.join(', ')}`
  
  if (exercises.length > 3) {
    summary += ` и еще ${exercises.length - 3}`
  }
  
  return truncateText(summary, 60)
}

export function calculateBMI(weight: number, heightCm: number): {value: number, category: string} {
  if (!weight || !heightCm) return { value: 0, category: 'Нет данных' }
  
  const heightM = heightCm / 100
  const bmi = weight / (heightM * heightM)
  
  let category
  if (bmi < 18.5) {
    category = 'Недостаточный вес'
  } else if (bmi < 25) {
    category = 'Нормальный вес'
  } else if (bmi < 30) {
    category = 'Избыточный вес'
  } else {
    category = 'Ожирение'
  }
  
  return { value: parseFloat(bmi.toFixed(1)), category }
}

export function calculateCaloriesPerDay(
  weight: number, 
  heightCm: number, 
  age: number, 
  gender: string,
  activityLevel: string
): number {
  if (!weight || !heightCm || !age) return 0
  
  // Формула Харриса-Бенедикта
  let bmr
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age)
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age)
  }
  
  // Коэффициент активности
  let activityMultiplier = 1.2 // Малоподвижный
  switch (activityLevel) {
    case 'low':
      activityMultiplier = 1.2
      break
    case 'moderate':
      activityMultiplier = 1.55
      break
    case 'high':
      activityMultiplier = 1.725
      break
    case 'very_high':
      activityMultiplier = 1.9
      break
  }
  
  return Math.round(bmr * activityMultiplier)
}

/**
 * Функция для расчета прогресса достижения на основе статистики пользователя
 */
export const calculateAchievementProgress = (achievement: Achievement, userStats: any) => {
  // Проверка на наличие требований
  if (!achievement.requirements) {
    return 0;
  }
  
  // Если достижение основано на серверных данных и имеет другую структуру (требования в формате {metric, value})
  if (typeof achievement.requirements === 'object' && 'metric' in achievement.requirements) {
    const req = achievement.requirements as unknown as { metric: string; value: number };
    let currentValue = 0;
    
    // Определяем текущее значение в зависимости от типа требования
    switch (req.metric) {
      case 'total_workouts':
        currentValue = userStats.totalWorkouts || 0;
        break;
      case 'streak_days':
        currentValue = userStats.streakDays || 0;
        break;
      case 'total_distance':
        currentValue = userStats.totalDistance || 0;
        break;
      case 'level':
        currentValue = userStats.level || 1;
        break;
      case 'exercise_count':
        currentValue = userStats.totalExercises || 0;
        break;
      default:
        currentValue = 0;
    }
    
    // Ограничиваем прогресс до 100%
    return Math.min(100, Math.round((currentValue / req.value) * 100));
  }
  
  // Если достижение имеет массив требований
  if (Array.isArray(achievement.requirements) && achievement.requirements.length > 0) {
    const requirement = achievement.requirements[0];
    let currentValue = 0;
    
    // Определяем текущее значение на основе статистики пользователя
    switch (requirement.type) {
      case 'WORKOUT':
      case 'workout':
        currentValue = userStats.totalWorkouts || 0;
        break;
      case 'STREAK':
      case 'streak':
        currentValue = userStats.streakDays || 0;
        break;
      case 'DISTANCE':
      case 'distance':
        currentValue = userStats.totalDistance || 0;
        break;
      case 'LEVEL':
      case 'level':
        currentValue = userStats.level || 1;
        break;
      case 'EXERCISE':
      case 'exercise':
        currentValue = userStats.totalExercises || 0;
        break;
      case 'PROGRAM':
        currentValue = userStats.completedPrograms || 0;
        break;
      default:
        return 0;
    }
    
    // Ограничиваем прогресс до 100%
    return Math.min(100, Math.round((currentValue / requirement.value) * 100));
  }
  
  return 0;
};

/**
 * Функция для проверки, получено ли достижение
 */
export const isAchievementUnlocked = (achievementId: string, userAchievements: Achievement[]) => {
  return userAchievements.some(a => a.id === achievementId);
};

/**
 * Функция для расчета общего количества опыта на основе достижений
 */
export const calculateTotalXP = (allAchievements: Achievement[], userAchievements: Achievement[], userStats: any) => {
  let totalXP = 0;
  
  // Рассчитываем опыт по всем достижениям
  allAchievements.forEach(achievement => {
    const progress = calculateAchievementProgress(achievement, userStats);
    const isUnlocked = isAchievementUnlocked(achievement.id, userAchievements);
    
    // Учитываем очки за достижения, которые полностью выполнены (100% прогресс)
    if (isUnlocked || progress === 100) {
      totalXP += achievement.points;
    }
  });
  
  return totalXP;
};

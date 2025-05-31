import { Achievement } from '../types';
import { api } from '../api';

export async function getUserAchievements() {
  try {
    const response = await api.get<Achievement[]>('/achievements/user');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении достижений пользователя:', error);
    return [];
  }
}

export async function getLeaderboard() {
  try {
    const response = await api.get<{ username: string; points: number; level: number }[]>('/achievements/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении таблицы лидеров:', error);
    return [];
  }
}

export async function getAllAchievements() {
  try {
    const response = await api.get<Achievement[]>('/achievements');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка достижений:', error);
    return [];
  }
}

export function calculateAchievementProgress(achievement: Achievement, userStats: any): number {
  if (!achievement.requirements || achievement.requirements.length === 0) {
    return 0;
  }

  // Если достижение уже получено
  if (achievement.dateEarned) {
    return 100;
  }

  let totalProgress = 0;

  achievement.requirements.forEach(req => {
    let currentValue = 0;
    
    // Определяем текущее значение в зависимости от типа требования
    switch (req.type) {
      case 'WORKOUT':
        currentValue = userStats.completedWorkouts || 0;
        break;
      case 'STREAK':
        currentValue = userStats.currentStreak || 0;
        break;
      case 'DISTANCE':
        currentValue = userStats.totalDistance || 0;
        break;
      case 'LEVEL':
        currentValue = userStats.level || 1;
        break;
      case 'EXERCISE':
        currentValue = userStats.totalExercises || 0;
        break;
      case 'PROGRAM':
        currentValue = userStats.completedPrograms || 0;
        break;
      default:
        currentValue = 0;
    }

    // Ограничиваем прогресс до 100%
    const reqProgress = Math.min(100, (currentValue / req.value) * 100);
    totalProgress += reqProgress;
  });

  // Возвращаем средний прогресс по всем требованиям
  return Math.floor(totalProgress / achievement.requirements.length);
} 
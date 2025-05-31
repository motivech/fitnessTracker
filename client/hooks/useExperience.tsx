import { useState, useEffect, useCallback } from 'react';
import { getUserStats } from '@/services/achievements';
import { getUserProfile } from '@/services/profile';
import { useAuth } from '@/contexts/AuthContext';

interface ExperienceData {
  level: number;
  experience: number;
  totalXP: number;
  progressToNextLevel: number;
  loading: boolean;
}

export const useExperience = (): [
  ExperienceData, 
  () => Promise<void>
] => {
  const { user } = useAuth();
  const [data, setData] = useState<ExperienceData>({
    level: 1,
    experience: 0,
    totalXP: 0,
    progressToNextLevel: 0,
    loading: true,
  });

  // Функция для вычисления прогресса до следующего уровня
  const calculateProgressToNextLevel = (level: number, experience: number) => {
    const nextLevelRequirement = level * 100;
    return (experience % nextLevelRequirement) / nextLevelRequirement * 100;
  };

  // Функция для вычисления уровня на основе опыта
  const calculateLevel = (totalXP: number) => {
    let level = 1;
    let remainingXP = totalXP;
    
    while (remainingXP >= level * 100) {
      remainingXP -= level * 100;
      level++;
    }
    
    return level;
  };

  // Функция для обновления данных об опыте
  const refreshExperience = useCallback(async () => {
    if (!user) return;
    
    try {
      setData(prev => ({ ...prev, loading: true }));
      
      // Получаем данные из обоих источников
      const [profileData, statsData] = await Promise.all([
        getUserProfile(),
        getUserStats()
      ]);
      
      // Выбираем самое актуальное значение опыта (очки из достижений)
      // Приоритет отдаём данным из статистики достижений
      const totalXP = Math.max(statsData.totalXP || 0, profileData.points || 0);
      
      // Вычисляем уровень на основе общего количества опыта
      const level = calculateLevel(totalXP);
      
      // Вычисляем прогресс до следующего уровня
      const progressToNextLevel = calculateProgressToNextLevel(level, totalXP);
      
      setData({
        level,
        experience: totalXP,
        totalXP,
        progressToNextLevel,
        loading: false,
      });
      
    } catch (error) {
      console.error('Ошибка при загрузке данных об опыте:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  // Загружаем данные при монтировании и при изменении пользователя
  useEffect(() => {
    if (user) {
      refreshExperience();
    }
  }, [user, refreshExperience]);

  return [data, refreshExperience];
}; 
import { Achievement } from "@/lib/types";
import { API_URL } from "@/lib/constants";
import { getAuthHeader } from "./auth";
import { createNotification } from "./notifications";

// Получение всех достижений пользователя
export async function getUserAchievements(): Promise<Achievement[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/achievements/my`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить достижения пользователя");
  }

  return response.json();
}

// Проверка и выдача новых достижений
export async function checkAchievements(): Promise<Achievement[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/achievements/check`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось проверить достижения");
  }

  const newAchievements = await response.json();
  
  // Если получены новые достижения, создаем для них уведомления
  if (newAchievements && newAchievements.length > 0) {
    await createAchievementNotifications(newAchievements);
  }
  
  return newAchievements;
}

// Создание уведомлений о полученных достижениях
async function createAchievementNotifications(achievements: Achievement[]): Promise<void> {
  try {
    for (const achievement of achievements) {
      await createNotification({
        title: `Новое достижение: ${achievement.name}`,
        message: `Вы получили новое достижение: ${achievement.description}. +${achievement.points} XP!`,
        type: 'achievement',
        relatedItemId: achievement.id
      });
    }
  } catch (error) {
    console.error("Ошибка при создании уведомлений о достижениях:", error);
  }
}

// Получение лидеров по очкам
export async function getLeaderboard(): Promise<{id: string; username: string; points: number; level: number}[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/achievements/leaderboard`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить таблицу лидеров");
  }

  return response.json();
}

// Получение всех доступных достижений
export async function getAllAchievements(): Promise<Achievement[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/achievements`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить список достижений");
  }

  return response.json();
}

// Получение статистики пользователя для расчета прогресса достижений
export async function getUserStats(): Promise<{
  totalWorkouts: number;
  streakDays: number;
  totalDistance: number;
  level: number;
  totalExercises: number;
  completedPrograms: number;
  totalXP: number;
}> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/achievements/stats`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить статистику пользователя");
  }

  return response.json();
} 
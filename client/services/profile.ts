import { API_URL } from "@/lib/constants";
import { getAuthHeader } from "./auth";

// Интерфейс для профиля пользователя
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  weight?: number;
  height?: number;
  bio?: string;
  avatar?: string;
  level: number;
  points: number;
  settings?: {
    theme?: string;
    measurementSystem?: string;
    notifications?: {
      workoutReminders?: boolean;
      achievementNotifications?: boolean;
      newsletterSubscription?: boolean;
      reminderTime?: number;
      newContentNotifications?: boolean;
    };
  };
}

// Интерфейс для обновления профиля
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  bio?: string;
  avatar?: string;
}

// Интерфейс для обновления настроек
export interface UpdateSettingsData {
  theme?: string;
  measurementSystem?: string;
  notifications?: {
    workoutReminders?: boolean;
    achievementNotifications?: boolean;
    newsletterSubscription?: boolean;
    reminderTime?: number;
    newContentNotifications?: boolean;
  };
}

// Получение профиля пользователя
export async function getUserProfile(): Promise<UserProfile> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/users/profile`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить профиль пользователя");
  }

  return response.json();
}

// Обновление информации профиля
export async function updateProfile(profileData: UpdateProfileData): Promise<UserProfile> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить профиль пользователя");
  }

  return response.json();
}

// Обновление настроек пользователя
export async function updateSettings(settingsData: UpdateSettingsData): Promise<UserProfile> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/users/settings`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(settingsData),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить настройки пользователя");
  }

  return response.json();
}

// Загрузка аватара пользователя
export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const headers: HeadersInit = {
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/users/avatar`, {
    method: "POST",
    headers,
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить аватар");
  }

  return response.json();
} 
import { API_URL } from "@/lib/constants";
import { getAuthHeader } from "./auth";
import { Notification } from "@/lib/types";

// Получение всех уведомлений пользователя
export async function getUserNotifications(): Promise<Notification[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/notifications`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить уведомления пользователя");
  }

  return response.json();
}

// Получение непрочитанных уведомлений пользователя
export async function getUnreadNotifications(): Promise<Notification[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/notifications/unread`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить непрочитанные уведомления");
  }

  return response.json();
}

// Функция для вызова события обновления уведомлений
const emitNotificationUpdate = () => {
  // Проверяем, что код выполняется в браузере
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('notification-update'));
  }
};

// Создание нового уведомления
export async function createNotification(data: {
  title: string;
  message: string;
  type: 'workout_reminder' | 'achievement' | 'new_workout' | 'new_program' | 'system';
  relatedItemId?: string;
}): Promise<Notification> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/notifications`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать уведомление");
  }

  const result = await response.json();
  
  // Вызываем событие обновления уведомлений
  emitNotificationUpdate();
  
  return result;
}

// Отметка уведомления как прочитанного
export async function markNotificationAsRead(id: string): Promise<Notification> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось отметить уведомление как прочитанное");
  }
  
  const result = await response.json();
  
  // Вызываем событие обновления уведомлений
  emitNotificationUpdate();
  
  return result;
}

// Отметка всех уведомлений как прочитанных
export async function markAllNotificationsAsRead(): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "POST",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось отметить все уведомления как прочитанные");
  }
  
  // Вызываем событие обновления уведомлений
  emitNotificationUpdate();
}

// Удаление уведомления
export async function deleteNotification(id: string): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить уведомление");
  }
}

// Удаление всех уведомлений
export async function deleteAllNotifications(): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/notifications`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить все уведомления");
  }
} 
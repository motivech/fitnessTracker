import { ScheduledWorkout, Workout } from "@/lib/types";
import { API_URL } from "@/lib/constants";
import { getAuthHeader } from "./auth";

// Получение всех запланированных тренировок пользователя
export async function getUserScheduledWorkouts(): Promise<ScheduledWorkout[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/scheduled-workouts`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить запланированные тренировки");
  }

  return response.json();
}

// Получение запланированных тренировок в диапазоне дат
export async function getScheduledWorkoutsByDateRange(
  startDate: string,
  endDate: string
): Promise<ScheduledWorkout[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(
    `${API_URL}/scheduled-workouts/calendar?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Не удалось получить запланированные тренировки");
  }

  return response.json();
}

// Получение конкретной запланированной тренировки
export async function getScheduledWorkout(id: string): Promise<ScheduledWorkout> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/scheduled-workouts/${id}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить запланированную тренировку");
  }

  return response.json();
}

// Создание новой запланированной тренировки
export async function createScheduledWorkout(data: {
  workoutId: string;
  scheduledDate: string;
  scheduledTime: string;
  programId?: string;
}): Promise<ScheduledWorkout> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  // Убедимся, что workoutId передается корректно
  // Если это числовое значение, то не преобразуем его
  // Это важно, так как значения workoutId в базе данных могут быть как UUID, так и числовыми
  const payload = { ...data };

  const response = await fetch(`${API_URL}/scheduled-workouts`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать запланированную тренировку");
  }

  return response.json();
}

// Обновление запланированной тренировки
export async function updateScheduledWorkout(
  id: string,
  data: Partial<ScheduledWorkout>
): Promise<ScheduledWorkout> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/scheduled-workouts/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить запланированную тренировку");
  }

  return response.json();
}

/**
 * Отмечает тренировку как выполненную
 * @param id Идентификатор запланированной тренировки
 */
export async function completeScheduledWorkout(id: string) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...getAuthHeader()
    };

    const response = await fetch(`${API_URL}/scheduled-workouts/${id}/complete`, {
      method: 'PATCH',
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ошибка при отметке тренировки: ${response.status}`, errorText);
      throw new Error(`Ошибка при отметке тренировки: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при отметке тренировки как выполненной:', error);
    throw error;
  }
}

// Удаление запланированной тренировки
export async function deleteScheduledWorkout(id: string): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/scheduled-workouts/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить запланированную тренировку");
  }
} 
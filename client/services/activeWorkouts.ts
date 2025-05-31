import { Workout } from "@/lib/types";
import { API_URL } from "@/lib/constants";
import { getAuthHeader } from "./auth";

// Получение всех активных тренировок
export async function getActiveWorkouts(): Promise<Workout[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/workouts/active`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить активные тренировки");
  }

  return response.json();
}

// Добавление тренировки в активные
export async function addWorkoutToActive(workoutId: string): Promise<Workout> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/workouts/active`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ workoutId }),
  });

  if (!response.ok) {
    throw new Error("Не удалось добавить тренировку в активные");
  }

  return response.json();
}

// Удаление тренировки из активных
export async function removeWorkoutFromActive(workoutId: string): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/workouts/active/${workoutId}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить тренировку из активных");
  }
}

// Обновление прогресса тренировки
export async function updateWorkoutProgress(data: {
  workoutId: string;
  date: string;
  completedExercises: string[];
  completionPercentage: number;
}): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/workouts/active/progress`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить прогресс тренировки");
  }

  return response.json();
}

/**
 * Завершение тренировки с сохранением упражнений
 * 
 * ВАЖНО: эта функция должна вызываться ТОЛЬКО когда пользователь 
 * действительно завершил выполнение тренировки, а не при создании
 * новой тренировки или других действиях.
 */
export async function completeWorkout(data: {
  workoutId: string;
  date: string;
  completedExercises: Array<{
    id: string;
    exerciseId: string;
    exercise?: any;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    completed?: boolean;
  }>;
  completionPercentage: number;
  caloriesBurned?: number;
  timeSpent?: number;
}): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  // Проверяем, что процент выполнения передан и больше 0
  // Это важно, чтобы только реально выполненные тренировки попадали в историю
  if (!data.completionPercentage || data.completionPercentage <= 0) {
    throw new Error("Нельзя завершить тренировку с нулевым прогрессом");
  }

  console.log("Завершаем тренировку со следующими данными:", {
    workoutId: data.workoutId,
    date: data.date,
    exercisesCount: data.completedExercises.length,
    completionPercentage: data.completionPercentage,
    timeSpent: data.timeSpent,
    caloriesBurned: data.caloriesBurned
  });

  // Проверяем, что у всех упражнений есть необходимые поля
  data.completedExercises.forEach(ex => {
    console.log(`Проверка упражнения ${ex.id}:`, {
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight || 0,
      duration: ex.duration || 0,
      completed: ex.completed || false
    });
  });

  // Преобразуем данные для API - сохраняем все данные об упражнениях, не только ID
  const apiData = {
    workoutId: data.workoutId,
    date: data.date,
    // Передаем полные упражнения, чтобы на сервере сохранились все детали
    completedExercises: data.completedExercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight || 0,
      duration: ex.duration || 0,
      completed: ex.completed || false
    })),
    completionPercentage: data.completionPercentage,
    caloriesBurned: data.caloriesBurned || 0,
    timeSpent: data.timeSpent || 0
  };

  try {
    const response = await fetch(`${API_URL}/workouts/active/complete`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ошибка API при завершении тренировки:", errorText);
      throw new Error(`Не удалось завершить тренировку: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Тренировка успешно завершена", result);
    return result;
  } catch (error) {
    console.error("Ошибка при завершении тренировки:", error);
    throw error;
  }
} 
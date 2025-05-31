import { Exercise } from "@/lib/types";
import { API_URL } from "@/lib/constants";
import { getAuthHeader } from "./auth";

// Получение всех упражнений
export async function getAllExercises(): Promise<Exercise[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/exercises`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить список упражнений");
  }

  return response.json();
}

// Получение упражнения по ID
export async function getExerciseById(id: string): Promise<Exercise> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/exercises/${id}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить данные упражнения");
  }

  return response.json();
}

// Получение упражнений по группе мышц
export async function getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/exercises?muscleGroup=${muscleGroup}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Не удалось получить упражнения для группы мышц: ${muscleGroup}`);
  }

  return response.json();
}

// Получение упражнений по типу
export async function getExercisesByType(type: string): Promise<Exercise[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/exercises?type=${type}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Не удалось получить упражнения типа: ${type}`);
  }

  return response.json();
}

// Создание нового упражнения
export async function createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/exercises`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(exerciseData),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать упражнение");
  }

  return response.json();
}

// Обновление упражнения
export async function updateExercise(id: string, exerciseData: Partial<Exercise>): Promise<Exercise> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/exercises/${id}`, {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify(exerciseData),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить упражнение");
  }

  return response.json();
}

// Удаление упражнения
export async function deleteExercise(id: string): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/exercises/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить упражнение");
  }
} 
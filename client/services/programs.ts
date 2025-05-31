import { TrainingProgram, ProgramProgress } from "@/lib/types";
import { API_URL } from "@/lib/constants";
import { getAuthHeader } from "./auth";

// Получение всех программ тренировок
export async function getAllPrograms(): Promise<TrainingProgram[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/programs`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить программы тренировок");
  }

  return response.json();
}

// Получение активных программ тренировок пользователя (тех, что добавлены в календарь)
export async function getUserActivePrograms(): Promise<ProgramProgress[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  try {
    const response = await fetch(`${API_URL}/programs/active`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    // Проверка статуса ответа
    if (!response.ok) {
      console.warn(`Не удалось получить активные программы тренировок. Статус: ${response.status}`);
      return []; // Возвращаем пустой массив в случае ошибок на сервере
    }

    try {
      const data = await response.json();
      
      // Обрабатываем полученные данные и добавляем счетчики выполненных тренировок
      return data.map((program: ProgramProgress) => {
        // Подсчитываем количество выполненных тренировок и общее количество
        const completedWorkouts = program.workouts?.filter(w => w.completed).length || 0;
        const totalWorkouts = program.workouts?.length || 0;
        
        // Добавляем эти значения к объекту программы
        return {
          ...program,
          completedWorkouts,
          totalWorkouts,
          // Обеспечиваем, что у программы есть имя, даже если это заглушка
          program: program.program || {
            id: program.programId,
            name: 'Программа тренировок',
            description: 'Программа тренировок',
            duration: 7,
            workouts: [],
            createdBy: 'system',
            isPublic: true
          }
        };
      });
    } catch (err) {
      console.error("Ошибка при получении данных активных программ:", err);
      // В случае ошибки возвращаем пустой массив
      return [];
    }
  } catch (err) {
    console.error("Сетевая ошибка при запросе активных программ:", err);
    return []; // Возвращаем пустой массив при сетевых ошибках
  }
}

// Получение конкретной программы
export async function getProgram(id: string): Promise<TrainingProgram> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/programs/${id}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить программу тренировок");
  }

  return response.json();
}

// Получение прогресса по конкретной программе
export async function getProgramProgress(programId: string): Promise<ProgramProgress | null> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  try {
    const response = await fetch(`${API_URL}/programs/${programId}/progress`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    // Проверка статуса ответа
    if (!response.ok) {
      console.warn(`Не удалось получить прогресс программы ${programId}. Статус: ${response.status}`);
      return null; // Возвращаем null в случае ошибки на сервере
    }

    return response.json();
  } catch (err) {
    console.error(`Ошибка при получении прогресса программы ${programId}:`, err);
    return null; // Возвращаем null при любых других ошибках
  }
}

// Завершение программы тренировок
export async function completeProgram(programId: string): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  try {
    const response = await fetch(`${API_URL}/programs/${programId}/complete`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Неизвестная ошибка");
      console.error(`Ошибка при завершении программы: ${response.status} ${response.statusText}. Детали: ${errorText}`);
      throw new Error(`Не удалось завершить программу тренировок (${response.status})`);
    }

    return response.json();
  } catch (err) {
    console.error("Ошибка при запросе на завершение программы:", err);
    throw err; // Пробрасываем ошибку для обработки на уровне компонента
  }
}

// Создание новой программы
export async function createProgram(data: Omit<TrainingProgram, "id">): Promise<TrainingProgram> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/programs`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось создать программу тренировок");
  }

  return response.json();
}

// Запуск программы тренировок
export async function startProgram(data: {
  programId: string;
  startDate: string;
  workoutIds: string[];
}): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/programs/start`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось запустить программу тренировок");
  }

  return response.json();
}

// Обновление программы
export async function updateProgram(
  id: string,
  data: Partial<TrainingProgram>
): Promise<TrainingProgram> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/programs/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить программу тренировок");
  }

  return response.json();
}

// Удаление программы
export async function deleteProgram(id: string): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/programs/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить программу тренировок");
  }
} 
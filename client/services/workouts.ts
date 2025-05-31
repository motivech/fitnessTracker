import { Workout, WorkoutProgress } from "@/lib/types";
import { API_URL, WORKOUT_TYPE_MAP, WORKOUT_TYPE_REVERSE_MAP } from "@/lib/constants";
import { getAuthHeader } from "./auth";

// Функция для стандартизации формата упражнений в тренировке
function normalizeWorkoutExercises(workout: any): any {
  // Проверяем, пришли ли упражнения в формате workoutExercises
  if (workout.workoutExercises && Array.isArray(workout.workoutExercises)) {
    console.log(`Тренировка ${workout.id} имеет ${workout.workoutExercises.length} упражнений в workoutExercises`);
    
    // Преобразуем workoutExercises в формат exercises
    const exercises = workout.workoutExercises.map((we: any) => ({
      id: we.id,
      exerciseId: we.exerciseId,
      exercise: we.exercise, // Сохраняем связанное упражнение, если оно есть
      sets: we.sets,
      reps: we.reps,
      weight: we.weight,
      duration: we.durationSeconds || we.duration
    }));
    
    // Убираем workoutExercises и добавляем exercises в стандартном формате
    const { workoutExercises, ...rest } = workout;
    return { ...rest, exercises };
  } else if (!workout.exercises) {
    // Если ни workoutExercises, ни exercises не определены, возвращаем пустой массив упражнений
    console.log(`Тренировка ${workout.id} не имеет упражнений`);
    return { ...workout, exercises: [] };
  }
  
  // Если у тренировки уже есть exercises, возвращаем как есть
  return workout;
}

// Получение всех тренировок
export async function getAllWorkouts(includePublic: boolean = false, createdByUser: boolean = true): Promise<Workout[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  // Базовый URL для тренировок
  let url = `${API_URL}/workouts`;
  
  // Параметры запроса: всегда запрашиваем только созданные пользователем
  // и исключаем завершенные тренировки
  url += `?createdByUser=true&excludeCompleted=true`;

  console.log("Запрашиваем тренировки по URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Не удалось получить список тренировок");
    }

    const workouts = await response.json();
    console.log("Получено исходных тренировок:", workouts.length);
    
    if (workouts.length > 0) {
      console.log("Пример тренировки из ответа:", {
        id: workouts[0].id,
        name: workouts[0].name,
        hasExercises: !!workouts[0].workoutExercises,
        exercisesCount: workouts[0].workoutExercises?.length || 0
      });
    }
    
    // Стандартизируем формат упражнений для каждой тренировки
    const normalizedWorkouts = workouts.map(normalizeWorkoutExercises);
    
    console.log("Нормализованные тренировки с упражнениями:", normalizedWorkouts.length);
    return normalizedWorkouts;
  } catch (error) {
    console.error("Ошибка при получении тренировок:", error);
    return [];
  }
}

// Получение конкретной тренировки
export async function getWorkout(id: string): Promise<Workout> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/workouts/${id}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить тренировку");
  }

  return response.json();
}

// Получение общедоступных тренировок
export async function getPublicWorkouts(type?: string): Promise<Workout[]> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  // Базовый URL для получения всех публичных тренировок
  const url = type 
    ? `${API_URL}/workouts/public?type=${type}` 
    : `${API_URL}/workouts/public`;

  console.log("Запрашиваем публичные тренировки по URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Не удалось получить общедоступные тренировки");
    }

    const workouts = await response.json();
    console.log("Получено публичных тренировок:", workouts.length);
    
    // Стандартизируем формат упражнений для каждой тренировки
    const normalizedWorkouts = workouts.map(normalizeWorkoutExercises);
    
    return normalizedWorkouts;
  } catch (error) {
    console.error("Ошибка при получении публичных тренировок:", error);
    return [];
  }
}

// Создание новой тренировки
export async function createWorkout(workoutData: Omit<Workout, 'id' | 'createdBy' | 'createdAt'>): Promise<Workout> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  // Преобразуем тип тренировки из русского в английский
  const apiType = WORKOUT_TYPE_MAP[workoutData.type] || 'custom';

  // Подготовим правильную структуру для упражнений
  const preparedExercises = workoutData.exercises?.map(ex => ({
    exerciseId: ex.exerciseId,
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.weight,
    duration: ex.duration
  })) || [];

  // Создаем объект для отправки
  const payload = {
    name: workoutData.name,
    description: workoutData.description,
    type: apiType, // Используем английское название типа
    duration: workoutData.duration,
    caloriesBurned: workoutData.calories,
    isPublic: workoutData.isPublic,
    exercises: preparedExercises
  };

  console.log("Отправляем данные тренировки:", payload);

  const response = await fetch(`${API_URL}/workouts`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Не удалось создать тренировку");
  }

  return response.json();
}

// Обновление тренировки
export async function updateWorkout(
  id: string,
  data: Partial<Workout>
): Promise<Workout> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/workouts/${id}`, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить тренировку");
  }

  return response.json();
}

// Удаление тренировки
export async function deleteWorkout(id: string): Promise<void> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/workouts/${id}`, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить тренировку");
  }
}

/**
 * Получить историю завершенных тренировок пользователя
 * Только действительно завершенные тренировки, прошедшие через completeWorkout
 */
export async function getCompletedWorkouts() {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...getAuthHeader()
    };
    
    console.log("Запрашиваем историю завершенных тренировок");
    
    const response = await fetch(`${API_URL}/workouts/completed`, {
      method: "GET",
      headers,
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error('Не удалось загрузить историю тренировок');
    }
    
    const workouts = await response.json();
    console.log("Получено завершенных тренировок:", workouts.length);
    
    if (workouts.length > 0) {
      console.log("Пример тренировки из истории:", {
        id: workouts[0].id,
        date: workouts[0].date,
        hasWorkout: !!workouts[0].workout,
        hasExercises: workouts[0].workout?.exercises?.length > 0
      });
    }
    
    // Для каждой тренировки в истории убедимся, что у нее есть exercises и стандартизируем формат
    const normalizedWorkouts = workouts.map((workout: WorkoutProgress) => {
      // Проверяем, есть ли у тренировки workout
      if (workout.workout) {
        // Нормализуем формат упражнений в workout
        workout.workout = normalizeWorkoutExercises(workout.workout);
      } else {
        console.log(`Тренировка ${workout.id} не имеет объекта workout`);
      }
      
      return workout;
    });
    
    console.log("Нормализованные тренировки с упражнениями:", normalizedWorkouts.length);
    return normalizedWorkouts;
  } catch (error) {
    console.error('Ошибка при получении истории тренировок:', error);
    return [];
  }
}

/**
 * Получить детальную информацию о тренировке с упражнениями
 */
export async function getWorkoutDetails(workoutId: string) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...getAuthHeader()
    };

    console.log(`Запрашиваем детали тренировки ${workoutId}`);
    
    const response = await fetch(`${API_URL}/workouts/${workoutId}/details`, {
      method: "GET",
      headers,
      credentials: "include",
    });
    
    if (!response.ok) {
      const errorStatus = response.status;
      console.warn(`Не удалось загрузить детали тренировки. Статус: ${errorStatus}`);
      
      if (errorStatus === 404) {
        throw new Error(`Тренировка ${workoutId} не найдена`);
      }
      
      throw new Error(`Ошибка при загрузке деталей тренировки: ${errorStatus}`);
    }
    
    const detailsData = await response.json();
    
    // Если данные получены, нормализуем упражнения с помощью общей функции
    if (detailsData) {
      console.log(`Получены детали тренировки ${workoutId}: ${detailsData.name}`);
      
      // Используем общую функцию для нормализации упражнений
      return normalizeWorkoutExercises(detailsData);
    }
    
    // Если данные пустые, возвращаем объект с пустым массивом упражнений
    return { id: workoutId, exercises: [] };
  } catch (error) {
    console.error('Ошибка при получении деталей тренировки:', error);
    
    // Возвращаем объект с пустым массивом упражнений, чтобы избежать ошибок
    return { id: workoutId, exercises: [] };
  }
} 
// Типы данных для приложения

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  level?: number;
  experience?: number;
}

export type ThemeOption = "light" | "dark" | "system";
export type MeasurementSystem = "metric" | "imperial";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  difficulty: 'начинающий' | 'средний' | 'продвинутый';
  equipment?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  completed?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  type: string;
  duration: number;
  calories: number;
  durationMinutes?: number;  // Альтернативное поле для длительности, приходящее с сервера
  caloriesBurned?: number;   // Альтернативное поле для калорий, приходящее с сервера
  exercises: WorkoutExercise[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  userId: string;   // ID пользователя, которому принадлежит тренировка
}

export interface WorkoutProgress {
  id: string;
  workoutId: string;
  workout?: Workout;
  userId: string;
  date: string;
  completedExercises: string[];
  completionPercentage: number;
}

export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: number; // в днях
  workouts: {
    workoutId: string;
    dayOfProgram: number; // день программы (1, 2, 3...)
    timeOfDay?: string; // время дня для тренировки
  }[];
  createdBy: string;
  isPublic: boolean;
}

export interface ProgramProgress {
  id: string;
  programId: string;
  program?: TrainingProgram;
  userId: string;
  startDate: string;
  endDate?: string;
  workouts: {
    workoutId: string;
    scheduledWorkoutId: string;
    completed: boolean;
    scheduledDate: string;
    dayOfProgram: number;
  }[];
  completionPercentage: number;
  isCompleted: boolean;
  completedWorkouts?: number; // Количество выполненных тренировок
  totalWorkouts?: number; // Общее количество тренировок в программе
}

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  workout?: Workout;
  programId?: string;
  programName?: string;
  userId: string;
  scheduledDate: string;
  scheduledTime: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string; // 'WORKOUT', 'STREAK', 'DISTANCE', 'LEVEL', 'EXERCISE'
  points: number;
  dateEarned?: string; // Дата получения достижения, если получено
  icon?: string; // Emoji или название иконки для отображения
  requirements?: {
    type: string;
    value: number;
    description: string;
  }[];
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  dateUnlocked: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'workout_reminder' | 'achievement' | 'new_workout' | 'new_program' | 'system';
  read: boolean;
  createdAt: string;
  relatedItemId?: string;
}

export interface UserSettings {
  theme?: ThemeOption;
  measurementSystem?: MeasurementSystem;
  notifications?: {
    workoutReminders?: boolean;
    achievementNotifications?: boolean;
    newsletterSubscription?: boolean;
    reminderTime?: number; // За сколько минут до тренировки приходит уведомление
    newContentNotifications?: boolean; // Уведомления о новых тренировках и программах
  };
} 
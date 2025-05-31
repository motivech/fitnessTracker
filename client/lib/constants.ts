// API URL для бэкенда
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const AUTH_API = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
};

// Константы для приложения
export const APP_NAME = 'FitTracker';

// Константы для типов тренировок
export const WORKOUT_TYPES = [
  'Кардио',
  'Силовая',
  'Растяжка',
  'Функциональная',
  'HIIT',
  'Йога',
  'Пилатес',
  'Смешанная'
];

// Карта соответствия русских и английских типов тренировок
export const WORKOUT_TYPE_MAP: Record<string, string> = {
  'Кардио': 'cardio',
  'Силовая': 'strength',
  'Растяжка': 'flexibility',
  'Функциональная': 'custom',
  'HIIT': 'hiit',
  'Йога': 'flexibility',
  'Пилатес': 'flexibility',
  'Смешанная': 'custom'
};

// Обратная карта для отображения на клиенте
export const WORKOUT_TYPE_REVERSE_MAP: Record<string, string> = {
  'cardio': 'Кардио',
  'strength': 'Силовая',
  'flexibility': 'Растяжка',
  'hiit': 'HIIT',
  'custom': 'Смешанная'
};

// Константы для уровней сложности
export const DIFFICULTY_LEVELS = [
  'начинающий',
  'средний',
  'продвинутый'
];

// Константы для групп мышц
export const MUSCLE_GROUPS = [
  'Грудь',
  'Спина',
  'Ноги',
  'Плечи',
  'Бицепс',
  'Трицепс',
  'Пресс',
  'Ягодицы',
  'Кардио',
  'Всё тело'
];

// Константы для типов оборудования
export const EQUIPMENT_TYPES = [
  'Без оборудования',
  'Гантели',
  'Штанга',
  'Тренажеры',
  'Турник',
  'Гиря',
  'Скакалка',
  'Резиновые петли',
  'Скамья',
  'Мяч',
  'Другое'
]; 
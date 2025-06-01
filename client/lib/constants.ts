// API URL для бэкенда
export const API_URL = 'http://194.67.84.159:8000';
export const AUTH_API = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
};


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


import { API_URL } from "@/lib/constants";

// Интерфейс для данных авторизации
export interface LoginData {
  email: string;
  password: string;
}

// Интерфейс для данных регистрации
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

// Функция для получения токена
export function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
  return {};
}

// Логин
export async function login(data: LoginData): Promise<any> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось войти в систему");
  }

  const result = await response.json();
  
  // Сохраняем токен
  if (result.token) {
    localStorage.setItem('token', result.token);
  } else if (result.access_token) {
    localStorage.setItem('token', result.access_token);
  }
  
  return result;
}

// Регистрация
export async function register(data: RegisterData): Promise<any> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось зарегистрироваться");
  }

  const result = await response.json();
  
  // Сохраняем токен
  if (result.token) {
    localStorage.setItem('token', result.token);
  } else if (result.access_token) {
    localStorage.setItem('token', result.access_token);
  }
  
  return result;
}

// Получение профиля пользователя
export async function getProfile(): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeader()
  };

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Не удалось получить данные профиля");
  }

  return response.json();
}

// Выход из системы
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
} 
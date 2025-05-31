import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';
import { User } from '../types';
import { AUTH_API } from '../constants';

type UserStats = {
  level: number;
  completedWorkouts: number;
  currentStreak: number;
  totalDistance: number;
  completedExercises?: Record<string, number>;
};

type AuthUser = User & {
  stats?: UserStats;
  username?: string;
  token?: string;
};

// Интерфейс для данных регистрации, соответствующий RegisterDto на сервере
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  activityLevel: string;
  fitnessGoals: string[];
}

// Интерфейс для данных авторизации, соответствующий LoginDto на сервере
export interface LoginData {
  email: string;
  password: string;
}

export type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<AuthUser>;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для безопасного доступа к localStorage
  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };
  
  // Функция для безопасного сохранения в localStorage
  const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  };
  
  // Функция для безопасного удаления из localStorage
  const removeToken = (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  };

  // Вспомогательная функция для проверки валидности токена
  const isTokenValid = (token: string): boolean => {
    if (!token) return false;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const { exp } = JSON.parse(jsonPayload);
      return exp * 1000 > Date.now();
    } catch (e) {
      console.error('Ошибка при проверке токена:', e);
      return false;
    }
  };

  useEffect(() => {
    // Проверка токена и получение данных пользователя при загрузке
    const checkAuth = async () => {
      const token = getToken();
      
      if (token && isTokenValid(token)) {
        try {
          const response = await api.get(AUTH_API.PROFILE);
          setUser(response.data);
        } catch (err) {
          console.error('Ошибка при получении данных пользователя:', err);
          removeToken();
        }
      } else if (token) {
        // Если токен существует, но не валиден, удаляем его
        removeToken();
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Отправка данных авторизации:', { email, password });
      const response = await api.post(AUTH_API.LOGIN, { email, password });
      console.log('Получен ответ от сервера:', response.data);
      
      // Сервер возвращает { user, token } согласно auth.service.ts
      const token = response.data.token || response.data.access_token;
      
      if (!token) {
        console.error('Токен отсутствует в ответе:', response.data);
        throw new Error('Токен не получен от сервера');
      }
      
      console.log('Сохраняем токен:', token.substring(0, 15) + '...');
      setToken(token);
      
      // Устанавливаем пользователя из ответа
      if (response.data.user) {
        console.log('Пользователь получен из ответа:', response.data.user);
        setUser(response.data.user);
        return response.data.user;
      }
      
      // Если пользователя нет в ответе, запрашиваем профиль
      console.log('Пользователь не получен из ответа, запрашиваем профиль...');
      try {
        const profileResponse = await api.get(AUTH_API.PROFILE);
        console.log('Получен профиль:', profileResponse.data);
        setUser(profileResponse.data);
        return profileResponse.data;
      } catch (profileErr) {
        console.error('Ошибка при получении профиля:', profileErr);
        throw new Error('Не удалось получить профиль пользователя');
      }
    } catch (err: any) {
      console.error('Ошибка при входе:', err);
      if (err.response) {
        console.error('Детали ошибки:', {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.request) {
        console.error('Запрос отправлен, но ответ не получен:', err.request);
      }
      setError(err.response?.data?.message || 'Ошибка при входе в систему');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Отправка данных регистрации:', userData);
      const response = await api.post(AUTH_API.REGISTER, userData);
      console.log('Получен ответ от сервера:', response.data);
      
      // Сервер возвращает { user, token }
      const token = response.data.token || response.data.access_token;
      
      if (!token) {
        console.error('Токен отсутствует в ответе:', response.data);
        throw new Error('Токен не получен от сервера');
      }
      
      console.log('Сохраняем токен:', token.substring(0, 15) + '...');
      setToken(token);
      
      // Устанавливаем пользователя из ответа
      if (response.data.user) {
        console.log('Пользователь получен из ответа:', response.data.user);
        setUser(response.data.user);
        return response.data.user;
      }
      
      // Если пользователя нет в ответе, запрашиваем профиль
      console.log('Пользователь не получен из ответа, запрашиваем профиль...');
      try {
        const profileResponse = await api.get(AUTH_API.PROFILE);
        console.log('Получен профиль:', profileResponse.data);
        setUser(profileResponse.data);
        return profileResponse.data;
      } catch (profileErr) {
        console.error('Ошибка при получении профиля:', profileErr);
        throw new Error('Не удалось получить профиль пользователя');
      }
    } catch (err: any) {
      console.error('Ошибка при регистрации:', err);
      if (err.response) {
        console.error('Детали ошибки:', {
          status: err.response.status,
          data: err.response.data
        });
      } else if (err.request) {
        console.error('Запрос отправлен, но ответ не получен:', err.request);
      }
      setError(err.response?.data?.message || 'Ошибка при регистрации');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, isLoading: loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 
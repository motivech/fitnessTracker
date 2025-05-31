import axios from 'axios';
import { API_URL } from './constants';

// Создаём экземпляр axios с базовым URL
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Добавляем withCredentials для работы с куками между доменами
  withCredentials: true,
});

// Добавляем интерцептор для установки токена аутентификации
api.interceptors.request.use(
  (config) => {
    console.log('Отправка запроса на:', config.url);
    console.log('Данные запроса:', config.data);
    
    // Проверка на наличие window объекта для SSR
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Токен добавлен:', token.substring(0, 15) + '...');
      }
    }
    return config;
  },
  (error) => {
    console.error('Ошибка при формировании запроса:', error);
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => {
    console.log('Получен ответ от:', response.config.url);
    console.log('Статус ответа:', response.status);
    console.log('Данные ответа:', response.data);
    return response;
  },
  (error) => {
    console.error('Ошибка HTTP запроса:', error);
    
    if (error.response) {
      // Сервер ответил с кодом ошибки
      console.error('Статус ответа:', error.response.status);
      console.error('Данные ответа:', error.response.data);
    } else if (error.request) {
      // Запрос был сделан, но ответа не получено
      console.error('Запрос отправлен, но ответ не получен:', error.request);
    } else {
      // Что-то ещё пошло не так
      console.error('Ошибка при настройке запроса:', error.message);
    }
    
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      // Можно добавить логику для редиректа на логин при истечении токена
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
); 
/**
 * Простой скрипт для добавления тренировок
 */

const fetch = require('node-fetch');

// Авторизация и API URL
const API_URL = 'http://localhost:8000';
let AUTH_TOKEN = '';

// Данные пользователя
const USER_CREDENTIALS = {
  email: 'user@example.com',
  password: 'password123'
};

// Функция для получения токена авторизации
async function login() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(USER_CREDENTIALS)
    });

    if (!response.ok) {
      throw new Error(`Ошибка авторизации: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    throw error;
  }
}

// Функция для создания тренировки
async function createWorkout(workout) {
  try {
    const response = await fetch(`${API_URL}/workouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify(workout)
    });

    if (!response.ok) {
      throw new Error(`Ошибка создания тренировки: ${await response.text()}`);
    }

    const data = await response.json();
    console.log(`Создана тренировка: ${workout.name}`);
    return data;
  } catch (error) {
    console.error(`Ошибка при создании тренировки ${workout.name}:`, error.message);
    return null;
  }
}

// Функция для генерации даты N дней назад
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0]; // Только дата, без времени
}

// Основная функция
async function main() {
  try {
    console.log('Начинаем создание тренировок...');
    
    // Получаем токен авторизации
    AUTH_TOKEN = await login();
    console.log('Успешная авторизация!');
    
    // Список типов тренировок
    const workoutTypes = ['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'HIIT', 'CUSTOM'];
    
    // Создаем 20 тренировок за последние 30 дней
    for (let i = 0; i < 20; i++) {
      // Случайный день в течение последних 30 дней
      const daysAgo = Math.floor(Math.random() * 30);
      const workoutDate = getDateDaysAgo(daysAgo);
      
      // Выбираем случайный тип тренировки
      const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
      
      // Создаем случайные параметры
      const duration = Math.floor(Math.random() * 60) + 20; // 20-80 минут
      const calories = Math.floor(Math.random() * 400) + 100; // 100-500 калорий
      
      // Создаем тренировку
      const workout = {
        name: `${type} Тренировка ${i + 1}`,
        description: `Автоматически созданная тренировка ${i + 1}`,
        type,
        duration,
        caloriesBurned: calories,
        date: workoutDate,
        status: 'COMPLETED',
        isPublic: true
      };
      
      // Добавляем тренировку
      await createWorkout(workout);
      
      // Небольшая задержка
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('Все тренировки успешно созданы!');
  } catch (error) {
    console.error('Ошибка в основной функции:', error);
  }
}

// Запускаем скрипт
main(); 
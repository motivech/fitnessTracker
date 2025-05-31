/**
 * Скрипт для добавления большего количества тренировок
 * для лучшего отображения графиков
 */

const fetch = require('node-fetch');

// Данные для авторизации
const API_URL = 'http://localhost:8000';
let AUTH_TOKEN = '';

// Пользовательские данные для авторизации
const USER_DATA = {
  email: 'user@example.com',
  password: 'password123'
};

// Базовые тренировки в формате API
const BASE_WORKOUTS = [
  {
    name: 'Кардио тренировка',
    description: 'Кардио тренировка для сжигания калорий',
    type: 'CARDIO',
    duration: 30,
    caloriesBurned: 250,
    exercises: [
      { name: '5f98f56eff3a9d001f361a0b', sets: 1, reps: 1, duration: 15 },
      { name: '5f98f56eff3a9d001f361a0c', sets: 3, reps: 1, duration: 3 }
    ]
  },
  {
    name: 'Силовая тренировка',
    description: 'Тренировка на развитие силы',
    type: 'STRENGTH',
    duration: 45,
    caloriesBurned: 350,
    exercises: [
      { name: '5f98f56eff3a9d001f361a0d', sets: 3, reps: 10, weight: 60 },
      { name: '5f98f56eff3a9d001f361a0e', sets: 3, reps: 12, weight: 70 }
    ]
  },
  {
    name: 'Растяжка',
    description: 'Тренировка на растяжку и гибкость',
    type: 'FLEXIBILITY',
    duration: 25,
    caloriesBurned: 150,
    exercises: [
      { name: '5f98f56eff3a9d001f361a0f', sets: 3, reps: 10 },
      { name: '5f98f56eff3a9d001f361a10', sets: 3, reps: 1, duration: 30 }
    ]
  }
];

// Функция для генерации даты с заданным количеством дней назад
function getDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// Получаем существующие упражнения, чтобы использовать их ID
async function getExercises() {
  const response = await fetch(`${API_URL}/exercises`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Не удалось получить упражнения');
  }
  
  return await response.json();
}

// Функция для создания тренировок на каждый день последних 2 недель
async function createDailyWorkouts() {
  try {
    console.log('Авторизация...');
    // Выполняем вход
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: USER_DATA.email,
        password: USER_DATA.password
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Ошибка при входе пользователя');
    }
    
    // Получаем и сохраняем токен
    const authData = await loginResponse.json();
    AUTH_TOKEN = authData.token;
    console.log('Пользователь авторизован!');
    
    // Получаем упражнения
    console.log('Получаем доступные упражнения...');
    const exercises = await getExercises();
    console.log(`Получено ${exercises.length} упражнений`);
    
    // Создаем случайные тренировки вместо работы с API
    console.log('Создаем 20 случайных тренировок за последние 14 дней...');
    
    // Создаем заданное количество тренировок с разными датами
    for (let i = 0; i < 20; i++) {
      // Выбираем случайный день из последних 14
      const randomDay = Math.floor(Math.random() * 14);
      const workoutDate = getDateDaysAgo(randomDay);
      
      // Выбираем случайный тип тренировки
      const workoutType = ['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'HIIT', 'CUSTOM'][Math.floor(Math.random() * 5)];
      
      // Создаем случайную продолжительность и калории
      const duration = Math.floor(Math.random() * 60) + 20; // 20-80 минут
      const calories = duration * (Math.floor(Math.random() * 10) + 5); // 5-15 калорий в минуту
      
      // Создаем тренировку
      const workout = {
        name: `${workoutType} тренировка ${i}`,
        description: `Автоматически созданная тренировка ${i}`,
        type: workoutType,
        duration: duration,
        caloriesBurned: calories,
        date: workoutDate,
        isPublic: true,
        status: 'COMPLETED',
        completionPercentage: Math.floor(Math.random() * 30) + 70 // 70-100%
      };
      
      try {
        // Отправляем запрос к API
        const response = await fetch(`${API_URL}/workouts/completed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
          },
          body: JSON.stringify(workout)
        });
        
        if (response.ok) {
          console.log(`Создана тренировка ${workout.name} (${new Date(workout.date).toLocaleDateString()})`);
        } else {
          const errorText = await response.text();
          console.error(`Ошибка при создании тренировки: ${errorText}`);
          
          // Попробуем создать базовую тренировку без упражнений
          const basicWorkout = {
            name: workout.name,
            description: workout.description,
            type: workout.type,
            duration: workout.duration,
            caloriesBurned: workout.caloriesBurned
          };
          
          const basicResponse = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(basicWorkout)
          });
          
          if (basicResponse.ok) {
            console.log(`Создана базовая тренировка ${basicWorkout.name}`);
          } else {
            console.error(`Ошибка при создании базовой тренировки: ${await basicResponse.text()}`);
          }
        }
      } catch (error) {
        console.error(`Ошибка запроса: ${error.message}`);
      }
      
      // Добавляем небольшую задержку между запросами
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Тренировки созданы успешно!');
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

// Запускаем создание тренировок
createDailyWorkouts(); 
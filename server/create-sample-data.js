/**
 * Скрипт для создания тестовых данных в базе данных
 * Запускать после создания базы данных
 */

const fetch = require('node-fetch');

// Данные для авторизации
const API_URL = 'http://localhost:8000';
let AUTH_TOKEN = '';

// Пользовательские данные
const USER_DATA = {
  email: 'user@example.com',
  password: 'password123',
  firstName: 'Иван',
  lastName: 'Иванов',
  age: 30,
  gender: 'male',
  activityLevel: 'moderately_active',
  fitnessGoals: ['weight_loss', 'muscle_gain']
};

// Примеры тренировок
const WORKOUTS = [
  {
    name: 'Утренняя кардио тренировка',
    description: 'Легкая кардио тренировка для утренней зарядки и заряда энергией на весь день',
    type: 'CARDIO',
    duration: 30,
    caloriesBurned: 250,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Бег', sets: 1, reps: 1, duration: 15 },
      { name: 'Прыжки со скакалкой', sets: 3, reps: 1, duration: 3 },
      { name: 'Велотренажер', sets: 1, reps: 1, duration: 10 }
    ]
  },
  {
    name: 'Тренировка верхней части тела',
    description: 'Полная тренировка мышц груди, спины и рук',
    type: 'STRENGTH',
    duration: 60,
    caloriesBurned: 400,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Жим лежа', sets: 4, reps: 10, weight: 60 },
      { name: 'Подтягивания', sets: 3, reps: 8 },
      { name: 'Разводка гантелей лежа', sets: 3, reps: 12, weight: 16 },
      { name: 'Тяга верхнего блока', sets: 3, reps: 12, weight: 50 },
      { name: 'Сгибание рук с гантелями', sets: 3, reps: 12, weight: 12 }
    ]
  },
  {
    name: 'День ног',
    description: 'Тренировка для развития силы и объема мышц ног',
    type: 'STRENGTH',
    duration: 70,
    caloriesBurned: 500,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Приседания со штангой', sets: 5, reps: 8, weight: 80 },
      { name: 'Жим ногами', sets: 4, reps: 12, weight: 150 },
      { name: 'Выпады с гантелями', sets: 3, reps: 10, weight: 16 },
      { name: 'Становая тяга', sets: 3, reps: 8, weight: 100 }
    ]
  },
  {
    name: 'Круговая тренировка',
    description: 'Высокоинтенсивная круговая тренировка для сжигания жира и повышения выносливости',
    type: 'HIIT',
    duration: 40,
    caloriesBurned: 500,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Отжимания', sets: 3, reps: 15 },
      { name: 'Приседания', sets: 3, reps: 20 },
      { name: 'Скручивания', sets: 3, reps: 15 },
      { name: 'Планка', sets: 3, reps: 1, duration: 60 },
      { name: 'Берпи', sets: 3, reps: 10 }
    ]
  },
  {
    name: 'Йога для начинающих',
    description: 'Базовый комплекс йоги для начинающих, направленный на развитие гибкости и расслабление',
    type: 'FLEXIBILITY',
    duration: 45,
    caloriesBurned: 200,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Поза горы', sets: 1, reps: 1, duration: 60 },
      { name: 'Поза треугольника', sets: 2, reps: 1, duration: 60 },
      { name: 'Поза собаки мордой вниз', sets: 3, reps: 1, duration: 30 },
      { name: 'Поза кобры', sets: 3, reps: 1, duration: 30 },
      { name: 'Поза ребенка', sets: 2, reps: 1, duration: 60 }
    ]
  },
  {
    name: 'Интенсивная кардио тренировка',
    description: 'Высокоинтенсивная кардио тренировка для максимального сжигания калорий',
    type: 'CARDIO',
    duration: 45,
    caloriesBurned: 500,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Бег', sets: 1, reps: 1, duration: 20 },
      { name: 'Прыжки со скакалкой', sets: 5, reps: 1, duration: 3 },
      { name: 'Эллиптический тренажер', sets: 1, reps: 1, duration: 15 }
    ]
  },
  {
    name: 'Тренировка плеч и рук',
    description: 'Фокусированная тренировка на развитие плечевого пояса и рук',
    type: 'STRENGTH',
    duration: 45,
    caloriesBurned: 350,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Жим гантелей сидя', sets: 4, reps: 10, weight: 16 },
      { name: 'Разведение гантелей в стороны', sets: 3, reps: 15, weight: 8 },
      { name: 'Сгибание рук с гантелями', sets: 3, reps: 12, weight: 12 },
      { name: 'Французский жим', sets: 3, reps: 12, weight: 20 }
    ]
  },
  {
    name: 'Полноценная тренировка всего тела',
    description: 'Эффективная тренировка для проработки всех основных групп мышц за одно занятие',
    type: 'CUSTOM',
    duration: 75,
    caloriesBurned: 450,
    date: new Date().toISOString(),
    isPublic: true,
    exercises: [
      { name: 'Жим лежа', sets: 3, reps: 10, weight: 60 },
      { name: 'Приседания со штангой', sets: 3, reps: 12, weight: 70 },
      { name: 'Тяга штанги в наклоне', sets: 3, reps: 10, weight: 50 },
      { name: 'Жим гантелей сидя', sets: 3, reps: 12, weight: 14 },
      { name: 'Скручивания', sets: 3, reps: 15 }
    ]
  }
];

// Функция для генерации случайной даты в течение последних 14 дней
function getRandomPastDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 14); // 0-13 дней назад
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString();
}

// Функция для создания завершенных тренировок
function createCompletedWorkouts(workout, count) {
  // Создаем заданное количество завершенных тренировок с разными датами
  const completedWorkouts = [];
  
  for (let i = 0; i < count; i++) {
    // Создаем копию тренировки
    const completedWorkout = { ...workout };
    // Задаем случайную дату в прошлом (до 14 дней назад)
    completedWorkout.date = getRandomPastDate();
    // Добавляем случайный процент завершения
    completedWorkout.completionPercentage = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    completedWorkouts.push(completedWorkout);
  }
  
  return completedWorkouts;
}

// Основная функция
async function createSampleData() {
  try {
    console.log('Создание тестовых данных...');
    
    // 1. Регистрация пользователя
    console.log('Регистрация пользователя...');
    let response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(USER_DATA)
    });
    
    if (!response.ok) {
      // Если пользователь уже зарегистрирован, выполняем вход
      console.log('Пользователь, возможно, уже существует. Выполняем вход...');
      response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: USER_DATA.email,
          password: USER_DATA.password
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при входе пользователя');
      }
    }
    
    // Получаем и сохраняем токен
    const authData = await response.json();
    AUTH_TOKEN = authData.token;
    console.log('Пользователь авторизован!');
    
    // 2. Создание тренировок
    console.log('Создание тренировок...');
    
    // Для каждой тренировки из шаблона
    for (const workout of WORKOUTS) {
      // Создаем тренировку
      const workoutResponse = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify(workout)
      });
      
      if (!workoutResponse.ok) {
        console.error(`Ошибка при создании тренировки: ${workout.name}`);
        continue;
      }
      
      const createdWorkout = await workoutResponse.json();
      console.log(`Тренировка создана: ${workout.name}`);
      
      // Создаем несколько завершенных тренировок для истории
      const completionCount = Math.floor(Math.random() * 4) + 1; // 1-4 тренировки
      const completedWorkouts = createCompletedWorkouts(workout, completionCount);
      
      for (const completedWorkout of completedWorkouts) {
        try {
          const completionResponse = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(completedWorkout)
          });
          
          if (completionResponse.ok) {
            console.log(`Создана завершенная тренировка: ${completedWorkout.name} (${new Date(completedWorkout.date).toLocaleDateString()})`);
          }
        } catch (error) {
          console.error('Ошибка при создании завершенной тренировки:', error);
        }
      }
    }
    
    console.log('Тестовые данные успешно созданы!');
    
  } catch (error) {
    console.error('Ошибка при создании тестовых данных:', error);
  }
}

// Запускаем создание данных
createSampleData(); 
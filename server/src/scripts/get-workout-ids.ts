// @ts-nocheck для импорта pg
import { Client } from 'pg';

// Простое объявление модуля pg для исправления ошибки TS7016
declare module 'pg';

// Определяем интерфейс для строки с тренировкой
interface WorkoutRow {
  id: string;
  name: string;
  type: string;
}

// Определяем интерфейс для карты тренировок
interface WorkoutMap {
  [key: string]: string;
}

async function getWorkoutIds() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123',
    database: 'fitness_app'
  });
  
  try {
    console.log('Подключение к базе данных...');
    await client.connect();
    console.log('Подключение успешно установлено.');
    
    // Получаем список тренировок
    const result = await client.query('SELECT id, name, type FROM workout ORDER BY name');
    
    console.log('\nСписок доступных тренировок:');
    console.log('-----------------------------');
    
    result.rows.forEach((row: WorkoutRow, index: number) => {
      console.log(`${index + 1}. ID: ${row.id}, Название: ${row.name}, Тип: ${row.type}`);
    });
    
    console.log('\nДля использования в SQL скрипте:');
    
    // Предположим, нам нужны следующие типы тренировок для программы:
    const workoutTypes = [
      'Полноценная тренировка всего тела',
      'Интенсивная кардио тренировка',
      'Тренировка верхней части тела',
      'Тренировка нижней части тела',
      'Тренировка на мышцы кора',
      'Растяжка и гибкость'
    ];
    
    const workoutMap: WorkoutMap = {};
    let count = 1;
    
    // Сначала найдем точные совпадения по названию
    workoutTypes.forEach(type => {
      const match = result.rows.find((row: WorkoutRow) => row.name === type);
      if (match) {
        workoutMap[`workout${count}`] = match.id;
        count++;
      }
    });
    
    // Если не все типы найдены, используем оставшиеся тренировки
    if (Object.keys(workoutMap).length < 6) {
      const remainingTypes = workoutTypes.filter(type => 
        !result.rows.some((row: WorkoutRow) => row.name === type)
      );
      
      const remainingWorkouts = result.rows.filter((row: WorkoutRow) => 
        !Object.values(workoutMap).includes(row.id)
      );
      
      for (let i = 0; i < Math.min(remainingTypes.length, remainingWorkouts.length); i++) {
        workoutMap[`workout${count}`] = remainingWorkouts[i].id;
        count++;
      }
    }
    
    console.log('\nSQL-скрипт для обновления workoutId:');
    Object.entries(workoutMap).forEach(([placeholder, realId]) => {
      console.log(`UPDATE program SET "workoutSchedule" = jsonb_set("workoutSchedule", '{workoutId}', '"${realId}"', true) WHERE "workoutSchedule"->>'workoutId' = '${placeholder}';`);
    });
    
  } catch (error) {
    console.error('Ошибка при получении ID тренировок:', error);
  } finally {
    await client.end();
    console.log('\nСоединение с базой данных закрыто.');
  }
}

// Запускаем функцию
getWorkoutIds(); 
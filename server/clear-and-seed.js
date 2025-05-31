const { Client } = require('pg');
const { spawn } = require('child_process');
const path = require('path');

// Настройка подключения к базе данных
const dbConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123',
  database: 'fitness_app'
};

async function clearAndSeedDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Подключение к базе данных...');
    await client.connect();
    
    // Список всех таблиц, которые нужно очистить
    const tables = [
      'workout_exercise',
      'workout',
      'exercise',
      'program',
      'scheduled_workouts',
      'workout_progress',
      'activity',
      'achievement',
      'health_metric',
      'notification',
      'user_challenges_challenge',
      'challenge'
    ];
    
    // Отключаем проверку внешних ключей, чтобы можно было очистить таблицы
    console.log('Отключение проверки внешних ключей...');
    await client.query('SET CONSTRAINTS ALL DEFERRED');
    
    // Очищаем каждую таблицу в обратном порядке (из-за зависимостей)
    console.log('Очистка таблиц...');
    for (const table of tables) {
      try {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
        console.log(`Таблица ${table} успешно очищена`);
      } catch (err) {
        console.log(`Ошибка при очистке таблицы ${table}: ${err.message}`);
      }
    }
    
    // Включаем обратно проверку внешних ключей
    console.log('Включение проверки внешних ключей...');
    await client.query('SET CONSTRAINTS ALL IMMEDIATE');
    
    console.log('База данных успешно очищена!');
    
    // Запускаем seed скрипт для заполнения базы данных
    console.log('Запуск скрипта заполнения базы тестовыми данными...');
    await new Promise((resolve, reject) => {
      const seedProcess = spawn('node', ['dist/seed.js'], {
        cwd: path.resolve(__dirname),
        stdio: 'inherit'
      });
      
      seedProcess.on('close', (code) => {
        if (code === 0) {
          console.log('База данных успешно заполнена тестовыми данными!');
          resolve();
        } else {
          console.error(`Ошибка при заполнении базы данных, код: ${code}`);
          reject(new Error(`Процесс завершился с кодом ${code}`));
        }
      });
    });
    
  } catch (error) {
    console.error('Произошла ошибка:', error);
  } finally {
    await client.end();
  }
}

// Запускаем функцию
clearAndSeedDatabase(); 
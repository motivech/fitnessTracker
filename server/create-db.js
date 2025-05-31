const { Client } = require('pg');

async function createDatabase() {
  // Подключаемся к postgres для создания БД
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123',
    database: 'postgres', // Подключаемся к стандартной БД postgres
  });

  try {
    await client.connect();
    console.log('Подключение к postgres установлено');

    // Проверяем, существует ли уже БД
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'fitness_app'"
    );

    if (checkResult.rowCount === 0) {
      // Создаем БД, если она не существует
      await client.query('CREATE DATABASE fitness_app');
      console.log('База данных fitness_app успешно создана');
    } else {
      console.log('База данных fitness_app уже существует');
    }
  } catch (error) {
    console.error('Ошибка при создании базы данных:', error);
  } finally {
    await client.end();
  }
}

// Запускаем функцию
createDatabase(); 
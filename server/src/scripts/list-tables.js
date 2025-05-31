const { Client } = require('pg');

async function listTables() {
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
    
    // Получаем список таблиц
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nСписок таблиц в базе данных:');
    console.log('-----------------------------');
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Ошибка при получении списка таблиц:', error);
  } finally {
    await client.end();
    console.log('\nСоединение с базой данных закрыто.');
  }
}

// Запускаем функцию
listTables(); 
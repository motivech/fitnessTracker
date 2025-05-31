import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';

// Функция для запуска обновления статуса тренировок
const updateWorkouts = async () => {
  try {
    console.log('Инициализация соединения с базой данных...');
    const dataSource: DataSource = await AppDataSource.initialize();
    
    console.log('Обновление статуса публичности тренировок...');
    
    // Используем прямой SQL-запрос для обновления первых 20 тренировок
    const result = await dataSource.query(`
      UPDATE workout 
      SET "isPublic" = true 
      WHERE id IN (
        SELECT id FROM workout ORDER BY "createdAt" LIMIT 20
      )
    `);
    
    console.log('Тренировки успешно обновлены!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при обновлении статуса тренировок:', error);
    process.exit(1);
  }
};

// Запускаем функцию
updateWorkouts(); 
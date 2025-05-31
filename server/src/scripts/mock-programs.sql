-- Удаляем существующие данные программ
DELETE FROM scheduled_workouts WHERE "programId" IS NOT NULL;
DELETE FROM program;

-- Добавляем новые программы тренировок
INSERT INTO program (id, name, description, "durationDays", "workoutSchedule", "isPublic", "createdAt", "creatorId")
VALUES 
  ('c3d4e5f6-a7b8-49c0-1d2e-3f4a5b6c7d8e', 'Программа для набора мышечной массы (30 дней)', 
   'Месячная программа для увеличения мышечной массы с фокусом на силовые упражнения', 
   30, 
   '[
      {"dayOfProgram": 1, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 2, "timeOfDay": "18:00", "workoutId": "e6d8f867-fb35-41e8-903d-18c9004a9e6b"},
      {"dayOfProgram": 3, "timeOfDay": "18:00", "workoutId": "0eaea517-061f-4eba-a45c-a17e88411052"},
      {"dayOfProgram": 4, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 5, "timeOfDay": "18:00", "workoutId": "b41b46e2-9ace-4ae4-8a28-d438b2dcd4a2"},
      {"dayOfProgram": 6, "timeOfDay": "10:00", "workoutId": "9049e7b1-7cf0-4310-9ccb-39d522a31b67"},
      {"dayOfProgram": 7, "timeOfDay": null, "workoutId": null},
      {"dayOfProgram": 8, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 9, "timeOfDay": "18:00", "workoutId": "e6d8f867-fb35-41e8-903d-18c9004a9e6b"},
      {"dayOfProgram": 10, "timeOfDay": "18:00", "workoutId": "0eaea517-061f-4eba-a45c-a17e88411052"},
      {"dayOfProgram": 11, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 12, "timeOfDay": "18:00", "workoutId": "b41b46e2-9ace-4ae4-8a28-d438b2dcd4a2"},
      {"dayOfProgram": 13, "timeOfDay": "10:00", "workoutId": "9049e7b1-7cf0-4310-9ccb-39d522a31b67"},
      {"dayOfProgram": 14, "timeOfDay": null, "workoutId": null},
      {"dayOfProgram": 15, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 16, "timeOfDay": "18:00", "workoutId": "e6d8f867-fb35-41e8-903d-18c9004a9e6b"},
      {"dayOfProgram": 17, "timeOfDay": "18:00", "workoutId": "0eaea517-061f-4eba-a45c-a17e88411052"},
      {"dayOfProgram": 18, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 19, "timeOfDay": "18:00", "workoutId": "b41b46e2-9ace-4ae4-8a28-d438b2dcd4a2"},
      {"dayOfProgram": 20, "timeOfDay": "10:00", "workoutId": "9049e7b1-7cf0-4310-9ccb-39d522a31b67"},
      {"dayOfProgram": 21, "timeOfDay": null, "workoutId": null},
      {"dayOfProgram": 22, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 23, "timeOfDay": "18:00", "workoutId": "e6d8f867-fb35-41e8-903d-18c9004a9e6b"},
      {"dayOfProgram": 24, "timeOfDay": "18:00", "workoutId": "0eaea517-061f-4eba-a45c-a17e88411052"},
      {"dayOfProgram": 25, "timeOfDay": "18:00", "workoutId": "64f01602-2d7a-4781-8557-33fe27544f3b"},
      {"dayOfProgram": 26, "timeOfDay": "18:00", "workoutId": "b41b46e2-9ace-4ae4-8a28-d438b2dcd4a2"},
      {"dayOfProgram": 27, "timeOfDay": "10:00", "workoutId": "9049e7b1-7cf0-4310-9ccb-39d522a31b67"},
      {"dayOfProgram": 28, "timeOfDay": null, "workoutId": null},
      {"dayOfProgram": 29, "timeOfDay": "08:00", "workoutId": "36973930-4205-41b1-8650-ade223e2548f"},
      {"dayOfProgram": 30, "timeOfDay": "18:00", "workoutId": "0eaea517-061f-4eba-a45c-a17e88411052"}
   ]'::jsonb, 
   true, 
   NOW(), 
   'd2e3f4a5-b6c7-48d8-9e0f-1a2b3c4d5e6f');

-- Обновляем workoutIds на реальные ID тренировок из таблицы workout (эту часть нужно будет адаптировать)
-- Например:
-- UPDATE program 
-- SET "workoutSchedule" = jsonb_set("workoutSchedule", '{0,workoutId}', '"реальный_id_тренировки"')
-- WHERE id = 'prog-001' AND "workoutSchedule"->0->>'workoutId' = 'workout1';

-- Вывод: Чтобы правильно задать ID тренировок, необходимо знать реальные ID из базы данных
-- Сначала выполните SELECT id, name FROM workout; чтобы получить список доступных тренировок
-- Затем обновите скрипт, заменив placeholder IDs (workout1, workout2, ...) на реальные ID 
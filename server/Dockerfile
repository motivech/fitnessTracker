# 1. Стадия сборки
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Сборка проекта
RUN npm run build

# 2. Финальный образ
FROM node:20

WORKDIR /app

# Копируем только необходимые файлы из стадии сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

# Запуск в продакшн-режиме
CMD ["node", "dist/src/main"]

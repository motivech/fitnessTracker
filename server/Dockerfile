# 1. Стадия сборки
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
RUN npm config set strict-ssl false
RUN npm config set registry https://registry.npmjs.org/
RUN npm i -g pnpm
RUN pnpm i 

COPY . .

# Сборка проекта
RUN npm run build

# 2. Финальный образ
FROM node:20

WORKDIR /app

RUN npm i -g pnpm

# Копируем только необходимые файлы из стадии сборки
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./

# Пересобираем нативные модули для текущей платформы
RUN pnpm rebuild bcrypt

EXPOSE 3000

# Запуск в продакшн-режиме
CMD ["node", "dist/main"]

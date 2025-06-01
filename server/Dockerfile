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

EXPOSE 3000

# Запуск в продакшн-режиме
CMD ["npm", "run",  "start:dev"]

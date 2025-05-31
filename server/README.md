<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# API Фитнес-приложения

## Описание

Этот проект представляет собой REST API для фитнес-приложения, разработанное с использованием NestJS и TypeORM. API предоставляет возможности для:
- Аутентификации и управления пользователями
- Отслеживания тренировок
- Создания вызовов и участия в них
- Получения и отслеживания достижений
- Мониторинга показателей здоровья

## Установка и запуск

### Предварительные требования
- Node.js 16+ и npm
- PostgreSQL 12+

### Установка
1. Клонируйте репозиторий
2. Убедитесь, что PostgreSQL запущен на вашем компьютере
3. Запустите файл `setup.bat` из корневой директории проекта:
```bash
./setup.bat
```

Этот скрипт установит все необходимые зависимости, создаст базу данных и запустит приложение.

### Ручная установка
1. Установите зависимости:
```bash
cd server
npm install
npm install @nestjs/swagger swagger-ui-express
```

2. Создайте базу данных:
```bash
node create-db.js
```

3. Соберите проект:
```bash
npm run build
```

4. Запустите приложение:
```bash
npm run start:dev
```

## Документация API

После запуска приложения документация Swagger доступна по адресу:
```
http://localhost:8000/api/docs
```

### Основные модули API:

#### 1. Аутентификация (/auth)
- POST /auth/register - Регистрация нового пользователя
- POST /auth/login - Вход в систему
- GET /auth/profile - Получение профиля пользователя

#### 2. Тренировки (/workouts)
- POST /workouts - Создание новой тренировки
- GET /workouts - Получение всех тренировок пользователя
- GET /workouts/stats - Получение статистики тренировок
- GET /workouts/:id - Получение информации о конкретной тренировке
- PATCH /workouts/:id - Обновление тренировки
- DELETE /workouts/:id - Удаление тренировки

#### 3. Вызовы (/challenges)
- POST /challenges - Создание нового вызова
- GET /challenges - Получение всех вызовов
- GET /challenges/:id - Получение информации о конкретном вызове
- POST /challenges/:id/join - Присоединение к вызову
- GET /challenges/:id/progress - Получение прогресса вызова
- GET /challenges/:id/leaderboard - Получение таблицы лидеров вызова

#### 4. Достижения (/achievements)
- POST /achievements - Создание нового достижения (только для администраторов)
- GET /achievements/my - Получение достижений пользователя
- GET /achievements/check - Проверка и начисление достижений
- GET /achievements/leaderboard - Получение таблицы лидеров по очкам

#### 5. Показатели здоровья (/health-metrics)
- POST /health-metrics - Добавление новой метрики здоровья
- GET /health-metrics - Получение метрик здоровья
- GET /health-metrics/trends - Получение трендов метрик здоровья
- GET /health-metrics/:id - Получение информации о конкретной метрике
- PATCH /health-metrics/:id - Обновление метрики
- DELETE /health-metrics/:id - Удаление метрики

## Аутентификация

Для защищенных эндпоинтов требуется аутентификация с помощью JWT токена. 
Токен можно получить при регистрации или входе в систему и должен быть передан в заголовке `Authorization` в формате Bearer:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Технологии

- [NestJS](https://nestjs.com/) - Современный Node.js фреймворк
- [TypeORM](https://typeorm.io/) - ORM для TypeScript и JavaScript
- [PostgreSQL](https://www.postgresql.org/) - Реляционная база данных
- [Swagger](https://swagger.io/) - Инструмент для документирования API
- [Passport](http://www.passportjs.org/) - Аутентификация для Node.js
- [JWT](https://jwt.io/) - JSON Web Tokens для авторизации

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

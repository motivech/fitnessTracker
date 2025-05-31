import { Injectable, UnauthorizedException, Logger, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);
    
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector
    ) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Логирование входящего запроса для отладки
        const request = context.switchToHttp().getRequest<Request>();
        this.logRequest(request);
        
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: any) {
        if (err) {
            this.logger.error(`JWT ошибка аутентификации: ${err.message}`, err.stack);
            throw err;
        }
        
        if (!user) {
            this.logger.warn(`JWT аутентификация не удалась. Info: ${info?.message || 'Нет информации'}`);
            if (info instanceof Error) {
                this.logger.warn(`JWT ошибка: ${info.message}`, info.stack);
            }
            throw new UnauthorizedException('Не авторизован');
        }
        
        this.logger.debug(`Успешная JWT аутентификация для пользователя: ${user.id}`);
        return user;
    }
    
    private logRequest(request: Request) {
        this.logger.debug(`Входящий запрос: ${request.method} ${request.url}`);
        
        // Логируем заголовки авторизации (только для отладки)
        const authHeader = request.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                // Проверяем, валидный ли токен (без проверки подписи)
                const decodedToken = this.jwtService.decode(token);
                this.logger.debug(`Токен присутствует для пользователя: ${decodedToken['userId']}`);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
                this.logger.warn(`Невозможно декодировать токен: ${errorMessage}`);
            }
        } else {
            this.logger.warn('Заголовок Authorization отсутствует');
        }
    }
} 
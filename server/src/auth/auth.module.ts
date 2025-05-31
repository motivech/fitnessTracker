import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../entities/User';
import { APP_GUARD } from '@nestjs/core';
import { UsersService } from './users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
        }),
    ],
    controllers: [AuthController, UsersController],
    providers: [
        AuthService, 
        JwtStrategy,
        UsersService,
        {
            provide: JwtAuthGuard,
            useClass: JwtAuthGuard
        }
    ],
    exports: [AuthService, JwtAuthGuard, UsersService],
})
export class AuthModule {} 
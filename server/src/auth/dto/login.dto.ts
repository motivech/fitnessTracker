import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Email пользователя',
        example: 'user@example.com'
    })
    @IsEmail()
    email = '';

    @ApiProperty({
        description: 'Пароль пользователя',
        example: 'password123',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password = '';
} 
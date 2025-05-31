import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { Challenge } from '../entities/Challenge';
import { User } from '../entities/User';

@Module({
    imports: [
        TypeOrmModule.forFeature([Challenge, User])
    ],
    controllers: [ChallengesController],
    providers: [ChallengesService],
    exports: [ChallengesService]
})
export class ChallengesModule {} 
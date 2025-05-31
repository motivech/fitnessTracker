import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from '../entities/Challenge';
import { User } from '../entities/User';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeProgress, ChallengeLeaderboardEntry } from './types/challenge.types';

@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async create(createChallengeDto: CreateChallengeDto, creatorId: string): Promise<Challenge> {
        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator) {
            throw new NotFoundException('User not found');
        }

        const challenge = this.challengeRepository.create({
            ...createChallengeDto,
            creator,
            participants: [creator]
        });

        return this.challengeRepository.save(challenge);
    }

    async findAll(): Promise<Challenge[]> {
        return this.challengeRepository.find({
            relations: ['creator', 'participants']
        });
    }

    async findOne(id: string): Promise<Challenge> {
        const challenge = await this.challengeRepository.findOne({
            where: { id },
            relations: ['creator', 'participants']
        });

        if (!challenge) {
            throw new NotFoundException('Challenge not found');
        }

        return challenge;
    }

    async update(id: string, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
        const challenge = await this.findOne(id);
        Object.assign(challenge, updateChallengeDto);
        return this.challengeRepository.save(challenge);
    }

    async remove(id: string): Promise<void> {
        const challenge = await this.findOne(id);
        await this.challengeRepository.remove(challenge);
    }

    async joinChallenge(challengeId: string, userId: string): Promise<Challenge> {
        const challenge = await this.findOne(challengeId);
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!challenge.participants) {
            challenge.participants = [];
        }

        if (challenge.participants.some(p => p.id === userId)) {
            return challenge;
        }

        challenge.participants.push(user);
        return this.challengeRepository.save(challenge);
    }

    async getChallengeProgress(challengeId: string): Promise<ChallengeProgress> {
        const challenge = await this.findOne(challengeId);
        const progress = (challenge.currentValue / challenge.targetValue) * 100;

        if (!challenge.participants) {
            challenge.participants = [];
        }

        const participantsProgress = await Promise.all(
            challenge.participants.map(async (participant) => {
                const userProgress = await this.calculateUserProgress(challenge, participant);
                return {
                    userId: participant.id,
                    progress: userProgress
                };
            })
        );

        return {
            progress,
            participants: participantsProgress
        };
    }

    async getLeaderboard(challengeId: string): Promise<ChallengeLeaderboardEntry[]> {
        const challenge = await this.findOne(challengeId);
        
        if (!challenge.participants) {
            challenge.participants = [];
        }
        
        const leaderboard = await Promise.all(
            challenge.participants.map(async (participant) => {
                const progress = await this.calculateUserProgress(challenge, participant);
                return {
                    user: {
                        id: participant.id,
                        firstName: participant.firstName,
                        lastName: participant.lastName
                    },
                    progress
                };
            })
        );

        return leaderboard.sort((a, b) => b.progress - a.progress);
    }

    private async calculateUserProgress(challenge: Challenge, user: User): Promise<number> {
        switch (challenge.type) {
            case 'distance':
                return await this.calculateDistanceProgress(user, challenge);
            case 'calories':
                return await this.calculateCaloriesProgress(user, challenge);
            case 'workouts':
                return await this.calculateWorkoutsProgress(user, challenge);
            case 'streak':
                return await this.calculateStreakProgress(user, challenge);
            default:
                return 0;
        }
    }

    private async calculateDistanceProgress(user: User, challenge: Challenge): Promise<number> {
        // Реализация расчета прогресса по дистанции
        return 0;
    }

    private async calculateCaloriesProgress(user: User, challenge: Challenge): Promise<number> {
        // Реализация расчета прогресса по калориям
        return 0;
    }

    private async calculateWorkoutsProgress(user: User, challenge: Challenge): Promise<number> {
        // Реализация расчета прогресса по тренировкам
        return 0;
    }

    private async calculateStreakProgress(user: User, challenge: Challenge): Promise<number> {
        // Реализация расчета прогресса по серии тренировок
        return 0;
    }
} 
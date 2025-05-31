import { User } from '../../entities/User';
import { ChallengeType } from '../../entities/Challenge';

export interface ChallengeProgress {
    progress: number;
    participants: Array<{
        userId: string;
        progress: number;
    }>;
}

export interface ChallengeLeaderboardEntry {
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    progress: number;
} 
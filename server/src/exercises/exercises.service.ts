import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise, ExerciseType, MuscleGroup } from '../entities/Exercise';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

interface ExerciseFilters {
    type?: ExerciseType;
    muscleGroup?: MuscleGroup;
}

@Injectable()
export class ExercisesService {
    constructor(
        @InjectRepository(Exercise)
        private exercisesRepository: Repository<Exercise>,
    ) {}

    async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
        const exercise = this.exercisesRepository.create(createExerciseDto);
        return this.exercisesRepository.save(exercise);
    }

    async findAll(filters?: ExerciseFilters): Promise<Exercise[]> {
        if (!filters || (!filters.type && !filters.muscleGroup)) {
            return this.exercisesRepository.find();
        }

        // Построение условий WHERE
        const where: any = {};
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.muscleGroup) {
            where.muscleGroup = filters.muscleGroup;
        }

        return this.exercisesRepository.find({ where });
    }

    async findAllByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
        return this.exercisesRepository.find({ 
            where: { muscleGroup: muscleGroup as MuscleGroup } 
        });
    }

    async findAllByType(type: string): Promise<Exercise[]> {
        return this.exercisesRepository.find({ 
            where: { type: type as ExerciseType } 
        });
    }

    async findByName(name: string): Promise<Exercise | null> {
        const exercise = await this.exercisesRepository.findOne({ 
            where: { name } 
        });
        
        return exercise;
    }

    async findOne(id: string): Promise<Exercise> {
        const exercise = await this.exercisesRepository.findOne({ where: { id } });
        
        if (!exercise) {
            throw new NotFoundException(`Упражнение с ID ${id} не найдено`);
        }
        
        return exercise;
    }

    async update(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
        const exercise = await this.findOne(id);
        
        Object.assign(exercise, updateExerciseDto);
        
        return this.exercisesRepository.save(exercise);
    }

    async remove(id: string): Promise<void> {
        const result = await this.exercisesRepository.delete(id);
        
        if (result.affected === 0) {
            throw new NotFoundException(`Упражнение с ID ${id} не найдено`);
        }
    }
} 
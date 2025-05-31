import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityDto, ActivityType } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { User } from '../entities/User';
import { Activity } from '../entities/Activity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
  ) {}

  async create(createActivityDto: CreateActivityDto, user: User): Promise<Activity> {
    const activity = this.activitiesRepository.create({
      ...createActivityDto,
      date: createActivityDto.date || new Date(),
      user,
    });
    
    return this.activitiesRepository.save(activity);
  }

  async findAll(user: User): Promise<Activity[]> {
    return this.activitiesRepository.find({
      where: { user: { id: user.id } },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Activity> {
    const activity = await this.activitiesRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    
    if (!activity) {
      throw new NotFoundException(`Активность с ID ${id} не найдена`);
    }
    
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, user: User): Promise<Activity> {
    const activity = await this.findOne(id, user);
    
    Object.assign(activity, updateActivityDto);
    
    return this.activitiesRepository.save(activity);
  }

  async remove(id: string, user: User): Promise<void> {
    const activity = await this.findOne(id, user);
    
    await this.activitiesRepository.remove(activity);
  }

  async getActivityStats(user: User) {
    const activities = await this.activitiesRepository.find({
      where: { user: { id: user.id } },
    });
    
    // Подсчет общей статистики
    const totalCalories = activities.reduce((sum, activity) => sum + activity.calories, 0);
    const totalDistance = activities.reduce((sum, activity) => sum + activity.distance, 0);
    const totalSteps = activities.reduce((sum, activity) => sum + activity.steps, 0);
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    
    // Группировка активностей по типу
    const activityByType = activities.reduce((groups: Record<string, Activity[]>, activity) => {
      const type = activity.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(activity);
      return groups;
    }, {});
    
    // Для каждого типа активности подсчитываем статистику
    const typeStats = Object.entries(activityByType).map(([type, typeActivities]) => {
      return {
        type,
        count: typeActivities.length,
        totalCalories: typeActivities.reduce((sum, activity) => sum + activity.calories, 0),
        totalDistance: typeActivities.reduce((sum, activity) => sum + activity.distance, 0),
        totalSteps: typeActivities.reduce((sum, activity) => sum + activity.steps, 0),
        totalDuration: typeActivities.reduce((sum, activity) => sum + activity.duration, 0),
      };
    });
    
    // Получаем статистику за последнюю неделю
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekActivities = activities.filter(activity => activity.date >= oneWeekAgo);
    const weekStats = {
      totalCalories: weekActivities.reduce((sum, activity) => sum + activity.calories, 0),
      totalDistance: weekActivities.reduce((sum, activity) => sum + activity.distance, 0),
      totalSteps: weekActivities.reduce((sum, activity) => sum + activity.steps, 0),
      totalDuration: weekActivities.reduce((sum, activity) => sum + activity.duration, 0),
      count: weekActivities.length,
    };
    
    return {
      total: {
        calories: totalCalories,
        distance: totalDistance,
        steps: totalSteps,
        duration: totalDuration,
        activitiesCount: activities.length,
      },
      byType: typeStats,
      weekStats,
    };
  }
} 
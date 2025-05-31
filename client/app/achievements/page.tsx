"use client"

import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { getUserAchievements, checkAchievements, getLeaderboard, getAllAchievements, getUserStats } from '@/services/achievements';
import { 
  Award, 
  CheckCircle, 
  Trophy, 
  Medal, 
  Star,
  Dumbbell,
  TrendingUp,
  BarChart
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Achievement, UserAchievement } from "@/lib/types";
import { useExperience } from '@/hooks/useExperience'

// Функция для получения иконки по типу достижения
const getAchievementIcon = (type: string, size: number = 4) => {
  const className = `h-${size} w-${size} text-primary`;
  
  switch (type) {
    case 'WORKOUT':
    case 'workout':
      return <Dumbbell className={className} />;
    case 'STREAK':
    case 'streak':
      return <Trophy className={className} />;
    case 'DISTANCE':
    case 'distance':
      return <TrendingUp className={className} />;
    case 'LEVEL':
    case 'level':
      return <Star className={className} />;
    case 'EXERCISE':
    case 'exercise':
      return <BarChart className={className} />;
    case 'PROGRAM':
    case 'program':
      return <Award className={className} />;
    default:
      return <Award className={className} />;
  }
};

// Функция для расчета прогресса достижения
const calculateAchievementProgress = (achievement: Achievement, userStats: any) => {
  // Проверка на наличие требований
  if (!achievement.requirements) {
    return 0;
  }
  
  // Если достижение основано на серверных данных и имеет другую структуру (требования в формате {metric, value})
  if (typeof achievement.requirements === 'object' && 'metric' in achievement.requirements) {
    const req = achievement.requirements as unknown as { metric: string; value: number };
    let currentValue = 0;
    
    // Определяем текущее значение в зависимости от типа требования
    switch (req.metric) {
      case 'total_workouts':
        currentValue = userStats.totalWorkouts || 0;
        break;
      case 'streak_days':
        currentValue = userStats.streakDays || 0;
        break;
      case 'total_distance':
        currentValue = userStats.totalDistance || 0;
        break;
      case 'level':
        currentValue = userStats.level || 1;
        break;
      case 'exercise_count':
        currentValue = userStats.totalExercises || 0;
        break;
      default:
        currentValue = 0;
    }
    
    // Ограничиваем прогресс до 100%
    return Math.min(100, Math.round((currentValue / req.value) * 100));
  }
  
  // Если достижение имеет массив требований
  if (Array.isArray(achievement.requirements) && achievement.requirements.length > 0) {
    const requirement = achievement.requirements[0];
    let currentValue = 0;
    
    // В реальном приложении здесь будет логика определения текущего значения
    // на основе статистики пользователя
    switch (requirement.type) {
      case 'WORKOUT':
      case 'workout':
        currentValue = userStats.totalWorkouts || 0;
        break;
      case 'STREAK':
      case 'streak':
        currentValue = userStats.streakDays || 0;
        break;
      case 'DISTANCE':
      case 'distance':
        currentValue = userStats.totalDistance || 0;
        break;
      case 'LEVEL':
      case 'level':
        currentValue = userStats.level || 1;
        break;
      case 'EXERCISE':
      case 'exercise':
        currentValue = userStats.totalExercises || 0;
        break;
      case 'PROGRAM':
        currentValue = userStats.completedPrograms || 0;
        break;
      default:
        return 0;
    }
    
    // Ограничиваем прогресс до 100%
    return Math.min(100, Math.round((currentValue / requirement.value) * 100));
  }
  
  return 0;
};

// Функция для получения описания требования достижения
const getRequirementDescription = (achievement: Achievement): string => {
  if (Array.isArray(achievement.requirements) && achievement.requirements.length > 0) {
    return achievement.requirements[0].description;
  }
  
  if (typeof achievement.requirements === 'object' && 'metric' in achievement.requirements) {
    const req = achievement.requirements as unknown as { metric: string; value: number };
    switch (req.metric) {
      case 'total_workouts':
        return `Завершите ${req.value} тренировок`;
      case 'streak_days':
        return `Тренируйтесь ${req.value} дней подряд`;
      case 'total_distance':
        return `Пробегите ${req.value} км в общей сложности`;
      case 'level':
        return `Достигните ${req.value} уровня`;
      case 'exercise_count':
        return `Выполните ${req.value} различных упражнений`;
      default:
        return achievement.description;
    }
  }
  
  return achievement.description;
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expData, refreshExperience] = useExperience();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ id: string; username: string; points: number; level: number }[]>([]);
  
  // Статистика пользователя
  const [userStats, setUserStats] = useState({
    totalWorkouts: 0,
    streakDays: 0,
    totalDistance: 0,
    totalExercises: 0,
    completedPrograms: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Получаем все достижения
      const allAchievementsData = await getAllAchievements();
      
      // Получаем достижения пользователя
      const userAchievementsData = await getUserAchievements();
      
      // Получаем таблицу лидеров
      const leaderboardData = await getLeaderboard();
      
      // Запускаем проверку новых достижений (фоновая задача)
      await checkAchievements();
      
      // Получаем реальные данные о статистике пользователя
      const userStatsData = await getUserStats();
      
      console.log('Все достижения:', allAchievementsData.length);
      console.log('Достижения пользователя:', userAchievementsData.length);
      
      setAchievements(allAchievementsData);
      setUserAchievements(userAchievementsData);
      
      // Устанавливаем статистику пользователя
      setUserStats({
        totalWorkouts: userStatsData.totalWorkouts || 0,
        streakDays: userStatsData.streakDays || 0,
        totalDistance: userStatsData.totalDistance || 0,
        totalExercises: userStatsData.totalExercises || 0,
        completedPrograms: userStatsData.completedPrograms || 0
      });
      
      // Обновляем данные об опыте
      await refreshExperience();
      
      // Устанавливаем данные таблицы лидеров
      setLeaderboard(handleLeaderboardData(leaderboardData));
      
    } catch (error) {
      console.error("Ошибка при загрузке достижений:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить достижения",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Функция для удаления дубликатов достижений
  const removeDuplicates = (achievements: Achievement[]): Achievement[] => {
    const uniqueMap = new Map<string, Achievement>();
    
    // Добавляем в мапу только уникальные достижения по имени
    for (const achievement of achievements) {
      if (!uniqueMap.has(achievement.name)) {
        uniqueMap.set(achievement.name, achievement);
      }
    }
    
    return Array.from(uniqueMap.values());
  };
  
  // Обновляем расчет общего количества очков
  const calculateTotalPoints = () => {
    return expData.totalXP;
  };

  // Проверка, получено ли достижение
  const isAchievementUnlocked = (achievementId: string) => {
    // Используем предварительно очищенный от дубликатов список достижений пользователя для проверки
    const uniqueUserAchievements = removeDuplicates(userAchievements);
    
    // Также проверяем по имени, а не только по ID, для лучшей синхронизации
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      return uniqueUserAchievements.some(a => a.name === achievement.name);
    }
    
    return uniqueUserAchievements.some(a => a.id === achievementId);
  };

  // Обработка данных лидерборда
  const handleLeaderboardData = (data: any[]) => {
    if (!Array.isArray(data)) return [];
    
    // Преобразуем данные и убедимся, что используем только реальные значения
    const processedData = data.map(entry => ({
      id: entry.id || '',
      username: entry.username || 'Пользователь',
      points: Number(entry.points) || 0,
      level: Number(entry.level) || 1
    }));
    
    // Сортируем по количеству очков (от большего к меньшему)
    return processedData.sort((a, b) => b.points - a.points);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Достижения</h1>
          <p className="text-muted-foreground mt-1">Отслеживайте свой прогресс и получайте награды</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-medium">Уровень {expData.level}</span>
            </div>
            <div className="w-48 space-y-1">
              {user && (
                <>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>XP до уровня {expData.level + 1}</span>
                    <span className="font-medium">
                      {expData.experience % (expData.level * 100)}/
                      {expData.level * 100}
                    </span>
                  </div>
                  <Progress 
                    value={expData.progressToNextLevel} 
                    className="h-1.5" 
                  />
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-medium">
              {calculateTotalPoints()} XP
            </span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Все достижения</TabsTrigger>
          <TabsTrigger value="unlocked">Полученные ({removeDuplicates(userAchievements).length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Таблица лидеров</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Все доступные достижения: {achievements.length}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = isAchievementUnlocked(achievement.id);
              const progress = calculateAchievementProgress(achievement, userStats);
              // Добавляем проверку на 100% прогресс даже если достижение не отмечено как разблокированное
              const isCompleted = isUnlocked || progress === 100;
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`border ${isCompleted ? 'bg-primary/5 border-primary/30' : 'opacity-80'}`}
                >
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon || getAchievementIcon(achievement.type, 8)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <Badge variant={isCompleted ? "default" : "outline"} className="ml-2">{achievement.points} XP</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{getRequirementDescription(achievement)}</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                        
                        {isCompleted && (
                          <div className="mt-2 inline-flex items-center text-xs font-medium text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Разблокировано
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="unlocked" className="space-y-6">
          {userAchievements && userAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAchievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className="border bg-primary/5 border-primary/30"
                >
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon || getAchievementIcon(achievement.type, 8)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <Badge variant="default" className="ml-2 bg-primary">{achievement.points} XP</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center text-xs font-medium text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Разблокировано
                          </div>
                          
                          {achievement.dateEarned && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(achievement.dateEarned).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">У вас пока нет полученных достижений</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Выполняйте тренировки и достигайте целей, чтобы разблокировать достижения и получать награды
              </p>
              <Button onClick={async () => {
                try {
                  setLoading(true);
                  // Проверяем и получаем новые достижения
                  const newAchievements = await checkAchievements();
                  
                  if (newAchievements && newAchievements.length > 0) {
                    setUserAchievements(newAchievements);
                    toast({
                      title: "Поздравляем!",
                      description: `Вы получили ${newAchievements.length} новых достижений`,
                      variant: "default"
                    });
                  } else {
                    toast({
                      title: "Информация",
                      description: "Новых достижений пока нет. Продолжайте тренироваться!",
                      variant: "default"
                    });
                  }
                } catch (error) {
                  console.error("Ошибка при проверке достижений:", error);
                  toast({
                    title: "Ошибка",
                    description: "Не удалось проверить достижения",
                    variant: "destructive"
                  });
                } finally {
                  setLoading(false);
                }
              }}>
                Проверить мои достижения
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Таблица лидеров</CardTitle>
              <CardDescription>
                Пользователи с наибольшим количеством опыта (XP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => {
                    // Определяем, является ли текущая запись текущим пользователем по ID
                    const isCurrentUser = user && user.id === entry.id;
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isCurrentUser ? 'bg-primary/10' : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {index === 0 ? (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100 text-yellow-600">
                              <Trophy className="h-4 w-4" />
                            </div>
                          ) : index === 1 ? (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600">
                              <Medal className="h-4 w-4" />
                            </div>
                          ) : index === 2 ? (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-600">
                              <Medal className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground">
                              {index + 1}
                            </div>
                          )}
                          <span className="font-medium">{entry.username}</span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="ml-1">Вы</Badge>
                          )}
                          <Badge variant="outline" className="ml-2">Уровень {entry.level}</Badge>
                        </div>
                        <div className="font-bold">{entry.points} XP</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Таблица лидеров пуста</h3>
                  <p className="text-muted-foreground mb-4">
                    Выполняйте тренировки и получайте достижения, чтобы попасть в рейтинг
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
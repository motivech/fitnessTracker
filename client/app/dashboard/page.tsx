"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/providers/auth-provider"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart, Calendar, Activity, Target, TrendingUp, Dumbbell, PieChart, ChevronRight, Bell, Award, Trophy, Star, Medal } from "lucide-react"
import Link from "next/link"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ActivityChart } from "@/components/dashboard/ActivityChart"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subDays, isValid } from "date-fns"
import { ru } from "date-fns/locale"
import { WORKOUT_TYPE_REVERSE_MAP } from "@/lib/constants"
import { WorkoutIntensityChart } from "@/components/dashboard/WorkoutIntensityChart"
import { WorkoutTypeChart } from "@/components/dashboard/WorkoutTypeChart"
import { WeeklyProgressChart } from "../../components/dashboard/WeeklyProgressChart"
import { getAllWorkouts, getCompletedWorkouts } from "@/services/workouts"
import { Workout, WorkoutProgress, Achievement } from "@/lib/types"
import { getUnreadNotifications } from "@/services/notifications"
import NotificationDropdown from "@/components/ui/notification-dropdown"
import { getUserAchievements, getAllAchievements, getUserStats, checkAchievements } from "@/services/achievements"

interface StatsCard {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

interface DashboardStats {
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  completionRate: number
}

// Определяем типы для данных графика интенсивности
interface IntensityItem {
  day: string
  date: string
  intensity: number
  count: number
}

// Определяем типы для данных круговой диаграммы
interface PieChartItem {
  name: string
  value: number
}

interface ActivityItem {
  day: string
  value: number
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    completionRate: 0
  })
  const [statsCards, setStatsCards] = useState<StatsCard[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [intensityData, setIntensityData] = useState<IntensityItem[]>([])
  const [typeData, setTypeData] = useState<PieChartItem[]>([])
  const [activityData, setActivityData] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const { toast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/login")
    }
  }, [user, loading])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Получаем все тренировки пользователя
        const workouts = await getAllWorkouts()
        
        // Получаем завершенные тренировки с деталями (включая упражнения)
        const completedWorkouts = await getCompletedWorkouts()
        
        // Для отображения в отчетах используем только завершенные тренировки
        // Отфильтровываем тренировки, которые были завершены
        const enrichedWorkouts = completedWorkouts.map((completed: WorkoutProgress) => {
          if (completed && completed.workout) {
            return {
              ...completed.workout,
              exercises: completed.workout.exercises || [],
              completionPercentage: completed.completionPercentage
            }
          }
          return null
        }).filter(Boolean) as Workout[]
        
        // Сортируем по дате последней тренировки (от новых к старым)
        enrichedWorkouts.sort((a, b) => {
          // Используем дату завершения (из WorkoutProgress) вместо updatedAt
          const completedA = completedWorkouts.find((cw: WorkoutProgress) => cw.workoutId === a.id)
          const completedB = completedWorkouts.find((cw: WorkoutProgress) => cw.workoutId === b.id)
          
          const dateA = completedA && completedA.date ? new Date(completedA.date) : new Date(a.createdAt)
          const dateB = completedB && completedB.date ? new Date(completedB.date) : new Date(b.createdAt)
          return dateB.getTime() - dateA.getTime()
        })
        
        setRecentWorkouts(enrichedWorkouts)
        
        // Обработка данных для графика интенсивности тренировок (по дням недели)
        const today = new Date()
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        
        // Создаем объект с днями недели для учета интенсивности тренировок
        const intensityByDay = dayNames.map((day, index) => {
          const date = subDays(today, 6 - index)
          const dayWorkouts = completedWorkouts.filter((workout: WorkoutProgress) => {
            // Проверка на валидность даты
            if (!workout.date || typeof workout.date !== 'string' || workout.date === 'Invalid Date') {
              return false
            }
            try {
              const workoutDate = new Date(workout.date)
              return isValid(workoutDate) && format(workoutDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            } catch (error) {
              return false
            }
          })
          
          return {
            day,
            date: format(date, 'd MMM', { locale: ru }),
            intensity: dayWorkouts.reduce((sum: number, workout: WorkoutProgress) => 
              sum + ((workout.workout?.calories || 0) * (workout.completionPercentage / 100)), 0),
            count: dayWorkouts.length
          }
        })
        
        // Обработка данных для круговой диаграммы типов тренировок
        const workoutTypes = completedWorkouts.reduce((acc: Record<string, number>, workout: WorkoutProgress) => {
          const type = workout.workout?.type || 'custom'
          
          if (!acc[type]) {
            acc[type] = 0
          }
          
          acc[type]++
          return acc
        }, {} as Record<string, number>)
        
        const pieChartData = Object.entries(workoutTypes).map(([type, count]) => ({
          name: WORKOUT_TYPE_REVERSE_MAP[type] || type,
          value: count as number
        })) as PieChartItem[]
        
        // Обработка данных для столбчатой диаграммы активности
        const activityData = dayNames.map((day, index) => {
          const date = subDays(today, 6 - index)
          const dayWorkouts = completedWorkouts.filter((workout: WorkoutProgress) => {
            // Проверка на валидность даты
            if (!workout.date || typeof workout.date !== 'string' || workout.date === 'Invalid Date') {
              return false
            }
            try {
              const workoutDate = new Date(workout.date)
              return isValid(workoutDate) && format(workoutDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            } catch (error) {
              return false
            }
          })
          
          const value = dayWorkouts.reduce((sum: number, workout: WorkoutProgress) => 
            sum + ((workout.workout?.duration || 0) * (workout.completionPercentage / 100)), 0)
          
          return {
            day,
            value: Math.round(value)
          }
        })
        
        // Устанавливаем данные для графиков
        setIntensityData(intensityByDay)
        setTypeData(pieChartData)
        setActivityData(activityData)
        
        // Расчет статистики для карточек
        const totalWorkouts = completedWorkouts.length
        const totalDuration = completedWorkouts.reduce((sum: number, workout: WorkoutProgress) => 
          sum + (workout.workout?.duration || 0), 0)
        const totalCalories = completedWorkouts.reduce((sum: number, workout: WorkoutProgress) => 
          sum + (workout.workout?.calories || 0), 0)
        const completionRate = completedWorkouts.length > 0 
          ? Math.round(completedWorkouts.filter((w: WorkoutProgress) => w.completionPercentage >= 95).length / completedWorkouts.length * 100)
          : 0
        
        // Сохраняем статистику
        setStats({
          totalWorkouts,
          totalDuration,
          totalCalories,
          completionRate
        })
        
        // Создаем карточки статистики (только завершенные тренировки)
        setStatsCards([
          {
            title: "Завершенных тренировок",
            value: totalWorkouts.toString(),
            description: `Успешно завершено`,
            icon: <Activity className="h-4 w-4 text-muted-foreground" />
          },
          {
            title: "Калории",
            value: totalCalories.toString(),
            description: "Сожжено калорий",
            icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />
          }
        ])
        
        // Получаем достижения пользователя
        const userAchievements = await getUserAchievements()
        const allPossibleAchievements = await getAllAchievements()
        const stats = await getUserStats()
        
        setAchievements(userAchievements)
        setAllAchievements(allPossibleAchievements)
        setUserStats(stats)
        
        // Проверяем наличие новых достижений
        try {
          await checkAchievements() // Вызываем проверку достижений
        } catch (error) {
          console.error("Ошибка при проверке новых достижений:", error)
        }
        
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные для аналитики",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, toast])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await getUnreadNotifications()
        setUnreadNotifications(notifications.length)
      } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', error)
      }
    }

    if (user) {
      fetchNotifications()
      // Устанавливаем интервал обновления
      const interval = setInterval(fetchNotifications, 60000) // проверяем каждую минуту
      return () => clearInterval(interval)
    }
  }, [user])

  const openWorkoutDetails = (workout: Workout) => {
    setSelectedWorkout(workout)
    setIsWorkoutModalOpen(true)
  }

  if (loading || isLoading) {
    return (
      <div className="container py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 md:py-10">
      <div className="flex flex-col space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Дашборд</h1>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full flex justify-between md:w-auto">
            <TabsTrigger value="overview" className="flex-1 md:flex-none">Обзор</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 md:flex-none">Аналитика</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 md:flex-none">Отчеты</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 max-w-3xl">
              {statsCards.map((stat, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
                    <CardTitle className="text-sm md:text-base font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-2">
              <Card className="col-span-full lg:col-span-4 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Активность за неделю</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Ваши тренировки и активности
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[180px] md:h-[200px]">
                    <ActivityChart data={activityData} />
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-full lg:col-span-3 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base md:text-lg">Недавние тренировки</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Последние 5 тренировок
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {recentWorkouts.length > 0 ? (
                      recentWorkouts.slice(0, 5).map((workout, i) => (
                        <div 
                          key={workout.id} 
                          className="flex items-center cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                          onClick={() => openWorkoutDetails(workout)}
                        >
                          <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-primary/10">
                            <Dumbbell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          <div className="ml-3 md:ml-4 space-y-0.5 md:space-y-1 flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium leading-none truncate">{workout.name}</p>
                            <p className="text-[10px] md:text-sm text-muted-foreground">
                              {workout.createdAt && typeof workout.createdAt === 'string' && workout.createdAt !== 'Invalid Date' && isValid(new Date(workout.createdAt))
                                ? format(new Date(workout.createdAt), 'PPP', { locale: ru })
                                : ''}
                            </p>
                          </div>
                          <div className="ml-auto font-medium text-xs md:text-sm">
                            {WORKOUT_TYPE_REVERSE_MAP[workout.type] || workout.type}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-center items-center py-6">
                        <p className="text-sm text-muted-foreground">У вас пока нет тренировок</p>
                      </div>
                    )}
                    
                    <Link href="/workouts" className="block text-center mt-4">
                      <Button variant="outline" size="sm" className="px-4 transition-colors hover:bg-primary hover:text-white">
                        Все тренировки
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Динамика выполнений тренировок */}
              <Card className="h-[400px]">
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-sm font-medium text-primary">Динамика выполнения тренировок</CardTitle>
                      <CardDescription className="text-xs">Прогресс по дням недели</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-primary/5 text-primary text-xs font-normal">
                      {format(new Date(), 'MMMM yyyy', { locale: ru })}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 h-[320px]">
                  <WorkoutIntensityChart workouts={intensityData} />
                </CardContent>
              </Card>

              {/* Распределение по типам */}
              <Card className="h-[400px]">
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-sm font-medium text-primary">Распределение по типам</CardTitle>
                      <CardDescription className="text-xs">Соотношение типов тренировок</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-primary/5 text-primary text-xs font-normal">
                      Все время
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-5 h-[320px]">
                  <WorkoutTypeChart workouts={typeData} />
                </CardContent>
              </Card>
            </div>

            {/* Система достижений */}
            <Card className="h-[400px] shadow-sm">
              <CardHeader className="pb-2 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium text-primary">Прогресс достижений</CardTitle>
                    <CardDescription className="text-xs">Полученные награды и доступные достижения</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/5 text-primary text-xs font-normal">
                    Игровые механики
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3 h-[320px] overflow-auto">
                {achievements.length > 0 || allAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {/* Полученные достижения */}
                    {achievements.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center">
                          <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                          Полученные достижения
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {achievements.slice(0, 4).map((achievement) => (
                            <div key={achievement.id} className="bg-primary/5 rounded-lg p-3 flex items-center border border-primary/10 hover:border-primary/30 transition-colors">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                {achievement.icon ? (
                                  <span className="text-lg">{achievement.icon}</span>
                                ) : (
                                  <Award className="h-5 w-5" />
                                )}
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className="font-medium text-xs">{achievement.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
                              </div>
                              <Badge className="ml-2 bg-yellow-500/90 hover:bg-yellow-500 text-[10px]">+{achievement.points} XP</Badge>
                            </div>
                          ))}
                        </div>
                        {achievements.length > 4 && (
                          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                            Показать все ({achievements.length})
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {/* Доступные достижения */}
                    {allAchievements.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2 flex items-center">
                          <Star className="h-4 w-4 text-muted-foreground mr-1" />
                          Следующие достижения
                        </h3>
                        <div className="space-y-3">
                          {allAchievements
                            .filter(a => !achievements.some(ua => ua.name === a.name))
                            .slice(0, 3)
                            .map((achievement) => {
                              // Расчет примерного прогресса для достижения
                              let progress = 0;
                              if (userStats && achievement.requirements && achievement.requirements.length > 0) {
                                const req = achievement.requirements[0];
                                if (req.type === 'WORKOUT' && userStats.totalWorkouts) {
                                  progress = Math.min(100, (userStats.totalWorkouts / req.value) * 100);
                                } else if (req.type === 'STREAK' && userStats.streakDays) {
                                  progress = Math.min(100, (userStats.streakDays / req.value) * 100);
                                } else if (req.type === 'EXERCISE' && userStats.totalExercises) {
                                  progress = Math.min(100, (userStats.totalExercises / req.value) * 100);
                                } else if (req.type === 'LEVEL' && userStats.level) {
                                  progress = Math.min(100, (userStats.level / req.value) * 100);
                                }
                              }

                              return (
                                <div key={achievement.id} className="bg-muted rounded-lg p-3 border border-border">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 w-8 h-8 bg-background rounded-full flex items-center justify-center text-muted-foreground">
                                      {achievement.icon ? (
                                        <span className="text-sm">{achievement.icon}</span>
                                      ) : (
                                        <Medal className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                      <p className="font-medium text-xs">{achievement.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
                                    </div>
                                    <Badge className="ml-2 bg-background text-[10px]">+{achievement.points} XP</Badge>
                                  </div>
                                  <div className="mt-2">
                                    <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                                      <span>Прогресс</span>
                                      <span>{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1" />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        <Link href="/achievements" className="block mt-4 text-center">
                          <Button variant="outline" size="sm" className="text-xs">
                            Все достижения
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-3">
                      <Award className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-medium mb-1">Нет достижений</h3>
                    <p className="text-xs text-muted-foreground text-center max-w-xs">
                      Завершите тренировки и выполняйте различные активности, чтобы получить достижения и награды
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">История тренировок</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Полный список ваших тренировок с подробной информацией
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {recentWorkouts.length > 0 ? (
                    recentWorkouts.map((workout) => (
                      <div 
                        key={workout.id}
                        className="flex flex-col md:flex-row md:items-center p-3 md:p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => openWorkoutDetails(workout)}
                      >
                        <div className="flex items-center mb-2 md:mb-0">
                          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/10 mr-3 md:mr-4">
                            <Dumbbell className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-base md:text-lg truncate">{workout.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {workout.createdAt && typeof workout.createdAt === 'string' && workout.createdAt !== 'Invalid Date' && isValid(new Date(workout.createdAt))
                                ? format(new Date(workout.createdAt), 'PPP', { locale: ru })
                                : ''}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-2 md:justify-end md:flex-1 md:gap-4">
                          <div className="text-center">
                            <p className="text-xs md:text-sm font-medium">{workout.durationMinutes || workout.duration || 0} мин</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Время</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs md:text-sm font-medium">{workout.calories}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">ккал</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs md:text-sm font-medium">{workout.exercises?.length || 0}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Упражнений</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="text-[10px] md:text-xs bg-primary/10 text-primary">
                              {WORKOUT_TYPE_REVERSE_MAP[workout.type] || workout.type}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="ml-auto md:ml-0">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-center">
                        <div className="flex justify-center mb-4">
                          <Activity className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-base md:text-lg font-medium mb-2">У вас пока нет тренировок</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-4">Запланируйте вашу первую тренировку, чтобы увидеть статистику</p>
                        <Link href="/workouts">
                          <Button size="sm" className="md:py-2 md:px-4">Создать тренировку</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {recentWorkouts.length > 5 && (
                    <div className="flex justify-center mt-4 md:mt-6">
                      <Button variant="outline" size="sm" className="md:py-2 md:px-4">
                        Загрузить больше
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Модальное окно для отображения деталей тренировки */}
      {isWorkoutModalOpen && selectedWorkout && (
        <Dialog open={isWorkoutModalOpen} onOpenChange={setIsWorkoutModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedWorkout.name}</DialogTitle>
              <DialogDescription>
                {selectedWorkout.description || "Нет описания"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Тип</p>
                  <p className="font-medium">{WORKOUT_TYPE_REVERSE_MAP[selectedWorkout.type] || selectedWorkout.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Длительность</p>
                  <p className="font-medium">{selectedWorkout.durationMinutes || selectedWorkout.duration || 0} мин</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Калории</p>
                  <p className="font-medium">{selectedWorkout.calories} ккал</p>
                </div>

              </div>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-medium">Упражнения ({selectedWorkout.exercises?.length || 0})</h3>
                  {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {selectedWorkout.exercises.length} {selectedWorkout.exercises.length === 1 ? 'упражнение' : 
                        selectedWorkout.exercises.length < 5 ? 'упражнения' : 'упражнений'}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                    selectedWorkout.exercises.map((exercise, i) => (
                      <div 
                        key={i} 
                        className="p-2 md:p-3 bg-muted rounded-lg border border-border hover:bg-muted/80"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-xs md:text-sm truncate">{exercise.exercise?.name || 'Упражнение'}</p>
                          <div className="flex items-center text-[10px] md:text-xs text-muted-foreground mt-1">
                            <span className="bg-background px-1.5 py-0.5 md:px-2 rounded mr-1 md:mr-2">
                              {exercise.sets} подх.
                            </span>
                            <span className="bg-background px-1.5 py-0.5 md:px-2 rounded">
                              {exercise.reps} повт.
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 md:py-6 bg-muted rounded-lg">
                      <p className="text-xs md:text-sm text-muted-foreground">Нет упражнений для отображения</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="text-xs md:text-sm" onClick={() => setIsWorkoutModalOpen(false)}>
                Закрыть
              </Button>
              <Link href={`/workouts/${selectedWorkout.id}/schedule`} className="w-full sm:w-auto">
                <Button className="w-full text-xs md:text-sm">
                  Запланировать тренировку
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 
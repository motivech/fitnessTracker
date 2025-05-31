"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { format, parseISO, subDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, Dumbbell, TrendingUp, Activity, Info, BarChart2 } from 'lucide-react'
import { Workout, WorkoutProgress } from "@/lib/types"
import { getAllWorkouts, getCompletedWorkouts } from "@/services/workouts"
import { WORKOUT_TYPE_REVERSE_MAP } from "@/lib/constants"

interface ActivityStats {
  totalCalories: number
  totalDuration: number
  totalWorkouts: number
  completedWorkouts: number
  averageCompletion: number
}

export default function ActivityPage() {
  const { user, loading } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    totalCalories: 0,
    totalDuration: 0,
    totalWorkouts: 0,
    completedWorkouts: 0,
    averageCompletion: 0
  })
  
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchWorkoutData()
    }
  }, [user])

  const fetchWorkoutData = async () => {
    try {
      setIsLoading(true)
      
      // Получаем тренировки пользователя
      const workoutsData = await getAllWorkouts()
      setWorkouts(workoutsData)
      
      // Получаем историю выполненных тренировок используя новую функцию
      const historyData = await getCompletedWorkouts()
      setWorkoutHistory(historyData)
      
      // Рассчитываем статистику за последние 7 дней
      const oneWeekAgo = subDays(new Date(), 7)
      const recentHistory = historyData.filter((workout: WorkoutProgress) => 
        new Date(workout.date) >= oneWeekAgo
      )
      
      const totalWorkouts = recentHistory.length
      const completedWorkouts = recentHistory.filter((w: WorkoutProgress) => w.completionPercentage >= 90).length
      const totalCalories = recentHistory.reduce((sum: number, w: WorkoutProgress) => 
        sum + (w.workout?.calories || 0) * (w.completionPercentage / 100), 0
      )
      const totalDuration = recentHistory.reduce((sum: number, w: WorkoutProgress) => 
        sum + (w.workout?.duration || 0) * (w.completionPercentage / 100), 0
      )
      const averageCompletion = recentHistory.length > 0
        ? recentHistory.reduce((sum: number, w: WorkoutProgress) => sum + w.completionPercentage, 0) / recentHistory.length
        : 0
        
      setActivityStats({
        totalCalories,
        totalDuration,
        totalWorkouts,
        completedWorkouts,
        averageCompletion
      })
      
      setIsLoading(false)
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные об активности",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <Activity className="h-10 w-10 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">Загрузка данных активности...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Вы не авторизованы</p>
          <Button asChild>
            <Link href="/auth/login">Войти</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Вычисляем прогресс выполнения целей
  const completionProgress = Math.min(activityStats.averageCompletion, 100)
  
  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Активность</h1>
            <p className="text-muted-foreground">Отслеживайте свои тренировки и физическую активность</p>
          </div>
          <Link href="/workouts">
            <Button>
              <Dumbbell className="mr-2 h-4 w-4" />
              Перейти к тренировкам
            </Button>
          </Link>
        </div>
        
        {/* Статистика за неделю */}
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base text-primary md:text-lg">Статистика за неделю</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Ваша активность за последние 7 дней
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Выполнение тренировок: {activityStats.completedWorkouts} из {activityStats.totalWorkouts} завершено
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(completionProgress)}%
                  </span>
                </div>
                <Progress value={completionProgress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Всего тренировок</p>
                      <div className="bg-muted w-8 h-8 flex items-center justify-center rounded-full">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{activityStats.totalWorkouts}</p>
                    <p className="text-xs text-muted-foreground">За последнюю неделю</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Всего калорий</p>
                      <div className="bg-muted w-8 h-8 flex items-center justify-center rounded-full">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{activityStats.totalCalories} ккал</p>
                    <p className="text-xs text-muted-foreground">Сожжено за неделю</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Активное время</p>
                      <div className="bg-muted w-8 h-8 flex items-center justify-center rounded-full">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{Math.floor(activityStats.totalDuration / 60)} ч {activityStats.totalDuration % 60} мин</p>
                    <p className="text-xs text-muted-foreground">Время тренировок</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Завершено</p>
                      <div className="bg-muted w-8 h-8 flex items-center justify-center rounded-full">
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{activityStats.averageCompletion}%</p>
                    <p className="text-xs text-muted-foreground">Средний % выполнения</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* История активности */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">История тренировок</h2>
            <Link href="/workouts">
              <Button variant="outline" size="sm">
                Все тренировки
              </Button>
            </Link>
          </div>
          
          {workoutHistory.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тренировка</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Длительность</TableHead>
                      <TableHead className="text-right">Выполнено</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workoutHistory.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(item.date), 'd MMMM', { locale: ru })}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.workout?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.workout?.type ? WORKOUT_TYPE_REVERSE_MAP[item.workout.type] || item.workout.type : 'Без типа'}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.workout?.duration} мин</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress 
                              value={item.completionPercentage} 
                              className="h-2 w-16" 
                            />
                            <span className="text-sm font-medium">
                              {item.completionPercentage}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">У вас пока нет активности</h3>
                <p className="text-muted-foreground mb-6">
                  Начните выполнять тренировки, чтобы отслеживать свою активность и прогресс
                </p>
                <Button asChild>
                  <Link href="/workouts">Начать тренировку</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 
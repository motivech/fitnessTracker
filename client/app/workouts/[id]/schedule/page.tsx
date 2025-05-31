"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useAuth } from "@/lib/providers/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getWorkout } from "@/services/workouts"
import { createScheduledWorkout } from "@/services/scheduledWorkouts"
import { Clock, Calendar, Dumbbell } from "lucide-react"

export default function ScheduleWorkoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [workout, setWorkout] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [scheduledTime, setScheduledTime] = useState("12:00")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setIsLoading(true)
        const data = await getWorkout(params.id)
        setWorkout(data)
      } catch (error) {
        console.error("Ошибка загрузки тренировки:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные тренировки",
          variant: "destructive"
        })
        router.push("/workouts")
      } finally {
        setIsLoading(false)
      }
    }

    if (user && params.id) {
      fetchWorkout()
    }
  }, [user, params.id, router, toast])

  const handleSchedule = async () => {
    try {
      if (!workout) return

      // Валидация даты и времени
      if (!scheduledDate || !scheduledTime) {
        toast({
          title: "Ошибка",
          description: "Выберите дату и время тренировки",
          variant: "destructive"
        })
        return
      }

      // Проверка, что дата в будущем
      const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      if (selectedDateTime <= new Date()) {
        toast({
          title: "Ошибка",
          description: "Дата и время тренировки должны быть в будущем",
          variant: "destructive"
        })
        return
      }

      // Используем сервис для создания запланированной тренировки
      await createScheduledWorkout({
        workoutId: workout.id,
        scheduledDate,
        scheduledTime
      })

      toast({
        title: "Успех",
        description: `Тренировка "${workout.name}" запланирована на ${scheduledDate} в ${scheduledTime}`,
      })

      // Перенаправляем на календарь
      router.push("/calendar")
    } catch (error) {
      console.error("Ошибка при планировании тренировки:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось запланировать тренировку",
        variant: "destructive"
      })
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Запланировать тренировку</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{workout?.name}</CardTitle>
          <CardDescription>{workout?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center">
              <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{workout?.type}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{workout?.duration} минут</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 flex items-center justify-center text-muted-foreground">🔥</div>
              <span>{workout?.calories} ккал</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="font-medium">Дата тренировки</Label>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">Выберите дату, когда вы хотите провести тренировку</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="font-medium">Время тренировки</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">Выберите удобное время для тренировки</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button onClick={handleSchedule}>
            Запланировать
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 
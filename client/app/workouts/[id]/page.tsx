"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Calendar, Clock, Edit, ArrowLeft, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const WORKOUT_TYPES = [
  "Кардио",
  "Силовая",
  "Гибкость", 
  "Баланс",
  "Выносливость",
  "Другое"
]

// Моковые данные для примера
const MOCK_WORKOUTS = [
  {
    id: 1,
    name: "Утренняя пробежка",
    type: "Кардио",
    duration: 30,
    date: "2023-05-10",
    calories: 300,
    notes: "Пробежка в парке. Хорошая погода, средний темп.",
    exercises: [
      { name: "Бег", duration: 25, distance: 3.5 },
      { name: "Растяжка", duration: 5 }
    ]
  },
  {
    id: 2,
    name: "Силовая тренировка",
    type: "Силовая",
    duration: 60,
    date: "2023-05-12",
    calories: 450,
    notes: "Тренировка в тренажерном зале. Фокус на верхнюю часть тела.",
    exercises: [
      { name: "Жим лежа", sets: 3, reps: 10, weight: 70 },
      { name: "Тяга верхнего блока", sets: 3, reps: 12, weight: 60 },
      { name: "Подъем гантелей на бицепс", sets: 3, reps: 10, weight: 15 }
    ]
  },
  {
    id: 3,
    name: "Плавание",
    type: "Кардио",
    duration: 45,
    date: "2023-05-15",
    calories: 380,
    notes: "Плавание в бассейне. Работал над техникой кроля.",
    exercises: [
      { name: "Разминка", duration: 5 },
      { name: "Кроль", duration: 20, distance: 0.8 },
      { name: "Брасс", duration: 15, distance: 0.5 },
      { name: "Заминка", duration: 5 }
    ]
  }
]

interface Exercise {
  name: string
  duration?: number
  distance?: number
  sets?: number
  reps?: number
  weight?: number
}

interface Workout {
  id: number
  name: string
  type: string
  duration: number
  date: string
  calories: number
  notes: string
  exercises: Exercise[]
}

export default function WorkoutDetailsPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editedWorkout, setEditedWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        // В реальном приложении получаем данные с сервера
        // Здесь используем моковые данные
        const workoutId = parseInt(params.id)
        const foundWorkout = MOCK_WORKOUTS.find(w => w.id === workoutId)
        
        if (foundWorkout) {
          setWorkout(foundWorkout)
          setEditedWorkout(JSON.parse(JSON.stringify(foundWorkout))) // Глубокое копирование для редактирования
        } else {
          toast({
            title: "Ошибка",
            description: "Тренировка не найдена",
            variant: "destructive"
          })
          router.push("/workouts")
        }
      } catch (error) {
        console.error("Ошибка загрузки тренировки:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные о тренировке",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user && params.id) {
      fetchWorkout()
    }
  }, [user, params.id, router, toast])

  const handleSaveWorkout = () => {
    // В реальном приложении отправляем данные на сервер
    if (editedWorkout) {
      setWorkout(editedWorkout)
      toast({
        title: "Успешно",
        description: "Данные тренировки обновлены"
      })
      setShowEditDialog(false)
    }
  }

  const handleDeleteWorkout = () => {
    // В реальном приложении отправляем запрос на сервер
    toast({
      title: "Успешно",
      description: "Тренировка удалена"
    })
    router.push("/workouts")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading || isLoading) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Загрузка...</h2>
          <p className="text-muted-foreground">Пожалуйста, подождите</p>
        </div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Тренировка не найдена</h2>
          <p className="text-muted-foreground">
            <Link href="/workouts" className="text-primary underline-offset-4 hover:underline">
              Вернуться к списку тренировок
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.push('/workouts')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Детали тренировки</h1>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать тренировку</DialogTitle>
                  <DialogDescription>
                    Измените информацию о вашей тренировке
                  </DialogDescription>
                </DialogHeader>
                {editedWorkout && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        Название
                      </label>
                      <Input
                        id="name"
                        className="col-span-3"
                        value={editedWorkout.name}
                        onChange={(e) => setEditedWorkout({...editedWorkout, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="type" className="text-right">
                        Тип
                      </label>
                      <Select 
                        value={editedWorkout.type}
                        onValueChange={(value) => setEditedWorkout({...editedWorkout, type: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Выберите тип тренировки" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKOUT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="duration" className="text-right">
                        Длительность (мин)
                      </label>
                      <Input
                        id="duration"
                        type="number"
                        className="col-span-3"
                        value={editedWorkout.duration}
                        onChange={(e) => setEditedWorkout({...editedWorkout, duration: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="date" className="text-right">
                        Дата
                      </label>
                      <Input
                        id="date"
                        type="date"
                        className="col-span-3"
                        value={editedWorkout.date}
                        onChange={(e) => setEditedWorkout({...editedWorkout, date: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="calories" className="text-right">
                        Калории
                      </label>
                      <Input
                        id="calories"
                        type="number"
                        className="col-span-3"
                        value={editedWorkout.calories}
                        onChange={(e) => setEditedWorkout({...editedWorkout, calories: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="notes" className="text-right">
                        Заметки
                      </label>
                      <Input
                        id="notes"
                        className="col-span-3"
                        value={editedWorkout.notes}
                        onChange={(e) => setEditedWorkout({...editedWorkout, notes: e.target.value})}
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleSaveWorkout}>
                    Сохранить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" onClick={handleDeleteWorkout}>
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Основные детали тренировки
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Название:</span>
                <span>{workout.name}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Тип:</span>
                <span>{workout.type}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Дата:</span>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(workout.date)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Длительность:</span>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{workout.durationMinutes || workout.duration || 0} минут</span>
                </div>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Сожжено калорий:</span>
                <span>{workout.calories} ккал</span>
              </div>
              <div className="pt-2">
                <span className="font-medium">Заметки:</span>
                <p className="mt-2 text-sm text-muted-foreground">{workout.notes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Упражнения</CardTitle>
              <CardDescription>
                Детали выполненных упражнений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workout.exercises.map((exercise, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h3 className="font-semibold text-lg">{exercise.name}</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      {exercise.duration && (
                        <div>
                          <span className="text-muted-foreground">Длительность:</span>{" "}
                          <span>{exercise.duration} мин</span>
                        </div>
                      )}
                      {exercise.distance && (
                        <div>
                          <span className="text-muted-foreground">Дистанция:</span>{" "}
                          <span>{exercise.distance} км</span>
                        </div>
                      )}
                      {exercise.sets && (
                        <div>
                          <span className="text-muted-foreground">Подходы:</span>{" "}
                          <span>{exercise.sets}</span>
                        </div>
                      )}
                      {exercise.reps && (
                        <div>
                          <span className="text-muted-foreground">Повторения:</span>{" "}
                          <span>{exercise.reps}</span>
                        </div>
                      )}
                      {exercise.weight && (
                        <div>
                          <span className="text-muted-foreground">Вес:</span>{" "}
                          <span>{exercise.weight} кг</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Редактировать упражнения
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 
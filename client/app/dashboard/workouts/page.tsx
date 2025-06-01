"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { API_URL } from '@/lib/constants';

interface Workout {
  id: string
  name: string
  duration: string
  calories: number
  date: Date
}

const workoutSchema = z.object({
  name: z.string().min(2, { message: "Название должно содержать минимум 2 символа" }),
  duration: z.string().min(1, { message: "Введите длительность" }),
  calories: z.coerce.number().positive({ message: "Введите положительное число" }),
})

type WorkoutFormValues = z.infer<typeof workoutSchema>

export default function WorkoutsPage() {
  const { user, loading } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      duration: "",
      calories: 0,
    },
  })

  useEffect(() => {
    if (user) {
      fetchWorkouts()
    }
  }, [user])

  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при получении тренировок')
      }
      
      const data = await response.json()
      setWorkouts(data)
    } catch (error) {
      console.error('Ошибка при загрузке тренировок:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тренировки',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addWorkout = async (data: WorkoutFormValues) => {
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/workouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          type: 'strength', // Значение по умолчанию
          date: new Date(),
          duration: parseInt(data.duration) || 0,
          caloriesBurned: data.calories || 0,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при добавлении тренировки')
      }
      
      await fetchWorkouts()
      
      toast({
        title: 'Успешно',
        description: 'Тренировка добавлена',
      })
      
      form.reset()
      setDialogOpen(false)
    } catch (error) {
      console.error('Ошибка при добавлении тренировки:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить тренировку',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Загрузка...</p>
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Тренировки</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Добавить тренировку</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить тренировку</DialogTitle>
                <DialogDescription>
                  Заполните форму для добавления новой тренировки
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(addWorkout)}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Название тренировки</Label>
                    <Input
                      id="name"
                      placeholder="Например: Бег в парке"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Длительность</Label>
                    <Input
                      id="duration"
                      placeholder="Например: 30 минут"
                      {...form.register("duration")}
                    />
                    {form.formState.errors.duration && (
                      <p className="text-sm text-red-500">{form.formState.errors.duration.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="calories">Калории (ккал)</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="Например: 250"
                      {...form.register("calories")}
                    />
                    {form.formState.errors.calories && (
                      <p className="text-sm text-red-500">{form.formState.errors.calories.message}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Добавление..." : "Добавить"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Список тренировок */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workouts && workouts.length > 0 ? (
            workouts.map((workout) => (
              <Card key={workout.id} className="overflow-hidden">
                <div className="h-2 bg-blue-500"></div>
                <CardHeader>
                  <CardTitle>{workout.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Длительность:</span>
                      <span>{workout.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Калории:</span>
                      <span>{workout.calories} ккал</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Дата:</span>
                      <span>
                        {new Date(workout.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/workouts/${workout.id}`}>
                        Подробнее
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="md:col-span-3 text-center py-12 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Нет тренировок</h2>
              <p className="text-gray-500 mb-6">
                У вас пока нет записанных тренировок. Добавьте свою первую тренировку!
              </p>
              <Button onClick={() => setDialogOpen(true)}>Добавить тренировку</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 

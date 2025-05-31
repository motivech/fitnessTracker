"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Card,
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
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
import { Calendar, Clock, Edit, MoreVertical, Plus, Trash, Dumbbell, Check, X, CalendarDays, Search, InfoIcon, Flame, ListOrdered, Repeat, Timer, CalendarPlus, PlayCircle } from "lucide-react"
import { Workout, Exercise, WorkoutExercise, WorkoutProgress } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { createScheduledWorkout } from "@/services/scheduledWorkouts"
import { getAllWorkouts, getPublicWorkouts } from "@/services/workouts"
import { getActiveWorkouts, addWorkoutToActive, removeWorkoutFromActive, updateWorkoutProgress, completeWorkout as completeWorkoutService } from "@/services/activeWorkouts"
import { Label } from "@/components/ui/label"
import { createWorkout } from "@/services/workouts"
import { Progress } from "@/components/ui/progress"
import { getAllExercises, createExercise } from '@/services/exercises'
import { getCompletedWorkouts } from "@/services/workouts"
import { cn } from "@/lib/utils"
import { checkAchievements } from "@/services/achievements"
import { pluralize } from "@/lib/utils"
import { WORKOUT_TYPE_REVERSE_MAP } from "@/lib/constants"

// Компонент для отображения списка упражнений в карточке тренировки
const WorkoutExercisesList = ({ exercises, limit = 3 }: { exercises: any[], limit?: number }) => {
  if (!exercises || exercises.length === 0) {
    return <div className="text-sm text-muted-foreground">Нет упражнений</div>;
  }

  // Ограничиваем количество отображаемых упражнений
  const displayedExercises = exercises.slice(0, limit);
  
  return (
    <div className="space-y-1">
      {displayedExercises.map((exercise, index) => (
        <div key={exercise.id || `ex-${index}`} className="text-sm flex items-center">
          <span className="font-medium mr-1">{index + 1}.</span> 
          <span>{exercise.exercise?.name || "Упражнение"}</span>
          {exercise.sets > 0 && exercise.reps > 0 ? (
            <span className="text-muted-foreground ml-1">
              ({exercise.sets}×{exercise.reps}
              {exercise.weight && exercise.weight > 0 ? `, ${exercise.weight}кг` : ''})
            </span>
          ) : exercise.duration ? (
            <span className="text-muted-foreground ml-1">
              ({exercise.duration} мин)
            </span>
          ) : null}
        </div>
      ))}
      {exercises.length > limit && (
        <div className="text-sm text-muted-foreground">
          + еще {exercises.length - limit} {pluralize(exercises.length - limit, ['упражнение', 'упражнения', 'упражнений'])}
        </div>
      )}
    </div>
  );
}

// Компонент для детального отображения упражнения в модальном окне
const ExerciseDetail = ({ exercise, isSelected, onToggle }: { 
  exercise: any, 
  isSelected: boolean, 
  onToggle: () => void 
}) => {
  return (
    <div 
      className={
        "flex items-start p-3 rounded-md text-sm border"}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{exercise.exercise?.name || "Упражнение"}</div>
          {exercise.exercise?.muscleGroup && (
            <Badge variant="outline" className="ml-2">
              {exercise.exercise.muscleGroup}
            </Badge>
          )}
        </div>
        
        <div className="mt-1 text-xs text-muted-foreground">
          {exercise.exercise?.description && (
            <div className="mb-1">{exercise.exercise.description}</div>
          )}
          
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            {exercise.sets > 0 && (
              <span className="flex items-center">
                <ListOrdered className="h-3 w-3 mr-1" />
                {exercise.sets} {pluralize(exercise.sets, ['подход', 'подхода', 'подходов'])}
              </span>
            )}
            
            {exercise.reps > 0 && (
              <span className="flex items-center">
                <Repeat className="h-3 w-3 mr-1" />
                {exercise.reps} {pluralize(exercise.reps, ['повторение', 'повторения', 'повторений'])}
              </span>
            )}
            
            {(exercise.weight ?? 0) > 0 && (
              <span className="flex items-center">
                <Dumbbell className="h-3 w-3 mr-1" />
                {exercise.weight ?? 0} кг
              </span>
            )}
            
            {(exercise.duration ?? 0) > 0 && (
              <span className="flex items-center">
                <Timer className="h-3 w-3 mr-1" />
                {exercise.duration ?? 0} сек
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [publicWorkouts, setPublicWorkouts] = useState<Workout[]>([])
  const [activeWorkouts, setActiveWorkouts] = useState<Workout[]>([])
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [currentWorkoutProgress, setCurrentWorkoutProgress] = useState<WorkoutExercise[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    scheduledTime: "12:00"
  })
  
  // Форма добавления тренировки
  const [newWorkout, setNewWorkout] = useState<Partial<Workout>>({
    name: "",
    description: "",
    type: "Кардио",
    duration: 30,
    calories: 300,
    isPublic: false,
    exercises: []
  })

  const [newExerciseForm, setNewExerciseForm] = useState({
    exerciseId: "",
    customExerciseName: "",
    sets: 3,
    reps: 10,
    weight: 0,
    duration: 0,
    isCustom: false
  })

  // Константы для типов тренировок
  const WORKOUT_TYPES = [
    "Кардио",
    "Силовая",
    "Гибкость",
    "Баланс",
    "Выносливость",
    "Другое"
  ]

  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchWorkouts()
      fetchWorkoutHistory()
      fetchExercises()
    }
  }, [user])
  
  const fetchWorkouts = async () => {
    try {
      setIsLoading(true)
      
      // Получаем тренировки, созданные пользователем
      const userWorkouts = await getAllWorkouts();
      console.log("Получено моих тренировок:", userWorkouts.length);
      
      // Отдельно получаем общедоступные тренировки от всех пользователей
      const publicWorkouts = await getPublicWorkouts();
      console.log("Получено общедоступных тренировок:", publicWorkouts.length);
      
      // Проверяем, есть ли упражнения у загруженных тренировок
      if (userWorkouts.length > 0) {
        console.log("Проверка моих тренировок:");
        userWorkouts.forEach((workout, index) => {
          console.log(`Тренировка ${index + 1} (${workout.name}):`, 
                     workout.exercises?.length || 0, "упражнений");
        });
      }
      
      // Устанавливаем тренировки в соответствующие состояния
      setWorkouts(userWorkouts);
      setPublicWorkouts(publicWorkouts);
      
      // Получаем также активные и завершенные тренировки
      await fetchWorkoutHistory();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке тренировок:", error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить тренировки',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };
  
  const fetchExercises = async () => {
    try {
      // Используем новый сервис для получения упражнений
      const exercisesData = await getAllExercises();
      setExercises(exercisesData);
    } catch (error) {
      console.error('Ошибка при загрузке упражнений:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список упражнений',
        variant: 'destructive'
      });
    }
  };
  
  const fetchWorkoutHistory = async () => {
    try {
      console.log("Начинаем загрузку истории тренировок");
      // Получаем реальные данные о выполненных тренировках с использованием новой функции
      const historyData = await getCompletedWorkouts();
      console.log("История тренировок получена, записей:", historyData?.length);
      
      // Проверяем данные истории
      if (historyData && historyData.length > 0) {
        console.log("Анализируем тренировки в истории:");
        
        // Подробно проверяем каждую тренировку
        historyData.forEach((item: WorkoutProgress, index: number) => {
          console.log(`---История ${index+1} (ID: ${item.id})---`);
          console.log(`Дата: ${item.date}`);
          console.log(`ID тренировки: ${item.workoutId}`);
          console.log(`Процент выполнения: ${item.completionPercentage}%`);
          
          if (item.workout) {
            console.log(`Тренировка: ${item.workout.name}`);
            console.log(`Упражнения: ${item.workout.exercises?.length || 0}`);
            
            // Проверяем содержимое упражнений, если они есть
            if (item.workout.exercises && item.workout.exercises.length > 0) {
              console.log("Список упражнений:");
              item.workout.exercises.forEach((ex, i) => {
                console.log(`  ${i+1}. ${ex.exercise?.name || ex.exerciseId} - ${ex.sets || 0}×${ex.reps || 0}`);
              });
            } else {
              console.warn(`⚠️ Тренировка ${item.workout.name} не содержит упражнений!`);
            }
          } else {
            console.warn(`⚠️ Отсутствуют детали тренировки для ID: ${item.workoutId}`);
          }
        });
        
        setWorkoutHistory(historyData);
      } else {
        console.log("История тренировок пуста");
        setWorkoutHistory([]);
      }
    } catch (error) {
      console.error("Ошибка загрузки истории тренировок:", error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить историю тренировок',
        variant: 'destructive'
      });
      setWorkoutHistory([]);
    }
  };
  
  const openWorkoutDetail = (workout: Workout) => {
    // Убедимся, что exercises всегда существует
    const workoutWithExercises = {
      ...workout,
      exercises: workout.exercises || []
    };
    
    setSelectedWorkout(workoutWithExercises);
    
    // По умолчанию выбираем все упражнения из тренировки
    setSelectedExercises((workoutWithExercises.exercises || []).map(ex => ex.id));
    setIsViewDialogOpen(true);
  }
  
  const startWorkout = (workout: Workout) => {
    // Получаем текущие дату и время
    const currentDate = format(new Date(), "yyyy-MM-dd")
    const currentTime = format(new Date(), "HH:mm")
    
    // Создаем запланированную тренировку на текущий момент
    createScheduledWorkout({
      workoutId: workout.id,
      scheduledDate: currentDate,
      scheduledTime: currentTime
    })
    .then(() => {
      toast({
        title: "Тренировка добавлена",
        description: "Тренировка запланирована на сегодня и добавлена в календарь"
      })
      
      // Перенаправляем на страницу календаря
      router.push('/calendar')
    })
    .catch((error) => {
      console.error("Ошибка при планировании тренировки:", error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось запланировать тренировку',
        variant: 'destructive'
      })
    })
  }
  
  const addExerciseToWorkout = async () => {
    try {
      if (newExerciseForm.isCustom) {
        // Если это кастомное упражнение, сначала создаем его
        if (!newExerciseForm.customExerciseName.trim()) {
          toast({
            title: "Ошибка",
            description: "Введите название упражнения",
            variant: "destructive"
          });
          return;
        }
        
        // Создаем новое упражнение
        const newExerciseData = {
          name: newExerciseForm.customExerciseName,
          description: "Пользовательское упражнение",
          muscleGroup: "Другое",
          difficulty: "начинающий" as "начинающий" | "средний" | "продвинутый"
        };
        
        // Отправляем запрос на создание упражнения
        const createdExercise = await createExercise(newExerciseData);
        console.log("Создано новое упражнение:", createdExercise);
        
        // Добавляем новое упражнение к тренировке с правильной структурой
        const newExercise: WorkoutExercise = {
          id: `new-ex-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          exerciseId: createdExercise.id,
          exercise: createdExercise,
          sets: newExerciseForm.sets,
          reps: newExerciseForm.reps,
          weight: newExerciseForm.weight || 0,
          duration: newExerciseForm.duration || 0
        };
        
        // Добавляем упражнение в список упражнений тренировки
        setNewWorkout(prev => ({
          ...prev,
          exercises: [...(prev.exercises || []), newExercise]
        }));
        
        // Обновляем список доступных упражнений
        setExercises(prev => [...prev, createdExercise]);
        
      } else {
        // Если выбрано существующее упражнение
        if (!newExerciseForm.exerciseId) {
          toast({
            title: "Ошибка",
            description: "Выберите упражнение",
            variant: "destructive"
          });
          return;
        }
        
        const exercise = exercises.find(ex => ex.id === newExerciseForm.exerciseId);
        if (!exercise) {
          toast({
            title: "Ошибка",
            description: "Выбранное упражнение не найдено",
            variant: "destructive"
          });
          return;
        }
        
        // Создаем объект упражнения для тренировки с правильным ID
        const newExercise: WorkoutExercise = {
          id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          exerciseId: exercise.id,
          exercise,
          sets: newExerciseForm.sets,
          reps: newExerciseForm.reps,
          weight: newExerciseForm.weight || 0,
          duration: newExerciseForm.duration || 0
        };
        
        // Добавляем упражнение в список упражнений тренировки
        setNewWorkout(prev => ({
          ...prev,
          exercises: [...(prev.exercises || []), newExercise]
        }));

        console.log("Добавлено существующее упражнение:", newExercise);
      }
      
      // Сброс формы
      setNewExerciseForm({
        exerciseId: "",
        customExerciseName: "",
        sets: 3,
        reps: 10,
        weight: 0,
        duration: 0,
        isCustom: false
      });

      toast({
        title: "Упражнение добавлено",
        description: "Упражнение успешно добавлено в тренировку",
      });
      
    } catch (error) {
      console.error("Ошибка при добавлении упражнения:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить упражнение",
        variant: "destructive"
      });
    }
  };
  
  const removeExerciseFromWorkout = (exerciseId: string) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises?.filter(ex => ex.id !== exerciseId) || []
    }))
  }
  
  const handleCreateWorkout = async () => {
    try {
      setIsLoading(true);
      
      // Проверка заполнения обязательных полей
      if (!newWorkout.name?.trim()) {
        toast({
          title: "Ошибка",
          description: "Укажите название тренировки",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Проверяем, что добавлено минимум 3 упражнения
      if (!newWorkout.exercises || newWorkout.exercises.length < 3) {
        toast({
          title: "Ошибка",
          description: "Необходимо добавить минимум 3 упражнения в тренировку",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Создаем тренировку с упражнениями:", newWorkout.exercises);
      
      // Создаем объект тренировки для отправки
      const workoutToCreate = {
        name: newWorkout.name || "",
        description: newWorkout.description || "",
        type: newWorkout.type || "Кардио",
        duration: newWorkout.duration || 30,
        calories: newWorkout.calories || 300,
        isPublic: !!newWorkout.isPublic,
        exercises: newWorkout.exercises || []
      } as Omit<Workout, 'id' | 'createdBy' | 'createdAt'>;
      
      // Используем функцию из сервиса для создания
      const createdWorkout = await createWorkout(workoutToCreate);
      console.log("Тренировка успешно создана:", createdWorkout);
      
      // Обновляем только список доступных тренировок
      await fetchWorkouts();
      
      // Сбрасываем форму
      setNewWorkout({
        name: "",
        description: "",
        type: "Кардио",
        duration: 30,
        calories: 300,
        isPublic: false,
        exercises: []
      });
      
      toast({
        title: "Тренировка создана",
        description: "Новая тренировка успешно добавлена",
      });
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Ошибка при создании тренировки:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать тренировку",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleExerciseSelection = (exerciseId: string) => {
    if (!exerciseId) return;
    
    setSelectedExercises(prev => {
      const safeArray = prev || [];
      
      // Если упражнение уже выбрано, убираем его из массива
      if (safeArray.includes(exerciseId)) {
        return safeArray.filter(id => id !== exerciseId);
      }
      // Иначе добавляем в массив
      return [...safeArray, exerciseId];
    });
  }

  const openPlanningModal = () => {
    setIsViewDialogOpen(false)
    setIsPlanningModalOpen(true)
  }

  const scheduleWorkout = async () => {
    if (!selectedWorkout) return
    
    try {
      const { scheduledDate, scheduledTime } = scheduleForm
      
      // Используем сервис для создания запланированной тренировки
      await createScheduledWorkout({
        workoutId: selectedWorkout.id,
        scheduledDate,
        scheduledTime
      })
      
      toast({
        title: "Тренировка запланирована",
        description: `Тренировка запланирована на ${scheduledDate} в ${scheduledTime}`,
      })
      
      setIsPlanningModalOpen(false)
    } catch (error) {
      console.error("Ошибка при планировании тренировки:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось запланировать тренировку",
        variant: "destructive"
      })
    }
  }

  // Функция для группировки тренировок по месяцам
  const groupWorkoutsByMonth = (workouts: WorkoutProgress[]) => {
    const grouped: { [key: string]: WorkoutProgress[] } = {}
    
    workouts.forEach(workout => {
      if (!workout.date) return; // Пропускаем записи без даты
      
      try {
        const date = parseISO(workout.date)
        const monthKey = format(date, 'LLLL yyyy', { locale: ru })
        
        if (!grouped[monthKey]) {
          grouped[monthKey] = []
        }
        
        grouped[monthKey].push(workout)
      } catch (error) {
        console.error(`Ошибка при обработке даты ${workout.date}:`, error)
      }
    })
    
    return grouped
  }

  // Безопасная функция открытия детальной информации о тренировке из истории
  const openHistoryWorkoutDetail = (workout?: Workout) => {
    if (!workout) return;
    
    // Создаем безопасную копию тренировки с гарантированным массивом exercises
    const workoutWithExercises = {
      ...workout,
      exercises: workout.exercises || []
    };
    
    // Используем стандартную функцию для открытия деталей тренировки
    setSelectedWorkout(workoutWithExercises);
    // Проверяем наличие упражнений и выбираем их ID
    setSelectedExercises((workoutWithExercises.exercises || []).map(ex => ex.id));
    setIsViewDialogOpen(true);
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

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Тренировки</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Создать тренировку
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Создание тренировки</DialogTitle>
                <DialogDescription>
                  Создайте свою собственную программу тренировки
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Название
                  </Label>
                  <Input
                    id="name"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Описание
                  </Label>
                  <Textarea
                    id="description"
                    value={newWorkout.description}
                    onChange={(e) => setNewWorkout({...newWorkout, description: e.target.value})}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Тип
                  </Label>
                  <Select 
                    value={newWorkout.type} 
                    onValueChange={(value) => setNewWorkout({...newWorkout, type: value})}
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
                  <Label htmlFor="duration" className="text-right">
                    Длительность (мин)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({...newWorkout, duration: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="calories" className="text-right">
                    Калории
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    value={newWorkout.calories}
                    onChange={(e) => setNewWorkout({...newWorkout, calories: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isPublic" className="text-right">
                    Публичная
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <Checkbox
                      id="isPublic"
                      checked={newWorkout.isPublic}
                      onCheckedChange={(checked) => 
                        setNewWorkout({...newWorkout, isPublic: checked as boolean})
                      }
                    />
                    <label htmlFor="isPublic" className="ml-2 text-sm">
                      Сделать тренировку доступной для всех
                    </label>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="font-semibold">Упражнения ({newWorkout.exercises?.length || 0}/3 минимум)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        document.getElementById('add-exercise-dialog')?.click()
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить упражнение
                    </Button>
                  </div>
                  
                  {newWorkout.exercises && newWorkout.exercises.length > 0 ? (
                    <div className="border rounded-md p-2">
                      {newWorkout.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex-1">
                            <div className="font-medium">{exercise.exercise?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {exercise.sets} x {exercise.reps} {(exercise.weight ?? 0) > 0 ? `@ ${(exercise.weight ?? 0)}кг` : ''}
                              {(exercise.duration ?? 0) > 0 ? ` | ${(exercise.duration ?? 0)} мин` : ''}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeExerciseFromWorkout(exercise.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border rounded-md text-muted-foreground">
                      Добавьте минимум 3 упражнения в тренировку
                    </div>
                  )}
                  
                  {/* Диалог добавления упражнения */}
                  <Dialog>
                    <DialogTrigger id="add-exercise-dialog" className="hidden">
                      Добавить упражнение
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Добавить упражнение</DialogTitle>
                        <DialogDescription>
                          Выберите упражнение из списка
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          
                          {newExerciseForm.isCustom ? (
                            <div className="space-y-2">
                              <Label htmlFor="custom-exercise">Название упражнения</Label>
                              <Input
                                id="custom-exercise"
                                placeholder="Введите название упражнения"
                                value={newExerciseForm.customExerciseName}
                                onChange={(e) => setNewExerciseForm({
                                  ...newExerciseForm,
                                  customExerciseName: e.target.value
                                })}
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor="exercise-select">Упражнение</Label>
                              <Select
                                value={newExerciseForm.exerciseId}
                                onValueChange={(value) => setNewExerciseForm({...newExerciseForm, exerciseId: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите упражнение" />
                                </SelectTrigger>
                                <SelectContent>
                                  {exercises.map((exercise) => (
                                    <SelectItem key={exercise.id} value={exercise.id}>
                                      {exercise.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sets">Подходы</Label>
                            <Input
                              id="sets"
                              type="number"
                              placeholder="Подходы"
                              value={newExerciseForm.sets}
                              onChange={(e) => setNewExerciseForm({...newExerciseForm, sets: Number(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="reps">Повторения</Label>
                            <Input
                              id="reps"
                              type="number"
                              placeholder="Повторения"
                              value={newExerciseForm.reps}
                              onChange={(e) => setNewExerciseForm({...newExerciseForm, reps: Number(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">Вес (кг)</Label>
                            <Input
                              id="weight"
                              type="number"
                              placeholder="Вес (кг)"
                              value={newExerciseForm.weight}
                              onChange={(e) => setNewExerciseForm({...newExerciseForm, weight: Number(e.target.value)})}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => {
                          document.getElementById('add-exercise-dialog')?.click()
                        }}>
                          Отмена
                        </Button>
                        <Button type="button" onClick={() => {
                          addExerciseToWorkout()
                          document.getElementById('add-exercise-dialog')?.click()
                        }}
                        disabled={newExerciseForm.isCustom ? !newExerciseForm.customExerciseName : !newExerciseForm.exerciseId}>
                          Добавить
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="button" onClick={handleCreateWorkout}>
                  Создать тренировку
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Мои тренировки</TabsTrigger>
            <TabsTrigger value="public">Общедоступные тренировки</TabsTrigger>
            <TabsTrigger value="history">История тренировок</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md mb-4">
              <h3 className="text-sm font-medium mb-1">Раздел "Мои тренировки"</h3>
              <p className="text-sm text-muted-foreground">
                Здесь отображаются тренировки, созданные вами. Вы можете создавать, 
                редактировать и запускать свои тренировочные программы.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workouts.length > 0 ? (
                workouts.map(workout => (
                  <Card key={workout.id} className="cursor-pointer hover:border-primary" onClick={() => openWorkoutDetail(workout)}>
                    <CardHeader className="pb-2">
                      <CardTitle>{workout.name}</CardTitle>
                      <CardDescription>{workout.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        {workout.duration > 0 && (
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{workout.durationMinutes || workout.duration || 0} мин</span>
                          </div>
                        )}
                        {workout.calories > 0 && (
                          <div>~{workout.calories} ккал</div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <h4 className="font-medium text-sm mb-1">Упражнения:</h4>
                        <WorkoutExercisesList exercises={workout.exercises || []} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center p-10 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                  <div className="w-20 h-20 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-10 w-10 text-primary/70" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">У вас пока нет тренировок</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Создайте свою первую тренировку или выберите из готовых шаблонов, чтобы начать свой путь к спортивным достижениям
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Создать тренировку
                    </Button>
                  </div>
                  <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 max-w-md">
                    <div className="flex items-center">
                      <InfoIcon className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-medium text-sm">Совет</h4>
                    </div>
                    <p className="text-sm mt-1">
                      Регулярные тренировки помогают повысить уровень энергии, укрепить здоровье и достичь поставленных целей. Начните с 2-3 тренировок в неделю.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="public" className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md mb-4">
              <h3 className="text-sm font-medium mb-1">Раздел "Общедоступные тренировки"</h3>
              <p className="text-sm text-muted-foreground">
                Здесь отображаются публичные тренировки, созданные всеми пользователями. Вы можете 
                использовать готовые тренировки для своих занятий.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicWorkouts.map(workout => (
                <Card key={workout.id} className="cursor-pointer hover:border-primary" onClick={() => openWorkoutDetail(workout)}>
                  <CardHeader className="pb-2">
                    <CardTitle>{workout.name}</CardTitle>
                    <CardDescription>{workout.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      {workout.duration > 0 && (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{workout.durationMinutes || workout.duration || 0} мин</span>
                        </div>
                      )}
                      {workout.calories > 0 && (
                        <div>~{workout.calories} ккал</div>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-medium text-sm mb-1">Упражнения:</h4>
                      <WorkoutExercisesList exercises={workout.exercises || []} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md mb-4">
              <h3 className="text-sm font-medium mb-1">Раздел "История тренировок"</h3>
              <p className="text-sm text-muted-foreground">
                Здесь отображаются ваши завершенные тренировки. Вы можете отслеживать 
                свой прогресс и историю тренировок.
              </p>
            </div>
            
            {workoutHistory.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupWorkoutsByMonth(workoutHistory)).map(([month, workouts]) => (
                  <div key={month} className="space-y-3">
                    <h3 className="text-lg font-semibold">{month}</h3>
                    <div className="bg-card rounded-lg shadow">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Дата</TableHead>
                            <TableHead>Тренировка</TableHead>
                            <TableHead>Длительность</TableHead>
                            <TableHead className="text-right">Завершено</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workouts.map((item) => (
                            <TableRow 
                              key={item.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => openHistoryWorkoutDetail(item.workout)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                  {format(parseISO(item.date), 'd MMMM', { locale: ru })}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{item.workout?.name}</TableCell>
                              <TableCell>{item.workout?.durationMinutes || item.workout?.duration || 0} мин</TableCell>
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">У вас нет истории тренировок</h3>
                <p className="text-muted-foreground mb-4">Выполните тренировку, чтобы увидеть ее здесь</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Модальное окно детальной информации */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[650px]">
            {selectedWorkout && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-bold">{selectedWorkout.name}</DialogTitle>
                    <Badge className="ml-2" variant={selectedWorkout.isPublic ? "default" : "outline"}>
                      {selectedWorkout.isPublic ? "Публичная" : "Личная"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">{WORKOUT_TYPE_REVERSE_MAP[selectedWorkout.type] || selectedWorkout.type}</Badge>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Информация о тренировке */}
                  <div className="p-4 border rounded-lg bg-background/50">
                    <h3 className="text-lg font-semibold mb-2">Описание</h3>
                    <p className="text-muted-foreground">{selectedWorkout.description || "Описание отсутствует"}</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      <div className="flex flex-col items-center p-3 bg-muted/40 rounded-md">
                        <Clock className="h-5 w-5 text-primary mb-1" />
                        <span className="text-sm font-medium">{selectedWorkout.durationMinutes || selectedWorkout.duration || 0} мин</span>
                        <span className="text-xs text-muted-foreground">Длительность</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted/40 rounded-md">
                        <Flame className="h-5 w-5 text-red-500 mb-1" />
                        <span className="text-sm font-medium">{selectedWorkout.caloriesBurned || selectedWorkout.calories || 0} ккал</span>
                        <span className="text-xs text-muted-foreground">Калории</span>
                      </div>
                      <div className="flex flex-col items-center p-3 bg-muted/40 rounded-md">
                        <Dumbbell className="h-5 w-5 text-primary mb-1" />
                        <span className="text-sm font-medium">{(selectedWorkout.exercises || []).length}</span>
                        <span className="text-xs text-muted-foreground">Упражнений</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Список упражнений */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Упражнения</h3>
                      <div className="text-xs text-muted-foreground">Выберите упражнения для тренировки</div>
                    </div>
                    
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                        selectedWorkout.exercises.map((exercise, index) => (
                          <ExerciseDetail 
                            key={exercise.id || `ex-${index}`} 
                            exercise={exercise}
                            isSelected={selectedExercises.includes(exercise.id)}
                            onToggle={() => toggleExerciseSelection(exercise.id)}
                          />
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-md">
                          Нет упражнений в этой тренировке
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Закрыть
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={openPlanningModal}
                    disabled={!selectedExercises || selectedExercises.length === 0}
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Запланировать
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      // Убедимся, что selectedWorkout и exercises существуют
                      if (selectedWorkout) {
                        const exercises = (selectedWorkout.exercises || [])
                          .filter(ex => selectedExercises && selectedExercises.includes(ex.id));
                        
                        startWorkout({
                          ...selectedWorkout,
                          exercises
                        });
                      }
                    }}
                    disabled={!selectedExercises || selectedExercises.length === 0}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Начать сейчас
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Модальное окно для планирования тренировки */}
        <Dialog open={isPlanningModalOpen} onOpenChange={setIsPlanningModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Запланировать тренировку</DialogTitle>
              <DialogDescription>
                Выберите дату и время для тренировки
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Дата
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduleForm.scheduledDate}
                  onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                  className="col-span-3"
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Время
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduleForm.scheduledTime}
                  onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPlanningModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={scheduleWorkout}>
                Запланировать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 
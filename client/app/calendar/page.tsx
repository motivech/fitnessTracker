"use client"

import React, { useState, useEffect } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  Check,
  Dumbbell,
  CalendarDays,
  Award,
  BarChart,
  Info
} from "lucide-react"
import { format, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { ScheduledWorkout, Workout, TrainingProgram, ProgramProgress } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { 
  getUserScheduledWorkouts, 
  getScheduledWorkoutsByDateRange,
  createScheduledWorkout, 
  updateScheduledWorkout,
  completeScheduledWorkout,
  deleteScheduledWorkout
} from "@/services/scheduledWorkouts"
import { getAllWorkouts } from "@/services/workouts"
import { getWorkout, getWorkoutDetails } from "@/services/workouts"
import { getAllPrograms, getUserActivePrograms, completeProgram, getProgramProgress, startProgram } from "@/services/programs"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { WORKOUT_TYPE_REVERSE_MAP } from "@/lib/constants"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type CalendarViewType = "month" | "week" | "day";

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarViewType>("month")
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([])
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([])
  const [availablePrograms, setAvailablePrograms] = useState<TrainingProgram[]>([])
  
  // Новые состояния для программ тренировок
  const [activePrograms, setActivePrograms] = useState<ProgramProgress[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ProgramProgress | null>(null)
  const [showProgramDetailsDialog, setShowProgramDetailsDialog] = useState(false)
  const [isCompletingProgram, setIsCompletingProgram] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showProgramDialog, setShowProgramDialog] = useState(false)
  const [showWorkoutDetailDialog, setShowWorkoutDetailDialog] = useState(false)
  const [selectedScheduledWorkout, setSelectedScheduledWorkout] = useState<ScheduledWorkout | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  
  // Форма для добавления тренировки в календарь
  const [newScheduledWorkout, setNewScheduledWorkout] = useState({
    workoutId: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    scheduledTime: "12:00"
  })
  
  // Форма для добавления программы тренировок в календарь
  const [newProgramSchedule, setNewProgramSchedule] = useState({
    programId: "",
    startDate: format(new Date(), "yyyy-MM-dd")
  })

  const [isCompletingWorkout, setIsCompletingWorkout] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Получаем данные из API для тренировок и программ
        const workouts = await getAllWorkouts()
        const programs = await getAllPrograms()
        
        // Получаем активные программы тренировок пользователя
        const userPrograms = await getUserActivePrograms()
        
        console.log("Активные программы:", userPrograms)
        
        setAvailableWorkouts(workouts)
        setAvailablePrograms(programs)
        setActivePrograms(userPrograms)
        
        // Используем общую функцию обновления данных календаря
        await refreshCalendarData()
      } catch (error) {
        console.error("Ошибка загрузки данных:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные календаря",
          variant: "destructive"
        })
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, toast])

  // Добавляем отдельный эффект для обработки параметра refresh в URL
  useEffect(() => {
    // Проверяем наличие параметра refresh в URL
    const params = new URLSearchParams(window.location.search)
    const shouldRefresh = params.get('refresh') === 'true'
    
    if (shouldRefresh && user) {
      // Если есть параметр refresh, выполняем полное обновление данных
      console.log("Обнаружен параметр refresh=true, выполняем полное обновление данных")
      const fullRefresh = async () => {
        try {
          setIsLoading(true)
          
          // Получаем заново данные о программах 
          const programs = await getAllPrograms()
          setAvailablePrograms(programs)
          
          // Получаем активные программы тренировок пользователя
          const userPrograms = await getUserActivePrograms()
          setActivePrograms(userPrograms)
          
          // Обновляем календарь
          await refreshCalendarData()
          
          // Удаляем параметр refresh из URL без перезагрузки страницы
          const newUrl = window.location.pathname
          window.history.replaceState({}, document.title, newUrl)
        } catch (error) {
          console.error("Ошибка при полном обновлении данных:", error)
        }
      }
      
      fullRefresh()
    }
  }, [user])

  // Добавляем новый useEffect только для обновления данных календаря при смене месяца
  useEffect(() => {
    if (user) {
      // Обновляем только данные календаря без загрузки всех программ и тренировок
      refreshCalendarData()
        .catch(error => {
          console.error("Ошибка при обновлении календаря:", error)
        })
    }
  }, [currentDate, view, user]) // Зависимость от текущей даты, представления и пользователя
  
  const navigatePrevious = () => {
    if (view === "month") {
      const newDate = subMonths(currentDate, 1)
      setCurrentDate(newDate)
      // При смене месяца нужно обновить данные
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, -7))
    } else {
      setCurrentDate(addDays(currentDate, -1))
    }
  }
  
  const navigateNext = () => {
    if (view === "month") {
      const newDate = addMonths(currentDate, 1)
      setCurrentDate(newDate)
      // При смене месяца нужно обновить данные
    } else if (view === "week") {
      setCurrentDate(addDays(currentDate, 7))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }
  
  const getWorkoutsForDate = (date: Date) => {
    return scheduledWorkouts.filter(workout => 
      isSameDay(parseISO(workout.scheduledDate), date)
    );
  }
  
  const openWorkoutDetail = (workout: ScheduledWorkout) => {
    // Находим связанную программу, если есть
    if (workout.programId) {
      const program = availablePrograms.find(p => p.id === workout.programId);
      if (program) {
        workout.programName = program.name; // Добавляем название программы для отображения
      }
      
      // Если это тренировка из программы, загружаем детали тренировки
      // для получения упражнений
      if (workout.workoutId && (!workout.workout?.exercises || workout.workout.exercises.length === 0)) {
        console.log(`Загружаем детали тренировки для ${workout.workoutId}`);
        
        // Делаем асинхронный запрос для загрузки упражнений
        getWorkoutDetails(workout.workoutId)
          .then(details => {
            if (details && details.exercises && details.exercises.length > 0) {
              console.log(`Загружено ${details.exercises.length} упражнений для программной тренировки`);
              
              // Обновляем тренировку с загруженными упражнениями
              setSelectedScheduledWorkout(prevWorkout => {
                if (!prevWorkout) return prevWorkout;
                
                // Создаем модифицированную копию workout с упражнениями
                const updatedWorkout = {
                  ...prevWorkout,
                  workout: prevWorkout.workout 
                    ? {
                        ...prevWorkout.workout,
                        exercises: details.exercises
                      }
                    : {
                        id: details.id,
                        name: details.name,
                        description: details.description || "",
                        type: details.type,
                        duration: details.duration || 0,
                        calories: details.calories || 0,
                        exercises: details.exercises,
                        isPublic: details.isPublic || false,
                        createdBy: details.createdBy || "",
                        createdAt: details.createdAt || "",
                        userId: details.userId || ""
                      }
                };
                
                return updatedWorkout;
              });
            }
          })
          .catch(error => {
            console.error(`Ошибка при загрузке деталей тренировки: ${error}`);
          });
      }
    }
    
    setSelectedScheduledWorkout(workout);
    setShowWorkoutDetailDialog(true);
  }
  
  const viewWorkoutDetails = async (workoutId: string) => {
    try {
      // Находим запланированную тренировку по ID
      const scheduledWorkout = scheduledWorkouts.find(sw => sw.workoutId === workoutId)
      
      if (!scheduledWorkout) {
        toast({
          title: "Ошибка",
          description: "Запланированная тренировка не найдена",
          variant: "destructive"
        })
        return
      }
      
      // Открываем диалог с деталями запланированной тренировки
      setSelectedScheduledWorkout(scheduledWorkout)
      setShowWorkoutDetailDialog(true)
    } catch (error) {
      console.error("Ошибка при получении информации о тренировке:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию о тренировке",
        variant: "destructive"
      })
    }
  }
  
  const markWorkoutCompleted = async (workout: ScheduledWorkout) => {
    try {
      // Если уже идет процесс отметки выполнения, не позволяем повторного нажатия
      if (isCompletingWorkout) {
        return;
      }
      
      // Устанавливаем ID тренировки, которую отмечаем выполненной
      setIsCompletingWorkout(workout.id);
      
      // Если тренировка уже отмечена как выполненная, ничего не делаем
      if (workout.completed) {
        toast({
          title: "Информация",
          description: "Эта тренировка уже отмечена как выполненная",
        });
        setIsCompletingWorkout(null);
        return;
      }
      
      // Журналируем данные тренировки для отладки
      console.log(`Отмечаем тренировку как выполненную:`, {
        id: workout.id,
        name: workout.workout?.name,
        isProgramWorkout: !!workout.programId,
        programId: workout.programId || 'нет',
        programName: workout.programName || 'нет'
      });
      
      // Отмечаем тренировку как выполненную на сервере
      const response = await completeScheduledWorkout(workout.id);
      console.log('Ответ от сервера после отметки тренировки:', response);
      
      // Обновляем состояние в интерфейсе
      setScheduledWorkouts(prevWorkouts => 
        prevWorkouts.map(w => 
          w.id === workout.id ? { ...w, completed: true } : w
        )
      );
      
      toast({
        title: "Успех",
        description: "Тренировка отмечена как выполненная",
      });
      
      // Обновляем активные программы
      if (workout.programId) {
        console.log(`Обновляем прогресс программы ${workout.programId}`);
        try {
          const updatedPrograms = await getUserActivePrograms();
          console.log('Обновленные программы:', updatedPrograms);
          setActivePrograms(updatedPrograms);
        } catch (err) {
          console.error("Не удалось обновить активные программы после завершения тренировки:", err);
        }
      }
      
      // Закрываем диалог с деталями
      setShowWorkoutDetailDialog(false);
      
      // Обновляем данные календаря после завершения тренировки
      await refreshCalendarData();
    } catch (error) {
      console.error("Ошибка при отметке тренировки как выполненной:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отметить тренировку как выполненную",
        variant: "destructive"
      });
    } finally {
      // В любом случае снимаем блокировку
      setIsCompletingWorkout(null);
    }
  };
  
  const handleAddWorkout = async () => {
    try {
      if (!newScheduledWorkout.workoutId) {
        toast({
          title: "Ошибка",
          description: "Выберите тренировку для добавления",
          variant: "destructive"
        })
        return
      }
      
      const workout = availableWorkouts.find(w => w.id === newScheduledWorkout.workoutId)
      
      if (!workout) {
        toast({
          title: "Ошибка",
          description: "Выбранная тренировка не найдена",
          variant: "destructive"
        })
        return
      }
      
      // Создаем запланированную тренировку через API
      const scheduledWorkoutData = {
        workoutId: newScheduledWorkout.workoutId,
        scheduledDate: newScheduledWorkout.scheduledDate,
        scheduledTime: newScheduledWorkout.scheduledTime
      }
      
      const newWorkout = await createScheduledWorkout(scheduledWorkoutData)
      
      // После успешного создания обновляем данные календаря
      await refreshCalendarData()
      
      toast({
        title: "Тренировка добавлена",
        description: "Тренировка успешно добавлена в календарь"
      })
      
      // Сброс формы
      setNewScheduledWorkout({
        workoutId: "",
        scheduledDate: format(new Date(), "yyyy-MM-dd"),
        scheduledTime: "12:00"
      })
      
      setShowAddDialog(false)
    } catch (error) {
      console.error("Ошибка при добавлении тренировки:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить тренировку",
        variant: "destructive"
      })
    }
  }
  
  const handleAddProgram = async () => {
    try {
      if (!newProgramSchedule.programId) {
        toast({
          title: "Ошибка",
          description: "Выберите программу для добавления",
          variant: "destructive"
        })
        return
      }
      
      if (!selectedDate) {
        toast({
          title: "Ошибка",
          description: "Выберите дату начала программы",
          variant: "destructive"
        })
        return
      }
      
      const program = availablePrograms.find(p => p.id === newProgramSchedule.programId)
      
      if (!program) {
        toast({
          title: "Ошибка",
          description: "Выбранная программа не найдена",
          variant: "destructive"
        })
        return
      }
      
      // Создаем запланированные тренировки для программы
      const startDate = selectedDate
      const createdWorkouts: ScheduledWorkout[] = []
      
      // Сортируем тренировки по дням программы для гарантированного порядка
      const sortedWorkouts = [...program.workouts].sort((a, b) => a.dayOfProgram - b.dayOfProgram)
      
      console.log(`Добавляем программу ${program.name} с ${sortedWorkouts.length} тренировками, начиная с ${format(startDate, "yyyy-MM-dd")}`)
      
      for (const programWorkout of sortedWorkouts) {
        const workout = availableWorkouts.find(w => w.id === programWorkout.workoutId)
        if (!workout) {
          console.warn(`Тренировка с ID ${programWorkout.workoutId} не найдена`)
          continue
        }
        
        const workoutDate = addDays(startDate, programWorkout.dayOfProgram - 1)
        
        // Генерируем время в формате HH:MM в зависимости от timeOfDay
        let time = "12:00"
        if (programWorkout.timeOfDay === "утро") time = "08:00"
        else if (programWorkout.timeOfDay === "день") time = "14:00"
        else if (programWorkout.timeOfDay === "вечер") time = "19:00"
        
        // Создаем запланированную тренировку через API
        const scheduledWorkoutData = {
          workoutId: programWorkout.workoutId,
          scheduledDate: format(workoutDate, "yyyy-MM-dd"),
          scheduledTime: time,
          programId: program.id  // Обязательно передаем ID программы
        }
        
        console.log(`Добавляем тренировку программы: workoutId=${programWorkout.workoutId}, день=${programWorkout.dayOfProgram}, дата=${format(workoutDate, "yyyy-MM-dd")}, время=${time}`)
        
        try {
          const newWorkout = await createScheduledWorkout(scheduledWorkoutData)
          console.log(`Тренировка добавлена успешно: ID=${newWorkout.id}, programId=${newWorkout.programId || 'не установлен'}`)
          
          // Обогащаем данные для отображения в интерфейсе
          const enrichedWorkout: ScheduledWorkout = {
            ...newWorkout, 
            workout: workout,
            programName: program.name,
            programId: program.id  // Убеждаемся, что программа установлена
          }
          
          createdWorkouts.push(enrichedWorkout)
        } catch (err) {
          console.error(`Ошибка при добавлении тренировки из программы: ${err}`)
        }
      }
      
      // ВАЖНО: Активируем программу как активную через API startProgram
      try {
        const result = await startProgram({
          programId: program.id,
          startDate: format(startDate, "yyyy-MM-dd"),
          workoutIds: program.workouts.map(w => w.workoutId)
        })
        console.log(`Программа ${program.name} активирована успешно:`, result)
      } catch (err) {
        console.error(`Ошибка при активации программы: ${err}`)
        toast({
          title: "Предупреждение",
          description: "Тренировки добавлены, но не удалось активировать программу",
          variant: "destructive"
        })
      }
      
      // Обновляем список запланированных тренировок в текущем состоянии
      setScheduledWorkouts(prev => {
        // Добавляем новые тренировки, убедившись, что они имеют все необходимые свойства
        const updatedWorkouts = [...prev, ...createdWorkouts.map(workout => ({
          ...workout,
          programId: program.id,  // Гарантируем, что programId установлен
          programName: program.name
        }))]
        console.log(`Обновлено ${updatedWorkouts.length} тренировок в календаре`)
        return updatedWorkouts
      })
      
      // Обновляем активные программы
      try {
        const updatedPrograms = await getUserActivePrograms()
        setActivePrograms(updatedPrograms)
        console.log(`Обновлено ${updatedPrograms.length} активных программ`)
      } catch (err) {
        console.error(`Ошибка при обновлении активных программ: ${err}`)
      }
      
      // После добавления программы, обновляем данные календаря полностью
      await refreshCalendarData()
      
      toast({
        title: "Программа добавлена",
        description: `Программа "${program.name}" успешно добавлена в календарь`
      })
      
      // Закрываем диалог добавления программы
      setShowProgramDialog(false)
      
      // Сбрасываем форму
      setNewProgramSchedule({
        programId: "",
        startDate: format(new Date(), "yyyy-MM-dd")
      })
      
      setSelectedDate(undefined)
    } catch (error) {
      console.error("Ошибка при добавлении программы:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить программу тренировок",
        variant: "destructive"
      })
    }
  }
  
  // Выделяем обновление календаря в отдельную функцию, которую можно использовать повторно
  const refreshCalendarData = async () => {
    try {
      setIsLoading(true)
      
      // Используем текущую дату из состояния компонента
      const currentMonth = currentDate;
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      console.log(`Обновление календаря для месяца: ${format(currentMonth, "MMMM yyyy")}`)
      console.log(`Запрашиваем данные с ${format(startOfMonth, "yyyy-MM-dd")} по ${format(endOfMonth, "yyyy-MM-dd")}`)
      
      // Сначала получаем активные программы для синхронизации данных
      let userPrograms: ProgramProgress[] = []
      try {
        userPrograms = await getUserActivePrograms()
        setActivePrograms(userPrograms)
        console.log(`Активных программ: ${userPrograms.length}`)
        
        // Выведем первые несколько программ для отладки
        if (userPrograms.length > 0) {
          console.log("Пример активных программ:", userPrograms.slice(0, 1))
          console.log("Первая программа содержит тренировок:", userPrograms[0]?.workouts?.length || 0)
        }
      } catch (err) {
        console.error("Ошибка при загрузке активных программ:", err)
        // Продолжаем с теми данными, что уже есть в состоянии
        userPrograms = activePrograms
      }
      
      // Затем получаем запланированные тренировки в выбранном месяце
      let refreshedWorkouts: ScheduledWorkout[] = []
      try {
        refreshedWorkouts = await getScheduledWorkoutsByDateRange(
          format(startOfMonth, "yyyy-MM-dd"),
          format(endOfMonth, "yyyy-MM-dd")
        )
        console.log(`Получено ${refreshedWorkouts.length} запланированных тренировок`)
        
        // Выведем первые несколько тренировок для отладки
        if (refreshedWorkouts.length > 0) {
          console.log("Пример полученных тренировок:", refreshedWorkouts.slice(0, 2))
          
          // Подробно выведем информацию о тренировках, которые принадлежат программам
          const programWorkouts = refreshedWorkouts.filter(w => w.programId);
          console.log(`Из них ${programWorkouts.length} тренировок принадлежат программам`);
          
          if (programWorkouts.length > 0) {
            console.log("Пример тренировок из программ:", 
              programWorkouts.slice(0, 2).map(w => ({ 
                id: w.id, 
                workoutId: w.workoutId, 
                programId: w.programId,
                scheduledDate: w.scheduledDate
              }))
            );
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке запланированных тренировок:", err)
        toast({
          title: "Предупреждение",
          description: "Не удалось загрузить все запланированные тренировки",
          variant: "default"
        })
        refreshedWorkouts = [] // Если произошла ошибка, используем пустой массив
      }
      
      // Получаем детали всех тренировок
      let workoutsDetails: Workout[] = []
      try {
        workoutsDetails = await getAllWorkouts()
      } catch (err) {
        console.error("Ошибка при загрузке деталей тренировок:", err)
        workoutsDetails = availableWorkouts
      }
      
      // Обогащаем данные информацией о тренировках и программах
      const enrichedWorkouts = refreshedWorkouts.map(workout => {
        // Найдем детали тренировки
        const workoutDetails = workoutsDetails.find(w => w.id === workout.workoutId) || 
                             availableWorkouts.find(w => w.id === workout.workoutId)
        
        // Если тренировка принадлежит программе, найдем информацию о программе
        if (workout.programId) {
          console.log(`Тренировка ${workout.id} принадлежит программе ${workout.programId}`)
          
          // Поищем в активных программах пользователя
          const relatedProgram = userPrograms.find(p => p.programId === workout.programId)
          if (relatedProgram) {
            workout.programName = relatedProgram.program?.name
            console.log(`Нашли связанную программу: ${relatedProgram.program?.name}`)
            
            // Проверяем, является ли тренировка выполненной в рамках программы
            const programWorkout = relatedProgram.workouts?.find(w => w.scheduledWorkoutId === workout.id)
            if (programWorkout) {
              workout.completed = programWorkout.completed
              console.log(`Статус тренировки из программы: ${workout.completed ? 'выполнена' : 'не выполнена'}`)
            }
          } else {
            // Если не нашли в активных, поищем в доступных программах
            const program = availablePrograms.find(p => p.id === workout.programId)
            if (program) {
              workout.programName = program.name
              console.log(`Нашли программу в доступных: ${program.name}`)
            } else {
              console.warn(`Не найдена программа с ID ${workout.programId}`)
              
              // В случае, если программа не найдена, но programId есть, добавим временное имя
              workout.programName = "Программа тренировок"
            }
          }
        }
        
        if (workoutDetails) {
          workout.workout = workoutDetails
        } else if (!workout.workout) {
          console.warn(`Не найдена тренировка с ID ${workout.workoutId}. Попытка загрузить напрямую.`)
          
          // Попробуем загрузить тренировку напрямую
          getWorkout(workout.workoutId)
            .then((detailedWorkout: Workout) => {
              // Обновляем workout в конкретной тренировке после загрузки
              setScheduledWorkouts(prevWorkouts => 
                prevWorkouts.map(w => 
                  w.id === workout.id ? { ...w, workout: detailedWorkout } : w
                )
              )
            })
            .catch((error: Error) => {
              console.error(`Не удалось загрузить детали тренировки ${workout.workoutId}:`, error)
            })
        }
        
        return workout
      })
      
      // Сортируем тренировки по дате и времени
      const sortedWorkouts = enrichedWorkouts.sort((a, b) => {
        // Сначала сравниваем по дате
        if (a.scheduledDate !== b.scheduledDate) {
          return a.scheduledDate.localeCompare(b.scheduledDate)
        }
        // Если даты равны, сравниваем по времени
        return a.scheduledTime.localeCompare(b.scheduledTime)
      })
      
      setScheduledWorkouts(sortedWorkouts)
      console.log(`Обновлено ${sortedWorkouts.length} тренировок в календаре`)
      
      // Выводим итоговую статистику для отладки
      const finalProgramWorkouts = sortedWorkouts.filter(w => w.programId);
      console.log(`Итого тренировок из программ: ${finalProgramWorkouts.length} из ${sortedWorkouts.length}`);
    } catch (error) {
      console.error("Ошибка обновления данных календаря:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные календаря",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const openAddDialog = (date: Date) => {
    setSelectedDate(date)
    
    // Обновляем дату для одиночной тренировки
    setNewScheduledWorkout(prev => ({
      ...prev,
      scheduledDate: format(date, "yyyy-MM-dd")
    }))
    
    // Обновляем дату начала для программы
    setNewProgramSchedule(prev => ({
      ...prev,
      startDate: format(date, "yyyy-MM-dd")
    }))
    
    setShowAddDialog(true)
  }

  // Функция для получения прогресса программы и отображения деталей
  const openProgramDetails = async (programId: string) => {
    try {
      console.log(`Открываем детали программы: ${programId}`)
      // Находим программу в списке активных программ
      const program = activePrograms.find(p => p.programId === programId || p.id === programId)
      
      if (!program) {
        console.error(`Не найдена активная программа с ID ${programId}`)
        toast({
          title: "Ошибка",
          description: "Не удалось найти данные о программе тренировок",
          variant: "destructive"
        })
        return
      }
      
      // Обогащаем данные программы
      try {
        // Получаем актуальный прогресс программы
        const progress = await getProgramProgress(programId)
        
        if (progress) {
          console.log(`Получен прогресс программы:`, progress)
          setSelectedProgram({
            ...program,
            ...progress
          })
        } else {
          console.log(`Используем данные из активных программ`)
          setSelectedProgram(program)
        }
      } catch (err) {
        console.error(`Ошибка при получении прогресса программы: ${err}`)
        setSelectedProgram(program)
      }
      
      setShowProgramDetailsDialog(true)
    } catch (error) {
      console.error("Ошибка при открытии деталей программы:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось открыть детали программы",
        variant: "destructive"
      })
    }
  }
  
  // Функция для завершения программы тренировок
  const handleCompleteProgram = async (programId: string) => {
    try {
      setIsCompletingProgram(programId)
      
      // Проверяем, все ли тренировки программы выполнены
      const program = activePrograms.find(p => p.programId === programId)
      
      if (!program) {
        toast({
          title: "Ошибка",
          description: "Программа не найдена",
          variant: "destructive"
        })
        return
      }
      
      // Проверяем, есть ли тренировки в программе
      if (!program.workouts || program.workouts.length === 0) {
        toast({
          title: "Ошибка",
          description: "В программе нет тренировок или данные повреждены",
          variant: "destructive"
        })
        return
      }
      
      // Проверяем, все ли тренировки выполнены
      const allWorkoutsCompleted = program.workouts.every(w => w.completed === true)
      
      if (!allWorkoutsCompleted) {
        toast({
          title: "Невозможно завершить программу",
          description: "Для завершения программы необходимо выполнить все тренировки",
          variant: "destructive"
        })
        return
      }
      
      // Отправляем запрос на завершение программы
      try {
        await completeProgram(programId)
        
        // Обновляем данные календаря и список активных программ
        await refreshCalendarData()
        
        // Закрываем диалог с деталями программы
        setShowProgramDetailsDialog(false)
        
        toast({
          title: "Программа завершена",
          description: "Программа тренировок успешно завершена!",
          variant: "default"
        })
      } catch (err) {
        console.error("Ошибка при запросе завершения программы:", err)
        toast({
          title: "Ошибка",
          description: "Не удалось завершить программу тренировок. Попробуйте позже.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Ошибка при завершении программы:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось завершить программу тренировок",
        variant: "destructive"
      })
    } finally {
      setIsCompletingProgram(null)
    }
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
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Календарь тренировок</h1>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={navigatePrevious}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="text-xl font-medium">
              {format(currentDate, 'LLLL yyyy', { locale: ru })}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarViewType)}>
              <TabsList>
                <TabsTrigger value="month">Месяц</TabsTrigger>
                <TabsTrigger value="week">Неделя</TabsTrigger>
                <TabsTrigger value="day">День</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Отображение активных программ пользователя */}
        {activePrograms.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Активные программы тренировок
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {activePrograms.map((program) => (
                <div 
                  key={program.programId || program.id} 
                  className="bg-white dark:bg-gray-800 rounded-md border p-3 cursor-pointer hover:border-purple-400 transition-colors"
                  onClick={() => openProgramDetails(program.programId || program.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm truncate flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span>{program.program?.name || "Программа тренировок"}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                      {program.workouts?.filter(w => w.completed).length || 0}/{program.workouts?.length || 0}
                    </Badge>
                  </div>
                  <Progress 
                    value={program.completionPercentage ?? 0} 
                    className="h-2 bg-purple-100 dark:bg-purple-900/20"
                  />
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>Прогресс: {Math.round(program.completionPercentage || 0)}%</span>
                    {(program.completionPercentage === 100 || program.isCompleted) ? (
                      <Badge variant="default" className="bg-green-500">Завершено</Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Активно</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Показываем первые 2 тренировки программы */}
                  {program.workouts && program.workouts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed">
                      <div className="text-xs text-muted-foreground mb-1">Ближайшие тренировки:</div>
                      <div className="space-y-1">
                        {program.workouts
                          .filter(w => !w.completed)
                          .slice(0, 2)
                          .map((pw, idx) => {
                            // Найдем тренировку в списке запланированных
                            const scheduledWorkout = scheduledWorkouts.find(sw => sw.id === pw.scheduledWorkoutId);
                            if (!scheduledWorkout) return null;
                            
                            return (
                              <div 
                                key={idx} 
                                className="text-xs flex justify-between p-1 rounded bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/20 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWorkoutDetail(scheduledWorkout);
                                }}
                              >
                                <div className="flex items-center gap-1 truncate">
                                  <Dumbbell className="h-3 w-3 text-purple-500" />
                                  <span className="truncate">{scheduledWorkout.workout?.name || "Тренировка"}</span>
                                </div>
                                <div className="text-purple-600">
                                  {scheduledWorkout.scheduledDate && format(parseISO(scheduledWorkout.scheduledDate), "dd.MM")}
                                </div>
                              </div>
                            );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Card className="border">
          <CardContent className="p-0">
            {view === "month" && (
              <div className="bg-white dark:bg-background">
                {/* Заголовок с днями недели */}
                <div className="grid grid-cols-7 border-b">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => (
                    <div key={day} className={`
                      p-2 text-center text-sm font-medium 
                      ${index >= 5 ? 'text-red-500' : ''}
                    `}>
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Сетка календаря */}
                <div className="grid grid-cols-7 auto-rows-fr">
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, index) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1);
                    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Преобразуем 0 (воскресенье) в 7
                    const isToday = isSameDay(date, new Date());
                    const workouts = getWorkoutsForDate(date);
                    
                    // В первую неделю добавляем отступ для дней из предыдущего месяца
                    if (index === 0 && dayOfWeek > 1) {
                      return (
                        <React.Fragment key={`empty-${index}`}>
                          {Array.from({ length: dayOfWeek - 1 }).map((_, i) => (
                            <div key={`empty-${i}`} className="border-b border-r p-2 bg-gray-50 dark:bg-gray-900/20"></div>
                          ))}
                          <div 
                            key={date.toISOString()}
                            className={`
                              min-h-[120px] border-b border-r p-2 
                              ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} 
                              ${dayOfWeek >= 6 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                              hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                            `}
                          >
                            <div className="flex justify-between items-start">
                              <div className={`
                                flex items-center justify-center w-6 h-6 rounded-full 
                                ${isToday ? 'bg-blue-500 text-white' : 'text-muted-foreground'}
                              `}>
                                {date.getDate()}
                              </div>
                              
                              {workouts.length > 0 && (
                                <Badge className="bg-primary">{workouts.length}</Badge>
                              )}
                            </div>
                            
                            <div className="mt-2 space-y-1 max-h-[80px] overflow-auto">
                              {workouts.map((workout) => (
                                <div 
                                  key={workout.id}
                                  className={`
                                    text-xs p-1 rounded-md
                                    ${workout.completed 
                                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 opacity-70 cursor-default' 
                                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/30'
                                    }
                                    ${workout.programId ? 'border-l-4 border-purple-500 pl-2 bg-purple-50 dark:bg-purple-900/20' : ''}
                                  `}
                                  onClick={(e) => {
                                    if (workout.completed) return; // Выполненные тренировки не кликабельны
                                    e.stopPropagation();
                                    openWorkoutDetail(workout);
                                  }}
                                  title={workout.completed ? "Тренировка выполнена" : `Открыть детали: ${workout.workout?.name}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1 truncate">
                                      {workout.programId && (
                                        <CalendarDays className="h-3 w-3 text-purple-600 flex-shrink-0" />
                                      )}
                                      <span className={`font-medium truncate ${workout.programId ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                                        {workout.scheduledTime?.substring(0, 5)} {workout.workout?.name || "Тренировка"}
                                      </span>
                                    </div>
                                    {workout.programId && !workout.completed && (
                                      <div 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markWorkoutCompleted(workout);
                                        }}
                                        className="ml-1 cursor-pointer hover:bg-primary/10 p-0.5 rounded"
                                        title="Отметить выполненной"
                                      >
                                        <Check className="h-3 w-3 text-primary hover:text-green-600" />
                                      </div>
                                    )}
                                  </div>
                                  {workout.programName && (
                                    <div className="text-[9px] text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                                      {workout.programName}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <div 
                        key={date.toISOString()}
                        className={`
                          min-h-[120px] border-b border-r p-2 
                          ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''} 
                          ${dayOfWeek >= 6 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}
                          hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-full 
                            ${isToday ? 'bg-blue-500 text-white' : 'text-muted-foreground'}
                          `}>
                            {date.getDate()}
                          </div>
                          
                          {workouts.length > 0 && (
                            <Badge className="bg-primary">{workouts.length}</Badge>
                          )}
                        </div>
                        
                        <div className="mt-2 space-y-1 max-h-[80px] overflow-auto">
                          {workouts.map((workout) => (
                            <div 
                              key={workout.id}
                              className={`
                                text-xs p-1 rounded-md
                                ${workout.completed 
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 opacity-70 cursor-default' 
                                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/30'
                                }
                                ${workout.programId ? 'border-l-4 border-purple-500 pl-2 bg-purple-50 dark:bg-purple-900/20' : ''}
                              `}
                              onClick={(e) => {
                                if (workout.completed) return; // Выполненные тренировки не кликабельны
                                e.stopPropagation();
                                openWorkoutDetail(workout);
                              }}
                              title={workout.completed ? "Тренировка выполнена" : `Открыть детали: ${workout.workout?.name}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 truncate">
                                  {workout.programId && (
                                    <CalendarDays className="h-3 w-3 text-purple-600 flex-shrink-0" />
                                  )}
                                  <span className={`font-medium truncate ${workout.programId ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                                    {workout.scheduledTime?.substring(0, 5)} {workout.workout?.name || "Тренировка"}
                                  </span>
                                </div>
                                {workout.programId && !workout.completed && (
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markWorkoutCompleted(workout);
                                    }}
                                    className="ml-1 cursor-pointer hover:bg-primary/10 p-0.5 rounded"
                                    title="Отметить выполненной"
                                  >
                                    <Check className="h-3 w-3 text-primary hover:text-green-600" />
                                  </div>
                                )}
                              </div>
                              {workout.programName && (
                                <div className="text-[9px] text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                                  {workout.programName}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {view === "week" && (
              <div className="space-y-3 p-4">
                {eachDayOfInterval({
                  start: startOfWeek(currentDate, { locale: ru }),
                  end: endOfWeek(currentDate, { locale: ru })
                }).map((date) => {
                  const dayWorkouts = getWorkoutsForDate(date)
                  
                  return (
                    <div key={date.toString()} className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-3 flex justify-between items-center">
                        <div className="font-medium">
                          {format(date, "EEEE, d MMMM", { locale: ru })}
                        </div>
                      </div>
                      
                      <div className="p-3 divide-y">
                        {dayWorkouts.length === 0 ? (
                          <div className="py-8 text-center text-muted-foreground">
                            Нет запланированных тренировок
                          </div>
                        ) : (
                          dayWorkouts.map((workout) => (
                            <div 
                              key={workout.id} 
                              className={`
                                py-2 px-2 rounded-md 
                                ${workout.completed 
                                  ? 'opacity-70 cursor-default bg-green-50 dark:bg-green-900/10'
                                  : 'cursor-pointer hover:bg-muted'
                                }
                              `}
                              onClick={() => {
                                if (workout.completed) return; // Выполненные тренировки не кликабельны
                                openWorkoutDetail(workout);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded-full ${workout.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    <Dumbbell className={`h-4 w-4 ${workout.completed ? 'text-green-600' : 'text-blue-600'}`} />
                                  </div>
                                  <div className="font-medium">
                                    {workout.workout?.name || "Тренировка"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{workout.scheduledTime || ""}</span>
                                  </div>
                                  {workout.completed && (
                                    <div className="text-green-600 flex items-center gap-1">
                                      <Check className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {view === "day" && (
              <div className="space-y-3 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {format(currentDate, "EEEE, d MMMM", { locale: ru })}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {(() => {
                    const dayWorkouts = getWorkoutsForDate(currentDate)
                    
                    if (dayWorkouts.length === 0) {
                      return (
                        <div className="py-12 text-center text-muted-foreground">
                          Нет запланированных тренировок на этот день
                        </div>
                      )
                    }
                    
                    return dayWorkouts
                      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                      .map((workout) => (
                        <div
                          key={workout.id}
                          className={`
                            border rounded-md p-4 
                            ${workout.completed 
                              ? 'border-green-300 bg-green-50/50 dark:bg-green-900/10 opacity-75 cursor-default'
                              : 'hover:border-primary cursor-pointer'
                            }
                          `}
                          onClick={() => {
                            if (workout.completed) return; // Выполненные тренировки не кликабельны
                            openWorkoutDetail(workout);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-full ${workout.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                                  <Dumbbell className={`h-4 w-4 ${workout.completed ? 'text-green-600' : 'text-blue-600'}`} />
                                </div>
                                <div className="font-medium text-lg">
                                  {workout.workout?.name || "Тренировка"}
                                </div>
                              </div>
                              <p className="text-muted-foreground text-sm">
                                                                {workout.workout?.description || ""}                              </p>                              <div className="flex items-center gap-4 text-sm">                                <div className="ml-auto text-muted-foreground text-xs flex items-center gap-1">                                  <div className="flex items-center gap-1">                                    <Clock className="h-3 w-3" />                                    <span>{workout.workout?.durationMinutes || workout.workout?.duration || 0} мин</span>                                  </div>                                  <div className="ml-2">                                    {workout.workout?.type || ""}                                  </div>                                </div>                              </div>                              </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{workout.scheduledTime || ""}</span>
                              </div>
                              {workout.completed ? (
                                <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                                  Выполнено
                                </Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  disabled={isCompletingWorkout === workout.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markWorkoutCompleted(workout)
                                  }}
                                >
                                  {isCompletingWorkout === workout.id ? (
                                    <>
                                      <span className="animate-spin h-3 w-3 mr-1 border-2 border-primary border-t-transparent rounded-full"></span>
                                      Сохранение...
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-3 w-3 mr-1" />
                                      Отметить выполненной
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Диалог с деталями тренировки */}
      <Dialog 
        open={showWorkoutDetailDialog} 
        onOpenChange={setShowWorkoutDetailDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {selectedScheduledWorkout && (
              <>
                <DialogTitle className="flex items-center gap-2">
                  {selectedScheduledWorkout.programId && (
                    <CalendarDays className="h-5 w-5 text-purple-500" />
                  )}
                  <div>
                    {selectedScheduledWorkout.workout?.name || "Тренировка"}
                    {selectedScheduledWorkout.completed && (
                      <Badge className="ml-2 bg-green-500">Выполнено</Badge>
                    )}
                  </div>
                </DialogTitle>
                {selectedScheduledWorkout.programId && selectedScheduledWorkout.programName && (
                  <div className="flex flex-col text-purple-600 dark:text-purple-400 mt-1 space-y-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">Часть программы: <span className="font-medium">{selectedScheduledWorkout.programName}</span></span>
                    </div>
                    {selectedScheduledWorkout.programId && (() => {
                      const program = availablePrograms.find(p => p.id === selectedScheduledWorkout.programId)
                      if (!program) return null;
                      
                      // Найдем, какой день программы это
                      const programWorkout = program.workouts.find(
                        pw => pw.workoutId === selectedScheduledWorkout.workoutId
                      )
                      
                      if (!programWorkout) return null;
                      
                      const dayOfProgram = programWorkout.dayOfProgram;
                      const totalDays = program.workouts.length;
                      
                      return (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-300 text-purple-700 dark:text-purple-300">
                            День {dayOfProgram} из {totalDays}
                          </Badge>
                          <Progress 
                            value={(dayOfProgram / totalDays) * 100} 
                            className="h-2 w-24 bg-purple-100 dark:bg-purple-900/20"
                          />
                          <span className="text-xs font-medium">
                            {Math.round((dayOfProgram / totalDays) * 100)}%
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
                <DialogDescription className="mt-2">
                  Дата: {format(parseISO(selectedScheduledWorkout.scheduledDate), "d MMMM yyyy", { locale: ru })} в {selectedScheduledWorkout.scheduledTime || ""}
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {selectedScheduledWorkout && (
              <>
                <p className="text-sm">{selectedScheduledWorkout.workout?.description || ""}</p>
                
                <div className="grid grid-cols-3 gap-4 py-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs">Тип</span>
                    <div className="font-medium">
                      {selectedScheduledWorkout.workout?.type 
                        ? WORKOUT_TYPE_REVERSE_MAP[selectedScheduledWorkout.workout.type] || "Пользовательская" 
                        : "Не указан"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs">Длительность</span>
                    <div className="font-medium">{selectedScheduledWorkout.workout?.durationMinutes || selectedScheduledWorkout.workout?.duration || 0} мин</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs">Калории</span>
                    <div className="font-medium">{selectedScheduledWorkout.workout?.caloriesBurned || selectedScheduledWorkout.workout?.calories || 0} ккал</div>
                  </div>
                </div>
                
                {selectedScheduledWorkout.workout?.exercises && selectedScheduledWorkout.workout.exercises.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Упражнения:</h4>
                    <div className="space-y-2">
                      {selectedScheduledWorkout.workout.exercises.map((exercise, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-muted rounded-md">
                          <div className="w-full">
                            <div className="font-medium">{exercise.exercise?.name || "Упражнение"}</div>
                            <div className="text-sm text-muted-foreground">
                              {exercise.sets} подх. × {exercise.reps} повт.
                              {exercise.weight ? ` × ${exercise.weight} кг` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter className="flex items-center gap-2">
            {selectedScheduledWorkout && !selectedScheduledWorkout.completed && (
              <Button 
                onClick={() => markWorkoutCompleted(selectedScheduledWorkout)}
                disabled={isCompletingWorkout === selectedScheduledWorkout.id}
              >
                {isCompletingWorkout === selectedScheduledWorkout.id ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Отметить выполненной
                  </>
                )}
              </Button>
            )}
            {selectedScheduledWorkout && (
              <Button 
                variant="destructive"
                onClick={async () => {
                  try {
                    await deleteScheduledWorkout(selectedScheduledWorkout.id)
                    
                    // Обновляем данные календаря после удаления тренировки
                    await refreshCalendarData()
                    
                    setShowWorkoutDetailDialog(false)
                    toast({
                      title: "Тренировка удалена",
                      description: "Тренировка успешно удалена из календаря"
                    })
                  } catch (error) {
                    console.error("Ошибка при удалении тренировки:", error)
                    toast({
                      title: "Ошибка",
                      description: "Не удалось удалить тренировку",
                      variant: "destructive"
                    })
                  }
                }}
              >
                Удалить
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления тренировки или программы */}
      <Dialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить в календарь</DialogTitle>
            <DialogDescription>
              {selectedDate && `Дата: ${format(selectedDate, "d MMMM yyyy", { locale: ru })}`}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="workout" className="mt-4">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="workout">Одиночная тренировка</TabsTrigger>
              <TabsTrigger value="program">Программа тренировок</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workout" className="space-y-4 pt-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workoutId">Выберите тренировку</Label>
                  <Select 
                    value={newScheduledWorkout.workoutId}
                    onValueChange={value => 
                      setNewScheduledWorkout(prev => ({...prev, workoutId: value}))
                    }
                  >
                    <SelectTrigger id="workoutId" className="mt-1.5">
                      <SelectValue placeholder="Выберите тренировку" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkouts.map(workout => (
                        <SelectItem key={workout.id} value={workout.id}>
                          {workout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Время</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={newScheduledWorkout.scheduledTime}
                    onChange={e => 
                      setNewScheduledWorkout(prev => ({...prev, scheduledTime: e.target.value}))
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddWorkout}>
                  Добавить тренировку
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="program" className="space-y-4 pt-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="programId">Выберите программу тренировок</Label>
                  <Select 
                    value={newProgramSchedule.programId}
                    onValueChange={value => 
                      setNewProgramSchedule(prev => ({...prev, programId: value}))
                    }
                  >
                    <SelectTrigger id="programId" className="mt-1.5">
                      <SelectValue placeholder="Выберите программу тренировок" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrograms.map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-date">Дата начала программы</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1.5",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: ru })
                        ) : (
                          <span>Выберите дату</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date || undefined);
                          if (date) {
                            setNewProgramSchedule(prev => ({
                              ...prev,
                              startDate: format(date, "yyyy-MM-dd")
                            }));
                          }
                        }}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="text-xs text-muted-foreground mt-1">
                    Программа будет добавлена в календарь, начиная с выбранной даты
                  </div>
                </div>
                
                {newProgramSchedule.programId && (
                  <div className="rounded-md border p-3 bg-muted/50">
                    <h3 className="font-medium mb-1">Информация о программе:</h3>
                    {(() => {
                      const program = availablePrograms.find(p => p.id === newProgramSchedule.programId)
                      if (!program) return <p className="text-sm text-muted-foreground">Информация не найдена</p>
                      
                      return (
                        <div className="space-y-2 text-sm">
                          <p>{program.description}</p>
                          <p><span className="font-medium">Длительность программы:</span> {program.duration} дней</p>
                          <p><span className="font-medium">Количество тренировок:</span> {program.workouts.length}</p>
                          <div>
                            <p className="font-medium mb-1">Расписание тренировок:</p>
                            <div className="space-y-1 max-h-[150px] overflow-y-auto">
                              {program.workouts.map((workout, index) => {
                                const workoutData = availableWorkouts.find(w => w.id === workout.workoutId)
                                const workoutDate = selectedDate ? addDays(selectedDate, workout.dayOfProgram - 1) : new Date()
                                
                                return (
                                  <div key={index} className="flex justify-between py-1 border-b border-dashed border-gray-200 last:border-0">
                                    <div className="flex items-center space-x-1">
                                      <CalendarDays className="h-3 w-3 text-purple-500" />
                                      <span className="text-xs">День {workout.dayOfProgram}: {workoutData?.name || "Тренировка"}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {format(workoutDate, "d MMM", { locale: ru })}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddProgram} disabled={!newProgramSchedule.programId}>
                  Добавить программу
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
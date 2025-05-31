"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { getAllPrograms, startProgram as startProgramService, createProgram } from "@/services/programs"
import { getAllWorkouts, getPublicWorkouts } from "@/services/workouts"
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Clock, Plus, Trash, Dumbbell, CalendarDays, Check, Edit } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Workout, TrainingProgram } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Моковые данные для примера
const MOCK_WORKOUTS = [
  {
    id: "1",
    name: "Утренняя пробежка",
    description: "Легкая кардио тренировка для утра",
    type: "Кардио",
    difficulty: "начинающий",
    duration: 30,
    calories: 300,
    isPublic: true,
    createdBy: "system",
    createdAt: "2023-05-10",
    exercises: [
      {
        id: "1-1",
        exerciseId: "e1",
        exercise: {
          id: "e1",
          name: "Бег",
          description: "Бег в среднем темпе",
          muscleGroup: "ноги",
          difficulty: "начинающий",
        },
        sets: 1,
        reps: 1,
        duration: 20,
      }
    ]
  },
  {
    id: "2",
    name: "Силовая тренировка",
    description: "Базовые упражнения для всего тела",
    type: "Силовая",
    difficulty: "средний",
    duration: 60,
    calories: 450,
    isPublic: true,
    createdBy: "system",
    createdAt: "2023-05-12",
    exercises: [
      {
        id: "2-1",
        exerciseId: "e3",
        exercise: {
          id: "e3",
          name: "Приседания",
          description: "Приседания со штангой",
          muscleGroup: "ноги",
          difficulty: "средний",
        },
        sets: 4,
        reps: 10,
        weight: 60,
      }
    ]
  }
]

const MOCK_PROGRAMS: TrainingProgram[] = [
  // Программы были удалены
]

export default function ProgramsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([])
  const [publicWorkouts, setPublicWorkouts] = useState<Workout[]>([])
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showProgramDetailDialog, setShowProgramDetailDialog] = useState(false)
  const [showStartProgramDialog, setShowStartProgramDialog] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "my" | "public">("all")

  // Состояние для новой программы
  const [newProgram, setNewProgram] = useState({
    name: "",
    description: "",
    duration: 7,
    isPublic: false,
    workouts: [] as {
      workoutId: string;
      dayOfProgram: number;
      timeOfDay: string;
    }[]
  })

  // Состояние для добавления тренировки в программу
  const [workoutToAdd, setWorkoutToAdd] = useState({
    workoutId: "",
    dayOfProgram: 1,
    timeOfDay: "утро"
  })

  // Константы
  const TIME_OF_DAY_OPTIONS = ["утро", "день", "вечер"]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchWorkouts()
      fetchPrograms()
    }
  }, [user])

  const fetchWorkouts = async () => {
    try {
      setIsLoading(true)
      // Получаем тренировки пользователя
      const userWorkoutsData = await getAllWorkouts()
      setUserWorkouts(userWorkoutsData)
      
      // Получаем общедоступные тренировки
      const publicWorkoutsData = await getPublicWorkouts()
      setPublicWorkouts(publicWorkoutsData)
      
      setIsLoading(false)
    } catch (error) {
      console.error("Ошибка при загрузке тренировок:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить тренировки",
        variant: "destructive"
      })
      
      // Используем моковые данные как запасной вариант
   
      setIsLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      // Получаем программы пользователя
      const programsData = await getAllPrograms()
      setPrograms(programsData)
    } catch (error) {
      console.error("Ошибка при загрузке программ:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить программы тренировок",
        variant: "destructive"
      })
      
      // Используем моковые данные как запасной вариант
      setPrograms(MOCK_PROGRAMS)
    }
  }

  const handleAddWorkoutToProgram = () => {
    if (!workoutToAdd.workoutId) {
      toast({
        title: "Ошибка",
        description: "Выберите тренировку",
        variant: "destructive"
      })
      return
    }

    // Проверяем, не превышает ли день программы длительность программы
    if (workoutToAdd.dayOfProgram > newProgram.duration) {
      toast({
        title: "Ошибка",
        description: `День тренировки не может превышать длительность программы (${newProgram.duration} дней)`,
        variant: "destructive"
      })
      return
    }

    // Добавляем тренировку в программу
    setNewProgram(prev => ({
      ...prev,
      workouts: [...prev.workouts, { ...workoutToAdd }]
    }))

    // Сбрасываем форму добавления
    setWorkoutToAdd({
      workoutId: "",
      dayOfProgram: Math.min(workoutToAdd.dayOfProgram + 1, newProgram.duration),
      timeOfDay: "утро"
    })
  }

  const removeWorkoutFromProgram = (index: number) => {
    setNewProgram(prev => ({
      ...prev,
      workouts: prev.workouts.filter((_, i) => i !== index)
    }))
  }

  const getWorkoutById = (id: string): Workout | undefined => {
    return [...userWorkouts, ...publicWorkouts].find(w => w.id === id)
  }

  const getFilteredPrograms = () => {
    if (activeTab === "all") return programs
    if (activeTab === "my") return programs.filter(p => !p.isPublic)
    if (activeTab === "public") return programs.filter(p => p.isPublic)
    return programs
  }

  const handleCreateProgram = async () => {
    try {
      if (!newProgram.name) {
        toast({
          title: "Ошибка",
          description: "Введите название программы",
          variant: "destructive"
        })
        return
      }

      if (newProgram.workouts.length === 0) {
        toast({
          title: "Ошибка",
          description: "Добавьте хотя бы одну тренировку в программу",
          variant: "destructive"
        })
        return
      }

      // Создаем программу
      await createProgram({
        name: newProgram.name,
        description: newProgram.description,
        duration: newProgram.duration,
        workouts: newProgram.workouts,
        isPublic: newProgram.isPublic,
        createdBy: user?.id || ""
      })

      toast({
        title: "Успех",
        description: "Программа тренировок успешно создана"
      })

      // Обновляем список программ
      await fetchPrograms()

      // Сбрасываем форму
      setNewProgram({
        name: "",
        description: "",
        duration: 7,
        isPublic: false,
        workouts: []
      })

      // Закрываем диалог
      setShowAddDialog(false)
    } catch (error) {
      console.error("Ошибка при создании программы:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось создать программу тренировок",
        variant: "destructive"
      })
    }
  }

  const openProgramDetail = (program: TrainingProgram) => {
    setSelectedProgram(program)
    setShowProgramDetailDialog(true)
  }

  const prepareStartProgram = (program: TrainingProgram) => {
    setSelectedProgram(program)
    setSelectedWorkouts(program.workouts.map(w => w.workoutId))
    setShowStartProgramDialog(true)
  }

  const handleStartProgram = async () => {
    try {
      if (!selectedProgram) return
      if (selectedWorkouts.length === 0) {
        toast({
          title: "Ошибка",
          description: "Выберите хотя бы одну тренировку",
          variant: "destructive"
        })
        return
      }

      console.log("Начинаем запуск программы:", selectedProgram.name);
      console.log("ID программы:", selectedProgram.id);
      console.log("Выбранные тренировки:", selectedWorkouts.length);
      console.log("Дата начала:", format(selectedDate, "yyyy-MM-dd"));

      // Запускаем программу
      const result = await startProgramService({
        programId: selectedProgram.id,
        startDate: format(selectedDate, "yyyy-MM-dd"),
        workoutIds: selectedWorkouts
      })

      console.log("Результат запуска программы:", result);
      
      if (result && result.success) {
        console.log(`Запланировано ${result.scheduledWorkouts?.length || 0} тренировок`);
        
        if (result.scheduledWorkouts && result.scheduledWorkouts.length > 0) {
          console.log("Примеры запланированных тренировок:",
            // @ts-ignore
            result.scheduledWorkouts.slice(0, 2).map(w => ({
              id: w.id,
              programId: w.programId,
              scheduledDate: w.scheduledDate
            }))
          );
        }
      }

      toast({
        title: "Успех",
        description: "Программа тренировок успешно запланирована"
      })

      // Закрываем диалог
      setShowStartProgramDialog(false)
      
      // Передаем состояние для обновления календаря
      router.push("/calendar?refresh=true")
    } catch (error) {
      console.error("Ошибка при запуске программы:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось запланировать программу тренировок",
        variant: "destructive"
      })
    }
  }

  // Функция для определения уровня сложности программы
  const getProgramDifficulty = (program: TrainingProgram): string => {
    if (!program.workouts.length) return "начинающий";
    
    // Получаем все тренировки программы
    const workouts = program.workouts
      .map(w => getWorkoutById(w.workoutId))
      .filter(Boolean) as Workout[];
    
    if (!workouts.length) return "начинающий";
    
    // Считаем, сколько тренировок каждого уровня сложности
    const difficultyCount = {
      "начинающий": 0,
      "средний": 0,
      "продвинутый": 0
    };
    workouts.forEach(w => {
      // @ts-ignore
      if (w.difficulty in difficultyCount) {
        // @ts-ignore
        difficultyCount[w.difficulty as keyof typeof difficultyCount]++;
      }
    });
    
    // Определяем преобладающий уровень сложности
    let maxCount = 0;
    let maxDifficulty = "начинающий";
    
    Object.entries(difficultyCount).forEach(([difficulty, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDifficulty = difficulty;
      }
    });
    
    return maxDifficulty;
  };
  
  // Функция для определения примерной калорийности программы
  const getProgramCalories = (program: TrainingProgram): number => {
    const workouts = program.workouts
      .map(w => getWorkoutById(w.workoutId))
      .filter(Boolean) as Workout[];
    
    if (!workouts.length) return 0;
    
    // Суммируем калории всех тренировок
    return workouts.reduce((sum, workout) => sum + (workout.calories || 0), 0);
  };

  if (loading || isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Программы тренировок</h1>
        <div className="text-center py-12">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-lg text-muted-foreground">Загрузка программ тренировок...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Программы тренировок</h1>
            <p className="text-muted-foreground mt-1">
              Создавайте и организуйте серии тренировок
            </p>
          </div>
          
          <Button 
            size="lg"
            className="gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-5 w-5" />
            Создать программу
          </Button>
        </div>
        
        <Tabs defaultValue="all" className="mt-6" onValueChange={(value) => setActiveTab(value as "all" | "my" | "public")}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-[400px] grid-cols-3">
              <TabsTrigger value="all">Все программы</TabsTrigger>
              <TabsTrigger value="my">Мои</TabsTrigger>
              <TabsTrigger value="public">Общедоступные</TabsTrigger>
            </TabsList>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="link" className="gap-1" onClick={() => router.push('/calendar')}>
                    <CalendarDays className="h-4 w-4" />
                    Перейти в календарь
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Просмотреть запланированные тренировки</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <ProgramsList 
              programs={getFilteredPrograms()}
              onSelect={openProgramDetail}
              getWorkoutById={getWorkoutById}
              getProgramDifficulty={getProgramDifficulty}
              getProgramCalories={getProgramCalories}
            />
          </TabsContent>
          
          <TabsContent value="my" className="mt-0">
            <ProgramsList 
              programs={getFilteredPrograms()}
              onSelect={openProgramDetail}
              getWorkoutById={getWorkoutById}
              getProgramDifficulty={getProgramDifficulty}
              getProgramCalories={getProgramCalories}
            />
          </TabsContent>
          
          <TabsContent value="public" className="mt-0">
            <ProgramsList 
              programs={getFilteredPrograms()}
              onSelect={openProgramDetail}
              getWorkoutById={getWorkoutById}
              getProgramDifficulty={getProgramDifficulty}
              getProgramCalories={getProgramCalories}
            />
          </TabsContent>
        </Tabs>
        
        {/* Модальное окно создания программы */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создание программы тренировок</DialogTitle>
              <DialogDescription>
                Составьте собственную программу из тренировок
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Название
                </Label>
                <Input
                  id="name"
                  value={newProgram.name}
                  onChange={(e) => setNewProgram({...newProgram, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Название программы"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  placeholder="Опишите цель и особенности программы"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Длительность (дни)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={90}
                  value={newProgram.duration}
                  onChange={(e) => setNewProgram({...newProgram, duration: Number(e.target.value)})}
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
                    checked={newProgram.isPublic}
                    onCheckedChange={(checked) => 
                      setNewProgram({...newProgram, isPublic: Boolean(checked)})
                    }
                  />
                  <Label htmlFor="isPublic" className="ml-2">
                    Доступна для всех пользователей
                  </Label>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <h3 className="text-lg font-medium">Добавление тренировок</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="workoutId">Тренировка</Label>
                    <Select
                      value={workoutToAdd.workoutId}
                      onValueChange={(value) => setWorkoutToAdd({...workoutToAdd, workoutId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тренировку">
                          {workoutToAdd.workoutId ? 
                            getWorkoutById(workoutToAdd.workoutId)?.name || "Выберите тренировку" 
                            : "Выберите тренировку"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <Tabs defaultValue="user" className="w-full">
                          <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="user">Мои</TabsTrigger>
                            <TabsTrigger value="public">Общедоступные</TabsTrigger>
                          </TabsList>
                          <TabsContent value="user" className="mt-2">
                            {userWorkouts.length > 0 ? (
                              userWorkouts.map((workout) => (
                                <SelectItem key={workout.id} value={workout.id}>
                                  {workout.name} - {workout.durationMinutes || workout.duration || 0} мин
                                </SelectItem>
                              ))
                            ) : (
                              <div className="text-center py-2 text-sm text-muted-foreground">
                                У вас нет тренировок
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value="public" className="mt-2">
                            {publicWorkouts.length > 0 ? (
                              publicWorkouts.map((workout) => (
                                <SelectItem key={workout.id} value={workout.id}>
                                  {workout.name} - {workout.durationMinutes || workout.duration || 0} мин
                                </SelectItem>
                              ))
                            ) : (
                              <div className="text-center py-2 text-sm text-muted-foreground">
                                Нет общедоступных тренировок
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="day">День программы</Label>
                    <Input
                      id="day"
                      type="number"
                      min={1}
                      max={newProgram.duration}
                      value={workoutToAdd.dayOfProgram}
                      onChange={(e) => setWorkoutToAdd({...workoutToAdd, dayOfProgram: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeOfDay">Время дня</Label>
                    <Select
                      value={workoutToAdd.timeOfDay}
                      onValueChange={(value) => setWorkoutToAdd({...workoutToAdd, timeOfDay: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите время дня">
                          {workoutToAdd.timeOfDay || "Выберите время дня"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OF_DAY_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleAddWorkoutToProgram}
                  disabled={!workoutToAdd.workoutId}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить тренировку
                </Button>
              </div>
              
              {newProgram.workouts.length > 0 && (
                <div className="border rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">
                      Расписание программы
                    </h4>
                    <Badge variant="outline">
                      {newProgram.workouts.length} тренировок
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {newProgram.workouts
                      .sort((a, b) => a.dayOfProgram - b.dayOfProgram)
                      .map((workout, index) => {
                        const workoutDetails = getWorkoutById(workout.workoutId)
                        return (
                          <div key={index} className="border rounded-md p-3 bg-muted/40">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs">
                                    День {workout.dayOfProgram}
                                  </span>
                                  {workoutDetails?.name || "Тренировка"}
                                </div>
                                {workoutDetails && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {workoutDetails.type} • {workoutDetails.durationMinutes || workoutDetails.duration || 0} мин
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{workout.timeOfDay}</Badge>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeWorkoutFromProgram(index)}
                                  className="h-7 w-7"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateProgram}>
                Создать программу
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Модальное окно детальной информации о программе */}
        <Dialog open={showProgramDetailDialog} onOpenChange={setShowProgramDetailDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            {selectedProgram && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{selectedProgram.name}</DialogTitle>
                    <Badge variant={selectedProgram.isPublic ? "default" : "outline"}>
                      {selectedProgram.isPublic ? "Публичная" : "Личная"}
                    </Badge>
                  </div>
                  <DialogDescription>{selectedProgram.description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-3 gap-4 mb-4 border rounded-lg p-3 bg-muted/40">
                    <div className="flex flex-col items-center">
                      <CalendarDays className="h-5 w-5 text-primary mb-1" />
                      <div className="font-medium">{selectedProgram.duration} дней</div>
                      <div className="text-xs text-muted-foreground">Длительность</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Dumbbell className="h-5 w-5 text-primary mb-1" />
                      <div className="font-medium">{selectedProgram.workouts.length}</div>
                      <div className="text-xs text-muted-foreground">Тренировок</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <Clock className="h-5 w-5 text-primary mb-1" />
                      <div className="font-medium">{getProgramDifficulty(selectedProgram)}</div>
                      <div className="text-xs text-muted-foreground">Сложность</div>
                    </div>
                  </div>
                
                  <Separator className="my-4" />
                  
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
                    План тренировок
                  </h3>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {selectedProgram.workouts
                      .sort((a, b) => a.dayOfProgram - b.dayOfProgram)
                      .map((workoutPlan, index) => {
                        const workout = getWorkoutById(workoutPlan.workoutId)
                        return (
                          <div key={index} className="border rounded-md p-4 hover:border-primary transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs">
                                    День {workoutPlan.dayOfProgram}
                                  </span>
                                  {workout?.name || "Неизвестная тренировка"}
                                </h4>
                                {workout && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {workout.description}
                                  </p>
                                )}
                              </div>
                              <Badge>{workoutPlan.timeOfDay}</Badge>
                            </div>
                            {workout && (
                              <div className="mt-3 grid grid-cols-3 gap-2 text-sm bg-muted/30 rounded-md p-2">
                                <div className="flex items-center">
                                  <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                  <span>{workout.durationMinutes || workout.duration || 0} мин</span>
                                </div>
                                <div className="flex items-center">
                                  <Dumbbell className="mr-1 h-3 w-3 text-muted-foreground" />
                                  <span>{workout.exercises?.length || 0} упр.</span>
                                </div>
                                <div className="flex items-center justify-end">
                                  <Badge variant="outline" className="h-5">
                                    {workout.type}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowProgramDetailDialog(false)}>
                    Закрыть
                  </Button>
                  <Button onClick={() => {
                    setShowProgramDetailDialog(false)
                    prepareStartProgram(selectedProgram)
                  }}>
                    Запланировать программу
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Модальное окно для запуска программы */}
        <Dialog open={showStartProgramDialog} onOpenChange={setShowStartProgramDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            {selectedProgram && (
              <>
                <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-6 rounded-t-lg">
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Запланировать программу: {selectedProgram.name}
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1.5">
                    Выберите дату начала программы и тренировки для включения
                  </DialogDescription>
                </DialogHeader>
                <div className="py-6 px-1">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 shadow-sm border">
                      <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-primary">
                        <CalendarDays className="h-4 w-4" />
                        Дата начала программы
                      </h3>
                      
                      <div className="flex flex-col">
                        <div className="text-center mb-4">
                          <span className="inline-block py-2 px-6 rounded-full bg-primary/10 font-medium text-primary shadow-sm border border-primary/20">
                            {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
                          </span>
                        </div>
                        
                        <div className="calendar-wrapper mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            classNames={{
                              months: "flex flex-col space-y-4",
                              month: "space-y-4",
                              caption: "flex justify-center pt-3 pb-2 relative items-center bg-primary/5 mb-2 rounded-t-lg",
                              caption_label: "text-sm font-medium text-primary",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex bg-muted/30 rounded-md mx-1 my-1",
                              head_cell: "text-muted-foreground rounded-md w-9 font-semibold text-[0.8rem] text-center px-0 py-2",
                              row: "flex w-full mt-2",
                              cell: "text-center relative p-0 text-sm focus-within:relative focus-within:z-20 h-9 w-9",
                              day: "h-9 w-9 p-0 font-normal hover:bg-primary/10 hover:text-primary rounded-full transition-colors",
                              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium rounded-full ring-2 ring-primary/20 ring-offset-2",
                              day_today: "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/25 rounded-full",
                              day_outside: "opacity-50",
                              day_disabled: "text-muted-foreground opacity-50",
                              day_range_middle: "rounded-full",
                              day_hidden: "invisible",
                            }}
                          />
                        </div>
                        
                        <style jsx global>{`
                          .calendar-wrapper {
                            width: 320px;
                            padding: 0.75rem;
                          }
                          .calendar-wrapper .rdp-day {
                            transition: all 0.2s ease;
                          }
                          .calendar-wrapper .rdp-day:hover {
                            transform: scale(1.1);
                          }
                          .calendar-wrapper .rdp-day_selected {
                            transform: scale(1.1);
                            font-weight: bold;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                          }
                          .calendar-wrapper .rdp-head_cell {
                            font-weight: 600;
                            color: #666;
                          }
                        `}</style>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-background px-4 text-sm text-muted-foreground">Выберите тренировки</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-sm border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-primary" />
                          Тренировки для включения
                        </h3>
                        <div className="text-sm bg-primary/10 text-primary rounded-full px-3 py-1">
                          Выбрано: {selectedWorkouts.length} из {selectedProgram.workouts.length}
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 mt-4">
                        {selectedProgram.workouts
                          .sort((a, b) => a.dayOfProgram - b.dayOfProgram)
                          .map((workoutPlan, index) => {
                            const workout = getWorkoutById(workoutPlan.workoutId)
                            const isSelected = selectedWorkouts.includes(workoutPlan.workoutId)
                            
                            return (
                              <div 
                                key={index} 
                                className={cn(
                                  "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                                  isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:bg-muted/50"
                                )}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedWorkouts(prev => prev.filter(id => id !== workoutPlan.workoutId))
                                  } else {
                                    setSelectedWorkouts(prev => [...prev, workoutPlan.workoutId])
                                  }
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={isSelected}
                                    className={cn("mt-1 transition-all", isSelected ? "text-primary" : "")}
                                    onCheckedChange={() => {
                                      if (isSelected) {
                                        setSelectedWorkouts(prev => prev.filter(id => id !== workoutPlan.workoutId))
                                      } else {
                                        setSelectedWorkouts(prev => [...prev, workoutPlan.workoutId])
                                      }
                                    }}
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium flex items-center gap-2">
                                          <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-bold">
                                            День {workoutPlan.dayOfProgram}
                                          </span>
                                          {workout?.name || "Неизвестная тренировка"}
                                        </div>
                                        {workout && (
                                          <div className="flex items-center text-sm text-muted-foreground gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{workout.type}</span>
                                            <span>•</span>
                                            <span>{workout.durationMinutes || workout.duration || 0} мин</span>
                                            <span>•</span>
                                            { /* @ts-ignore */ }
                                            <span>{workout.difficulty}</span>
                                          </div>
                                        )}
                                      </div>
                                      <Badge className="bg-gradient-to-r from-primary/80 to-primary font-medium">{workoutPlan.timeOfDay}</Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedWorkouts(selectedProgram.workouts.map(w => w.workoutId))}
                          className="mr-2 hover:bg-primary/10 hover:text-primary"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Выбрать все
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="px-6 py-4 bg-muted/30 border-t rounded-b-lg">
                  <Button variant="outline" onClick={() => setShowStartProgramDialog(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleStartProgram} className="gap-2 bg-gradient-to-r from-primary to-primary/90">
                    <CalendarDays className="h-4 w-4" />
                    Запланировать программу
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Компонент для отображения списка программ
function ProgramsList({ 
  programs, 
  onSelect,
  getWorkoutById,
  getProgramDifficulty,
  getProgramCalories 
}: { 
  programs: TrainingProgram[], 
  onSelect: (program: TrainingProgram) => void,
  getWorkoutById: (id: string) => Workout | undefined,
  getProgramDifficulty: (program: TrainingProgram) => string,
  getProgramCalories: (program: TrainingProgram) => number
}) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Dumbbell className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Нет доступных программ</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Создайте новую программу, добавив в неё свои любимые тренировки
        </p>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Создать программу
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {programs.map((program) => (
        <Card 
          key={program.id} 
          className="overflow-hidden hover:shadow-md transition-all cursor-pointer group"
          onClick={() => onSelect(program)}
        >
          <CardHeader className="pb-3 relative bg-muted/30">
            <div className="absolute top-3 right-3">
              <Badge variant={program.isPublic ? "default" : "outline"}>
                {program.isPublic ? "Публичная" : "Личная"}
              </Badge>
            </div>
            <CardTitle className="group-hover:text-primary transition-colors">
              {program.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {program.description || "Без описания"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="flex justify-between text-sm mb-3">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{program.duration} дней</span>
              </div>
              <div className="flex items-center">
                <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{program.workouts.length} тренировок</span>
              </div>
            </div>
            
            <div className="space-y-1">
              {program.workouts.length > 0 ? (
                <div className="relative h-24 rounded-md overflow-hidden border bg-muted/20">
                  <div className="absolute inset-0 px-3 py-2 flex flex-col">
                    <div className="text-xs font-medium mb-1">Тренировки по дням:</div>
                    <div className="flex-1 flex flex-wrap gap-1 content-start overflow-hidden">
                      {program.workouts
                        .sort((a, b) => a.dayOfProgram - b.dayOfProgram)
                        .slice(0, 12)
                        .map((w, i) => {
                          const workout = getWorkoutById(w.workoutId);
                          return (
                            <div 
                              key={i} 
                              className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate max-w-[100px]"
                              title={`День ${w.dayOfProgram}: ${workout?.name || 'Тренировка'} (${w.timeOfDay})`}
                            >
                              Д{w.dayOfProgram}: {workout?.name || 'Тренировка'}
                            </div>
                          );
                        })}
                      {program.workouts.length > 12 && (
                        <div className="text-xs px-1.5 py-0.5 rounded bg-muted">
                          +{program.workouts.length - 12} ещё
                        </div>
                      )}
                    </div>
                    <div className="absolute right-2 bottom-2">
                      <Badge variant="outline" className="text-xs">
                        {getProgramDifficulty(program)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-24 rounded-md border flex items-center justify-center text-muted-foreground text-sm">
                  Нет тренировок в программе
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-0">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(program);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
              Подробнее
            </Button>
            <Button 
              size="sm"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                // Тут будет переход к началу программы
              }}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Запланировать
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 
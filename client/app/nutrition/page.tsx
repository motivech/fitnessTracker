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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Apple, Banana, Coffee, Droplet, Plus, Trash, Edit, MoreVertical } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Моковые данные для примера
const MOCK_MEALS = [
  {
    id: 1,
    type: "Завтрак",
    time: "08:30",
    date: "2023-05-20",
    items: [
      { name: "Овсяная каша", calories: 250, protein: 8, carbs: 40, fat: 5 },
      { name: "Банан", calories: 105, protein: 1, carbs: 27, fat: 0 }
    ],
    totalCalories: 355
  },
  {
    id: 2,
    type: "Обед",
    time: "13:00",
    date: "2023-05-20",
    items: [
      { name: "Куриная грудка", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: "Рис", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      { name: "Овощной салат", calories: 80, protein: 2, carbs: 10, fat: 3 }
    ],
    totalCalories: 375
  },
  {
    id: 3,
    type: "Ужин",
    time: "19:00",
    date: "2023-05-20",
    items: [
      { name: "Паста с томатным соусом", calories: 320, protein: 12, carbs: 65, fat: 5 },
      { name: "Сыр", calories: 110, protein: 7, carbs: 0, fat: 9 }
    ],
    totalCalories: 430
  }
]

const MOCK_WATER_INTAKE = [
  { id: 1, amount: 250, time: "07:30", date: "2023-05-20" },
  { id: 2, amount: 300, time: "10:15", date: "2023-05-20" },
  { id: 3, amount: 250, time: "13:30", date: "2023-05-20" },
  { id: 4, amount: 300, time: "16:00", date: "2023-05-20" },
  { id: 5, amount: 250, time: "19:30", date: "2023-05-20" }
]

const MEAL_TYPES = [
  "Завтрак",
  "Перекус",
  "Обед",
  "Полдник",
  "Ужин",
  "Другое"
]

interface FoodItem {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  id: number
  type: string
  time: string
  date: string
  items: FoodItem[]
  totalCalories: number
}

interface WaterIntake {
  id: number
  amount: number
  time: string
  date: string
}

export default function NutritionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [meals, setMeals] = useState<Meal[]>([])
  const [waterIntake, setWaterIntake] = useState<WaterIntake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalWater, setTotalWater] = useState(0)
  const [totalCalories, setTotalCalories] = useState(0)
  const [showAddMealDialog, setShowAddMealDialog] = useState(false)
  const [showAddWaterDialog, setShowAddWaterDialog] = useState(false)

  // Форма добавления приема пищи
  const [newMeal, setNewMeal] = useState<Omit<Meal, "id" | "totalCalories">>({
    type: "Завтрак",
    time: new Date().toTimeString().slice(0, 5),
    date: new Date().toISOString().split("T")[0],
    items: [{ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }]
  })
  
  // Форма добавления воды
  const [newWaterIntake, setNewWaterIntake] = useState<Omit<WaterIntake, "id">>({
    amount: 250,
    time: new Date().toTimeString().slice(0, 5),
    date: new Date().toISOString().split("T")[0]
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        // В реальном приложении получаем данные с сервера
        // Здесь используем моковые данные
        setMeals(MOCK_MEALS)
        setWaterIntake(MOCK_WATER_INTAKE)
        
        // Рассчитываем суммы
        const totalWaterAmount = MOCK_WATER_INTAKE.reduce((sum, item) => sum + item.amount, 0)
        const totalCaloriesAmount = MOCK_MEALS.reduce((sum, meal) => sum + meal.totalCalories, 0)
        
        setTotalWater(totalWaterAmount)
        setTotalCalories(totalCaloriesAmount)
      } catch (error) {
        console.error("Ошибка загрузки данных питания:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные о питании",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchNutritionData()
    }
  }, [user, toast])

  const addFoodItem = () => {
    setNewMeal({
      ...newMeal,
      items: [
        ...newMeal.items,
        { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }
      ]
    })
  }

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const updatedItems = [...newMeal.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: typeof value === "string" && field !== "name" ? parseFloat(value) : value
    }
    setNewMeal({ ...newMeal, items: updatedItems })
  }

  const removeFoodItem = (index: number) => {
    if (newMeal.items.length > 1) {
      const updatedItems = newMeal.items.filter((_, i) => i !== index)
      setNewMeal({ ...newMeal, items: updatedItems })
    }
  }

  const handleAddMeal = () => {
    // В реальном приложении отправляем данные на сервер
    const totalMealCalories = newMeal.items.reduce((sum, item) => sum + item.calories, 0)
    const newId = Math.max(...meals.map(m => m.id), 0) + 1
    
    const mealToAdd: Meal = {
      ...newMeal,
      id: newId,
      totalCalories: totalMealCalories
    }
    
    setMeals([...meals, mealToAdd])
    setTotalCalories(totalCalories + totalMealCalories)
    setShowAddMealDialog(false)
    
    // Сбрасываем форму
    setNewMeal({
      type: "Завтрак",
      time: new Date().toTimeString().slice(0, 5),
      date: new Date().toISOString().split("T")[0],
      items: [{ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }]
    })
    
    toast({
      title: "Успешно",
      description: "Прием пищи добавлен"
    })
  }

  const handleAddWater = () => {
    // В реальном приложении отправляем данные на сервер
    const newId = Math.max(...waterIntake.map(w => w.id), 0) + 1
    
    const waterToAdd: WaterIntake = {
      ...newWaterIntake,
      id: newId
    }
    
    setWaterIntake([...waterIntake, waterToAdd])
    setTotalWater(totalWater + waterToAdd.amount)
    setShowAddWaterDialog(false)
    
    // Сбрасываем форму
    setNewWaterIntake({
      amount: 250,
      time: new Date().toTimeString().slice(0, 5),
      date: new Date().toISOString().split("T")[0]
    })
    
    toast({
      title: "Успешно",
      description: "Прием воды добавлен"
    })
  }

  const handleDeleteMeal = (id: number) => {
    // В реальном приложении отправляем запрос на сервер
    const mealToDelete = meals.find(meal => meal.id === id)
    if (mealToDelete) {
      setMeals(meals.filter(meal => meal.id !== id))
      setTotalCalories(totalCalories - mealToDelete.totalCalories)
      
      toast({
        title: "Успешно",
        description: "Прием пищи удален"
      })
    }
  }

  const handleDeleteWaterIntake = (id: number) => {
    // В реальном приложении отправляем запрос на сервер
    const waterToDelete = waterIntake.find(water => water.id === id)
    if (waterToDelete) {
      setWaterIntake(waterIntake.filter(water => water.id !== id))
      setTotalWater(totalWater - waterToDelete.amount)
      
      toast({
        title: "Успешно",
        description: "Запись о приеме воды удалена"
      })
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
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Питание и гидратация</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Общие калории
              </CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCalories} ккал</div>
              <p className="text-xs text-muted-foreground">
                Потреблено сегодня
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Потребление воды
              </CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalWater / 1000).toFixed(1)} л</div>
              <p className="text-xs text-muted-foreground">
                Выпито сегодня
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Приемы пищи
              </CardTitle>
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{meals.length}</div>
              <p className="text-xs text-muted-foreground">
                Записано сегодня
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Порции воды
              </CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waterIntake.length}</div>
              <p className="text-xs text-muted-foreground">
                Записано сегодня
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="meals" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="meals">Приемы пищи</TabsTrigger>
              <TabsTrigger value="water">Прием воды</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить прием пищи
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Добавить прием пищи</DialogTitle>
                    <DialogDescription>
                      Укажите детали вашего приема пищи
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="mealType" className="text-right">
                        Тип
                      </label>
                      <Select 
                        value={newMeal.type}
                        onValueChange={(value) => setNewMeal({...newMeal, type: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Выберите тип приема пищи" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="mealTime" className="text-right">
                        Время
                      </label>
                      <Input
                        id="mealTime"
                        type="time"
                        className="col-span-3"
                        value={newMeal.time}
                        onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="mealDate" className="text-right">
                        Дата
                      </label>
                      <Input
                        id="mealDate"
                        type="date"
                        className="col-span-3"
                        value={newMeal.date}
                        onChange={(e) => setNewMeal({...newMeal, date: e.target.value})}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Продукты:</h3>
                      {newMeal.items.map((item, index) => (
                        <div key={index} className="mb-4 p-3 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Продукт {index + 1}</span>
                            {newMeal.items.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeFoodItem(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-2">
                            <div className="grid grid-cols-4 items-center gap-2">
                              <label className="text-sm col-span-1">Название</label>
                              <Input
                                className="col-span-3"
                                value={item.name}
                                onChange={(e) => updateFoodItem(index, "name", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-2">
                              <label className="text-sm col-span-1">Калории</label>
                              <Input
                                type="number"
                                className="col-span-3"
                                value={item.calories}
                                onChange={(e) => updateFoodItem(index, "calories", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-2">
                              <label className="text-sm col-span-1">Белки (г)</label>
                              <Input
                                type="number"
                                className="col-span-3"
                                value={item.protein}
                                onChange={(e) => updateFoodItem(index, "protein", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-2">
                              <label className="text-sm col-span-1">Углеводы (г)</label>
                              <Input
                                type="number"
                                className="col-span-3"
                                value={item.carbs}
                                onChange={(e) => updateFoodItem(index, "carbs", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-2">
                              <label className="text-sm col-span-1">Жиры (г)</label>
                              <Input
                                type="number"
                                className="col-span-3"
                                value={item.fat}
                                onChange={(e) => updateFoodItem(index, "fat", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline"
                        onClick={addFoodItem}
                        className="w-full mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить продукт
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddMealDialog(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddMeal}>
                      Сохранить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showAddWaterDialog} onOpenChange={setShowAddWaterDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Droplet className="mr-2 h-4 w-4" />
                    Добавить воду
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить прием воды</DialogTitle>
                    <DialogDescription>
                      Укажите количество выпитой воды
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="waterAmount" className="text-right">
                        Количество (мл)
                      </label>
                      <Input
                        id="waterAmount"
                        type="number"
                        className="col-span-3"
                        value={newWaterIntake.amount}
                        onChange={(e) => setNewWaterIntake({...newWaterIntake, amount: Number(e.target.value)})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="waterTime" className="text-right">
                        Время
                      </label>
                      <Input
                        id="waterTime"
                        type="time"
                        className="col-span-3"
                        value={newWaterIntake.time}
                        onChange={(e) => setNewWaterIntake({...newWaterIntake, time: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="waterDate" className="text-right">
                        Дата
                      </label>
                      <Input
                        id="waterDate"
                        type="date"
                        className="col-span-3"
                        value={newWaterIntake.date}
                        onChange={(e) => setNewWaterIntake({...newWaterIntake, date: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddWaterDialog(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddWater}>
                      Сохранить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <TabsContent value="meals">
            <Card>
              <CardHeader>
                <CardTitle>Ваши приемы пищи</CardTitle>
                <CardDescription>
                  История приемов пищи и потребления калорий
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <div className="text-center py-10">
                    <h3 className="font-medium text-lg">Нет записей о приемах пищи</h3>
                    <p className="text-muted-foreground mt-1">
                      Добавьте свой первый прием пищи, нажав кнопку выше
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {meals.map((meal) => (
                      <div key={meal.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{meal.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              {meal.time} • {new Date(meal.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{meal.totalCalories} ккал</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Редактировать</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteMeal(meal.id)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Удалить</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Продукт</TableHead>
                              <TableHead className="text-right">Калории</TableHead>
                              <TableHead className="text-right">Белки (г)</TableHead>
                              <TableHead className="text-right">Углеводы (г)</TableHead>
                              <TableHead className="text-right">Жиры (г)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {meal.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">{item.calories}</TableCell>
                                <TableCell className="text-right">{item.protein}</TableCell>
                                <TableCell className="text-right">{item.carbs}</TableCell>
                                <TableCell className="text-right">{item.fat}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="water">
            <Card>
              <CardHeader>
                <CardTitle>Ваши приемы воды</CardTitle>
                <CardDescription>
                  История потребления воды за день
                </CardDescription>
              </CardHeader>
              <CardContent>
                {waterIntake.length === 0 ? (
                  <div className="text-center py-10">
                    <h3 className="font-medium text-lg">Нет записей о приеме воды</h3>
                    <p className="text-muted-foreground mt-1">
                      Добавьте свой первый прием воды, нажав кнопку выше
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="h-6 w-full bg-slate-100 rounded-full">
                        <div 
                          className="h-6 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center" 
                          style={{ width: `${Math.min(100, (totalWater / 2500) * 100)}%` }}
                        >
                          {(totalWater / 1000).toFixed(1)} / 2.5 л
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {waterIntake.map((water) => (
                        <div key={water.id} className="flex items-center justify-between border rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              <Droplet className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="font-medium">{water.amount} мл</h3>
                              <p className="text-sm text-muted-foreground">
                                {water.time} • {new Date(water.date).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteWaterIntake(water.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 
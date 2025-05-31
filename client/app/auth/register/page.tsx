"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from 'next/navigation'
import { ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

enum RegisterStep {
  BasicInfo = 0,
  ProfileInfo = 1
}

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>(RegisterStep.BasicInfo)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderately_active',
    fitnessGoals: ['general_fitness'] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { register, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    if (formData.firstName && formData.lastName && formData.email && formData.password) {
      setStep(RegisterStep.ProfileInfo)
    } else {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все обязательные поля',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Убедимся, что у нас есть минимальные данные для второго шага
      if (!formData.gender || !formData.age) {
        toast({
          title: 'Ошибка',
          description: 'Пожалуйста, заполните все обязательные поля',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      await register({
        ...formData,
        age: parseInt(formData.age),
      })
      
      toast({
        title: 'Успешная регистрация',
        description: 'Добро пожаловать в фитнес-приложение!',
      })
    } catch (error) {
      console.error('Ошибка регистрации:', error)
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось зарегистрироваться',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Первый шаг регистрации - базовая информация
  const renderBasicInfoStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Иван"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Иванов"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="example@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button onClick={nextStep} className="w-full bg-blue-400 hover:bg-blue-500">
          Продолжить
        </Button>
        <p className="text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Войти
          </Link>
        </p>
      </CardFooter>
    </Card>
  )

  // Второй шаг регистрации - информация о профиле
  const renderProfileInfoStep = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Завершите свой профиль</CardTitle>
        <CardDescription>
          Это поможет нам узнать вас лучше!
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="age">Возраст</Label>
            <Input
              id="age"
              name="age"
              type="number"
              placeholder="30"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
        
          <div className="space-y-2">
            <Label htmlFor="gender">Выберите пол</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange('gender', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите пол" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Мужской</SelectItem>
                <SelectItem value="female">Женский</SelectItem>
                <SelectItem value="other">Другой</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            <ChevronRightIcon className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep(RegisterStep.BasicInfo)}
            className="w-full"
          >
            Назад
          </Button>
        </CardFooter>
      </form>
    </Card>
  )

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
      {step === RegisterStep.BasicInfo ? renderBasicInfoStep() : renderProfileInfoStep()}
    </div>
  )
} 
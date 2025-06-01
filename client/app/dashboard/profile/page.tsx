"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { API_URL } from '@/lib/constants';

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  age: number
  gender: string
  activityLevel: string
  fitnessGoals: string[]
  weight?: number
  height?: number
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при получении профиля')
      }
      
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить профиль',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (profile) {
      setProfile({ ...profile, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (profile) {
      setProfile({ ...profile, [name]: value })
    }
  }

  const saveProfile = async () => {
    if (!profile) return
    
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при обновлении профиля')
      }
      
      toast({
        title: 'Успешно',
        description: 'Профиль успешно обновлен',
      })
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить профиль',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Не удалось загрузить профиль</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>
        
        <Tabs defaultValue="info">
          <TabsList className="mb-6">
            <TabsTrigger value="info">Личная информация</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
            <TabsTrigger value="goals">Цели и показатели</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>
                  Обновите вашу личную информацию
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                  />
                  <p className="text-sm text-gray-500">Email изменить нельзя</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Возраст</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={profile.age}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gender">Пол</Label>
                    <Select
                      value={profile.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите пол" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Мужской</SelectItem>
                        <SelectItem value="female">Женский</SelectItem>
                        <SelectItem value="other">Другой</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Настройки</CardTitle>
                <CardDescription>
                  Управляйте настройками вашего аккаунта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Новый пароль</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2">Отмена</Button>
                <Button>Изменить пароль</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Цели и показатели</CardTitle>
                <CardDescription>
                  Настройте свои фитнес-цели и показатели
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activityLevel">Уровень активности</Label>
                  <Select
                    value={profile.activityLevel}
                    onValueChange={(value) => handleSelectChange('activityLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите уровень активности" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Малоподвижный</SelectItem>
                      <SelectItem value="lightly_active">Немного активный</SelectItem>
                      <SelectItem value="moderately_active">Умеренно активный</SelectItem>
                      <SelectItem value="very_active">Очень активный</SelectItem>
                      <SelectItem value="extra_active">Экстремально активный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Вес (кг)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={profile.weight || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Рост (см)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={profile.height || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Цели фитнеса</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">Снижение веса</Button>
                    <Button variant="outline" className="justify-start">Набор мышечной массы</Button>
                    <Button variant="outline" className="justify-start" data-state="active">Общая физическая форма</Button>
                    <Button variant="outline" className="justify-start">Выносливость</Button>
                    <Button variant="outline" className="justify-start">Гибкость</Button>
                    <Button variant="outline" className="justify-start">Сила</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveProfile} disabled={isSaving}>
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 

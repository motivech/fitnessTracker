"use client"

import React, { useEffect, useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Settings, 
  LogOut, 
  Bell
} from "lucide-react"
import { Achievement } from "@/lib/types"
import { getUserProfile, updateProfile, updateSettings, uploadAvatar } from "@/services/profile"
import { ThemeOption, MeasurementSystem } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback"
import { useExperience } from '@/hooks/useExperience'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [expData, refreshExperience] = useExperience()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [age, setAge] = useState<number | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<ThemeOption>("system")
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>("metric")
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    achievementNotifications: true,
    newsletterSubscription: false,
    reminderTime: 30,
    newContentNotifications: true
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      redirect("/login")
    } else if (user) {
      loadUserProfile()
    }
  }, [user, loading])

  const loadUserProfile = async () => {
    try {
      // Загружаем профиль пользователя
      const profileData = await getUserProfile()
      
      setFirstName(profileData.firstName || "")
      setLastName(profileData.lastName || "")
      setEmail(profileData.email || "")
      setAge(profileData.age)
      
      if (profileData.avatar) {
        setAvatarUrl(profileData.avatar)
      }
      
      // Загружаем настройки пользователя
      if (profileData.settings) {
        if (profileData.settings.theme) {
          setTheme(profileData.settings.theme as ThemeOption)
        }
        
        if (profileData.settings.measurementSystem) {
          setMeasurementSystem(profileData.settings.measurementSystem as MeasurementSystem)
        }
        
        if (profileData.settings.notifications) {
          setNotifications({
            workoutReminders: profileData.settings.notifications.workoutReminders ?? true,
            achievementNotifications: profileData.settings.notifications.achievementNotifications ?? true,
            newsletterSubscription: profileData.settings.notifications.newsletterSubscription ?? false,
            reminderTime: profileData.settings.notifications.reminderTime || 30,
            newContentNotifications: profileData.settings.notifications.newContentNotifications ?? true
          })
        }
      }
      
      // Обновляем информацию об опыте
      await refreshExperience()
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные профиля",
        variant: "destructive"
      })
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Сначала проверяем, нужно ли загрузить новый аватар
      if (avatarFile) {
        const result = await uploadAvatar(avatarFile)
        if (result && result.avatarUrl) {
          setAvatarUrl(result.avatarUrl)
        }
      }

      // Обновляем основные данные профиля
      await updateProfile({
        firstName,
        lastName,
        email,
        age,
      })

      toast({
        title: "Успех",
        description: "Профиль успешно обновлен",
      })
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSettings = async () => {
    setIsLoading(true)

    try {
      await updateSettings({
        theme,
        measurementSystem,
        notifications: {
          workoutReminders: notifications.workoutReminders,
          achievementNotifications: notifications.achievementNotifications,
          newsletterSubscription: notifications.newsletterSubscription,
          reminderTime: notifications.reminderTime,
          newContentNotifications: notifications.newContentNotifications
        }
      })

      toast({
        title: "Успех",
        description: "Настройки успешно обновлены",
      })
    } catch (error) {
      console.error('Ошибка при обновлении настроек:', error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить настройки",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme)
  }

  const handleMeasurementSystemChange = (system: MeasurementSystem) => {
    setMeasurementSystem(system)
  }

  const handleNotificationSettings = () => {
    handleUpdateSettings()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files.length > 0) {
      const file = files[0]
      
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast({
          title: "Ошибка",
          description: "Размер файла не должен превышать 2MB",
          variant: "destructive"
        })
        return
      }
      
      setAvatarFile(file)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Профиль</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Боковая панель */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <AvatarWithFallback 
                  src={avatarUrl} 
                  alt={firstName} 
                  className="h-12 w-12"
                />
                <div>
                  <CardTitle>{firstName} {lastName}</CardTitle>
                  <CardDescription>{email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <div className="text-sm">Уровень {expData.level}</div>
                  <div className="text-sm text-muted-foreground">{expData.experience % (expData.level * 100)}/{expData.level * 100} XP</div>
                </div>
                <Progress value={expData.progressToNextLevel} className="h-2" />
              </div>
              <nav className="flex flex-col space-y-1">
                <Button variant="ghost" className="justify-start" asChild>
                  <a href="#profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Профиль
                  </a>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <a href="#settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </a>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <a href="#notifications" className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    Уведомления
                  </a>
                </Button>
              </nav>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-500 hover:text-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Основное содержимое */}
        <div className="flex-1">
          <Card id="profile">
            <CardHeader>
              <CardTitle>Информация профиля</CardTitle>
              <CardDescription>
                Обновите свои личные данные
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      placeholder="Ваше имя" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      placeholder="Ваша фамилия" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Возраст</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={age || ""}
                    onChange={(e) => setAge(parseInt(e.target.value) || undefined)}
                    placeholder="Возраст" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Аватар</Label>
                  <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                    <Input 
                      id="avatar" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange}
                    />
                    <AvatarWithFallback 
                      src={avatarUrl}
                      alt={firstName}
                      className="h-10 w-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Рекомендуемый размер: 256x256 пикселей. Максимальный размер: 2MB.
                  </p>
                </div>
                
                {/* Настройки уведомлений */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Настройки уведомлений</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="workoutReminders" className="font-normal">Напоминания о тренировках</Label>
                        <p className="text-sm text-muted-foreground">Получать уведомления о предстоящих тренировках</p>
                      </div>
                      <Switch 
                        id="workoutReminders" 
                        checked={notifications.workoutReminders} 
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, workoutReminders: checked }))}
                      />
                    </div>
                    
                    {notifications.workoutReminders && (
                      <div className="flex items-center justify-between pl-4 border-l-2 border-primary/20">
                        <div>
                          <Label htmlFor="reminderTime" className="font-normal">Время напоминания</Label>
                          <p className="text-sm text-muted-foreground">За сколько минут до тренировки</p>
                        </div>
                        <Select 
                          value={String(notifications.reminderTime || 30)}
                          onValueChange={(value) => setNotifications(prev => ({ 
                            ...prev, 
                            reminderTime: parseInt(value) 
                          }))}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="30 минут" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 минут</SelectItem>
                            <SelectItem value="30">30 минут</SelectItem>
                            <SelectItem value="60">1 час</SelectItem>
                            <SelectItem value="120">2 часа</SelectItem>
                            <SelectItem value="1440">1 день</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="achievementNotifications" className="font-normal">Уведомления о достижениях</Label>
                        <p className="text-sm text-muted-foreground">Получать уведомления о полученных достижениях</p>
                      </div>
                      <Switch 
                        id="achievementNotifications" 
                        checked={notifications.achievementNotifications} 
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, achievementNotifications: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newContentNotifications" className="font-normal">Уведомления о новом контенте</Label>
                        <p className="text-sm text-muted-foreground">Получать уведомления о новых тренировках и программах</p>
                      </div>
                      <Switch 
                        id="newContentNotifications" 
                        checked={notifications.newContentNotifications || false} 
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newContentNotifications: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
} 
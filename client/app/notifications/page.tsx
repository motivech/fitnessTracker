"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Bell,
  Info,
  Award,
  Calendar,
  Dumbbell,
  BookOpen,
  Trash2,
  CheckCircle
} from "lucide-react"
import { Notification } from '@/lib/types'
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  deleteAllNotifications 
} from '@/services/notifications'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function NotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка уведомлений при монтировании компонента
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  // Функция загрузки уведомлений
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getUserNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить уведомления',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Отметка уведомления как прочитанного
  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      )
    } catch (error) {
      console.error('Ошибка при отметке уведомления:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось отметить уведомление как прочитанное',
        variant: 'destructive',
      })
    }
  }

  // Отметка всех уведомлений как прочитанных
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      )
      toast({
        title: 'Готово',
        description: 'Все уведомления отмечены как прочитанные',
      })
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось отметить все уведомления',
        variant: 'destructive',
      })
    }
  }

  // Удаление уведомления
  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(notification => notification.id !== id))
      toast({
        title: 'Готово',
        description: 'Уведомление удалено',
      })
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить уведомление',
        variant: 'destructive',
      })
    }
  }

  // Удаление всех уведомлений
  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications()
      setNotifications([])
      toast({
        title: 'Готово',
        description: 'Все уведомления удалены',
      })
    } catch (error) {
      console.error('Ошибка при удалении всех уведомлений:', error)
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить все уведомления',
        variant: 'destructive',
      })
    }
  }

  // Переход к связанному элементу
  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'workout_reminder') {
      router.push('/calendar')
    } else if (notification.type === 'achievement') {
      router.push('/achievements')
    } else if (notification.type === 'new_workout') {
      router.push('/workouts')
    } else if (notification.type === 'new_program') {
      router.push('/programs')
    }

    // Если уведомление непрочитано, отмечаем его как прочитанное
    if (!notification.read) {
      handleMarkAsRead(notification.id)
    }
  }

  // Получение иконки уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workout_reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />
      case 'new_workout':
        return <Dumbbell className="h-5 w-5 text-green-500" />
      case 'new_program':
        return <BookOpen className="h-5 w-5 text-purple-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru })
    } catch (error) {
      return dateString
    }
  }

  // Группировка уведомлений по дате
  const groupNotificationsByDate = () => {
    const groups: { [key: string]: Notification[] } = {}
    
    notifications.forEach(notification => {
      try {
        const date = parseISO(notification.createdAt)
        const dateKey = format(date, 'yyyy-MM-dd')
        
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        
        groups[dateKey].push(notification)
      } catch (error) {
        // Если дата некорректна, добавляем в группу "Другие"
        if (!groups['other']) {
          groups['other'] = []
        }
        groups['other'].push(notification)
      }
    })
    
    return groups
  }

  // Получение заголовка для группы уведомлений
  const getGroupTitle = (dateKey: string) => {
    if (dateKey === 'other') return 'Другие'
    
    try {
      const date = parseISO(dateKey)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return 'Сегодня'
      } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
        return 'Вчера'
      } else {
        return format(date, 'd MMMM yyyy', { locale: ru })
      }
    } catch (error) {
      return dateKey
    }
  }

  const groupedNotifications = groupNotificationsByDate()
  const hasUnreadNotifications = notifications.some(notification => !notification.read)

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Уведомления</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Уведомления</h1>
          <p className="text-muted-foreground">Все ваши уведомления в одном месте</p>
        </div>
        
        <div className="flex gap-3">
          {hasUnreadNotifications && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Отметить все как прочитанные
            </Button>
          )}
          
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Очистить все
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие удалит все ваши уведомления и не может быть отменено.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAllNotifications}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Удалить все
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">У вас нет уведомлений</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Здесь будут отображаться уведомления о ваших тренировках, достижениях и новых программах
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Все уведомления</CardTitle>
            <CardDescription>
              Всего уведомлений: {notifications.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.keys(groupedNotifications).sort().reverse().map(dateKey => (
                <div key={dateKey}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {getGroupTitle(dateKey)}
                  </h3>
                  <div className="space-y-2">
                    {groupedNotifications[dateKey].map(notification => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "flex items-start p-4 rounded-lg border",
                          notification.read ? "bg-card" : "bg-primary/5 border-primary/30"
                        )}
                      >
                        <div className="mr-4 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={cn(
                              "font-medium",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 ml-1"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </div>
                            <div className="flex gap-2">
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-xs"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Отметить прочитанным
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                Перейти
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
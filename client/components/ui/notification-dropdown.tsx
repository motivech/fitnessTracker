"use client"

import { useState, useEffect } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { 
  Bell,
  Info,
  Award,
  Calendar,
  CheckCircle,
  Dumbbell,
  BookOpen
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format, isSameDay, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { getUserNotifications, getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notifications"
import { useToast } from "@/components/ui/use-toast"
import { NotificationEvents } from "./notification-sidebar"

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  
  // Функция для загрузки уведомлений
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await getUnreadNotifications()
      setNotifications(data)
      setUnreadCount(data.length)
    } catch (error) {
      console.error("Ошибка загрузки уведомлений:", error)
      setNotifications([]) // Сбрасываем уведомления в случае ошибки
      setUnreadCount(0)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить уведомления. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Загружаем уведомления при первой загрузке и при открытии попапа
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])
  
  // Также загружаем уведомления при первом рендере
  useEffect(() => {
    fetchNotifications()
    
    // Устанавливаем интервал для периодической проверки новых уведомлений
    const interval = setInterval(() => {
      if (!open) { // Проверяем только если попап закрыт
        fetchNotifications()
      }
    }, 60000) // Проверка каждую минуту
    
    return () => clearInterval(interval)
  }, [])
  
  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      // Обновляем локальное состояние
      const updatedNotifications = notifications.filter(notification => notification.id !== id)
      setNotifications(updatedNotifications)
      setUnreadCount(updatedNotifications.length)
      // Оповещаем другие компоненты об изменении
      NotificationEvents.emit()
    } catch (error) {
      console.error("Ошибка при отметке уведомления:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось отметить уведомление как прочитанное",
        variant: "destructive"
      })
    }
  }
  
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      // Очищаем локальное состояние
      setNotifications([])
      setUnreadCount(0)
      // Оповещаем другие компоненты об изменении
      NotificationEvents.emit()
      toast({
        title: "Готово",
        description: "Все уведомления отмечены как прочитанные",
      })
    } catch (error) {
      console.error("Ошибка при отметке всех уведомлений:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось отметить все уведомления как прочитанные",
        variant: "destructive"
      })
    }
  }
  
  const handleNotificationClick = (notification: Notification) => {
    // Отмечаем как прочитанное
    markAsRead(notification.id)
    
    // Перенаправляем на соответствующую страницу в зависимости от типа
    if (notification.type === 'workout_reminder') {
      router.push("/calendar")
    } else if (notification.type === 'achievement') {
      router.push("/achievements")
    } else if (notification.type === 'new_workout') {
      router.push("/workouts")
    } else if (notification.type === 'new_program') {
      router.push("/programs")
    }
    
    setOpen(false)
  }
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "workout_reminder":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "achievement":
        return <Award className="h-4 w-4 text-yellow-500" />
      case "new_workout":
        return <Dumbbell className="h-4 w-4 text-green-500" />
      case "new_program":
        return <BookOpen className="h-4 w-4 text-purple-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    const now = new Date()
    
    if (isSameDay(date, now)) {
      return "Сегодня"
    } else if (isSameDay(date, new Date(now.setDate(now.getDate() - 1)))) {
      return "Вчера"
    } else {
      return format(date, "d MMMM", { locale: ru })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Уведомления</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={markAllAsRead}
            >
              Отметить все как прочитанные
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Загрузка уведомлений...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 flex flex-col items-center justify-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 text-muted-foreground/60" />
              <p>У вас нет непрочитанных уведомлений</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-3 border-b last:border-0 hover:bg-accent/50 cursor-pointer",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={cn(
                          "text-sm font-medium",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 ml-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              router.push("/notifications")
              setOpen(false)
            }}
          >
            Посмотреть все уведомления
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 
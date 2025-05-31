"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/lib/types"
import { getUnreadNotifications } from "@/services/notifications"

// Создаем событие для обновления счетчиков уведомлений
// Это позволит разным компонентам синхронизировать свое состояние
export const NotificationEvents = {
  // Подписка на событие обновления уведомлений
  subscribe: (callback: () => void) => {
    document.addEventListener('notification-update', callback);
    return () => document.removeEventListener('notification-update', callback);
  },
  
  // Вызов события обновления уведомлений
  emit: () => {
    document.dispatchEvent(new CustomEvent('notification-update'));
  }
};

export default function NotificationSidebar() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Функция для загрузки непрочитанных уведомлений
  const fetchUnreadNotifications = async () => {
    try {
      setLoading(true)
      const data = await getUnreadNotifications()
      setUnreadCount(data.length)
    } catch (error) {
      console.error("Ошибка загрузки уведомлений:", error)
    } finally {
      setLoading(false)
    }
  }
  
  // Загружаем уведомления при первой загрузке и настраиваем обновление
  useEffect(() => {
    fetchUnreadNotifications()
    
    // Устанавливаем интервал для периодической проверки новых уведомлений
    const interval = setInterval(() => {
      fetchUnreadNotifications()
    }, 60000) // Проверка каждую минуту
    
    // Подписка на событие обновления уведомлений
    const unsubscribe = NotificationEvents.subscribe(() => {
      fetchUnreadNotifications()
    });
    
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  // Если нет непрочитанных уведомлений или идёт загрузка, ничего не показываем
  if (loading || unreadCount === 0) return null;
  
  return (
    <Badge 
      variant="destructive"
      className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
    >
      {unreadCount}
    </Badge>
  )
} 
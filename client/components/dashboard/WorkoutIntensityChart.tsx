"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { format, subDays, isSameDay, isValid } from "date-fns"
import { ru } from "date-fns/locale"

interface Workout {
  id: string
  duration: number
  calories: number
  createdAt: string
}

interface IntensityItem {
  day: string
  date: string
  intensity: number
  count: number
}

interface ChartDataItem {
  date: string
  fullDate: Date
  intensity: number
  count: number
}

interface WorkoutIntensityChartProps {
  workouts: Workout[] | IntensityItem[]
}

export function WorkoutIntensityChart({ workouts }: WorkoutIntensityChartProps) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [activePoint, setActivePoint] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  useEffect(() => {
    if (!workouts || workouts.length === 0) {
      // Если нет данных, создаем пустые данные для последних 7 дней
      const emptyData = Array.from({ length: 7 }).map((_, index) => {
        const date = subDays(new Date(), 6 - index)
        return {
          date: format(date, 'd MMM', { locale: ru }),
          fullDate: date,
          intensity: 0,
          count: 0
        }
      })
      setChartData(emptyData)
      return
    }
    
    // Проверяем, какой формат данных нам передали
    if ('day' in workouts[0] && 'intensity' in workouts[0]) {
      // Это уже готовые данные IntensityItem[]
      const intensityData = (workouts as IntensityItem[]).map(item => ({
        date: item.date,
        fullDate: new Date(), // Это значение не используется для отображения
        intensity: item.intensity,
        count: item.count
      }))
      setChartData(intensityData)
    } else {
      // Это исходные данные о тренировках, нужно преобразовать
      const last7Days = Array.from({ length: 7 }).map((_, index) => {
        const date = subDays(new Date(), 6 - index)
        const dayWorkouts = (workouts as Workout[]).filter(workout => {
          // Проверяем валидность даты
          if (!workout.createdAt || typeof workout.createdAt !== 'string' || workout.createdAt === 'Invalid Date') {
            return false;
          }
          try {
            const workoutDate = new Date(workout.createdAt);
            return isValid(workoutDate) && isSameDay(workoutDate, date);
          } catch (error) {
            return false;
          }
        })
        
        return {
          date: format(date, 'd MMM', { locale: ru }),
          fullDate: date,
          intensity: dayWorkouts.reduce((sum, workout) => sum + (workout.calories || 0), 0),
          count: dayWorkouts.length
        }
      })
      
      setChartData(last7Days)
    }
  }, [workouts])
  
  // Находим максимальное значение для масштабирования
  const maxIntensity = Math.max(...chartData.map(d => d.intensity), 100)
  
  // Обработчик наведения на точку графика
  const handlePointHover = (index: number, event: React.MouseEvent) => {
    setActivePoint(index)
    
    // Получаем координаты для отображения тултипа
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    })
  }
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 relative">
        {/* График */}
        <div className="absolute inset-0 flex items-end justify-between p-4">
          {chartData.map((data, index) => {
            // Вычисляем высоту столбца в зависимости от интенсивности
            const height = data.intensity > 0 
              ? Math.max(15, (data.intensity / maxIntensity) * 100) 
              : 0
              
            return (
              <div 
                key={index}
                className="flex flex-col items-center justify-end h-full"
                style={{ width: `${100 / chartData.length - 2}%` }}
              >
                {/* Столбец графика */}
                <div 
                  className={`
                    relative w-full rounded-t-md transition-all duration-300
                    ${activePoint === index ? 'bg-primary' : 'bg-primary/60'}
                  `}
                  style={{ 
                    height: `${height}%`,
                    minHeight: data.intensity > 0 ? '15px' : '0'
                  }}
                  onMouseEnter={(e) => handlePointHover(index, e)}
                  onMouseLeave={() => setActivePoint(null)}
                >
                  {/* Кружок в верхней части столбца */}
                  <div 
                    className={`
                      absolute -top-2 left-1/2 transform -translate-x-1/2
                      w-4 h-4 rounded-full 
                      transition-opacity duration-300
                      ${activePoint === index ? 'opacity-100' : 'opacity-0'}
                      ${data.intensity > 0 ? 'bg-primary border-2 border-white' : 'hidden'}
                    `}
                  />
                </div>
                
                {/* Метка дня */}
                <div className="mt-2 text-xs text-center font-medium">
                  {data.date}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Тултип при наведении */}
        {activePoint !== null && chartData[activePoint]?.intensity > 0 && (
          <div 
            className={`
              absolute bg-background border border-border rounded-lg shadow-lg p-2 z-10
              transition-opacity duration-200 text-xs font-medium
              ${isMobile ? 'top-0 left-1/2 transform -translate-x-1/2' : ''}
            `}
            style={
              isMobile 
                ? {} 
                : {
                    left: `${(activePoint / (chartData.length - 1)) * 100}%`,
                    top: `${100 - (chartData[activePoint].intensity / maxIntensity) * 100 - 10}%`,
                    transform: 'translate(-50%, -100%)'
                  }
            }
          >
            <div className="flex flex-col items-center">
              <div className="text-sm font-bold mb-1">
                {chartData[activePoint].date}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Интенсивность:</span>
                <span className="font-medium">{Math.round(chartData[activePoint].intensity)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Тренировок:</span>
                <span className="font-medium">{chartData[activePoint].count}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
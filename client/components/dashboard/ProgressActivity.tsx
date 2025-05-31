"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns"
import { ru } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface Workout {
  id: string
  name: string
  duration: number
  calories: number
  createdAt: string
  type: string
}

interface ProgressActivityProps {
  workouts: Workout[]
  period?: 'week' | 'month'
}

export function ProgressActivity({ workouts, period = 'week' }: ProgressActivityProps) {
  // Данные для отображения на графике
  const [chartData, setChartData] = useState<{
    day: string
    date: Date
    value: number
    highlight: boolean
    workout?: Workout
  }[]>([])
  
  // Настройки отображения
  const [highlightDay, setHighlightDay] = useState<string | null>(null)
  
  // Создаем SVG path для плавной кривой
  const createPath = (points: { x: number, y: number }[]) => {
    if (points.length < 2) return "";

    const path = [];
    path.push(`M ${points[0].x} ${points[0].y}`);

    // Используем Bezier кривые для сглаживания
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Контрольные точки - на 1/3 и 2/3 расстояния между точками
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      const cp2y = next.y;
      
      path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`);
    }

    return path.join(" ");
  };

  useEffect(() => {
    // Получаем текущую неделю
    const today = new Date();
    const startDay = startOfWeek(today, { weekStartsOn: 1 }); // Неделя начинается с понедельника
    
    // Формируем данные для дней недели
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startDay, i);
      const dayShort = format(date, 'EEE', { locale: ru }); // Короткое название дня
      
      // Находим тренировки за этот день
      const dayWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.createdAt);
        return isSameDay(workoutDate, date);
      });
      
      // Определяем прогресс дня
      let value = 0;
      let highlightWorkout;
      
      if (dayWorkouts.length > 0) {
        // Если есть тренировки, рассчитываем прогресс
        const totalDuration = dayWorkouts.reduce((sum, w) => sum + w.duration, 0);
        const totalCalories = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
        
        // Значение рассчитываем как процент от целевых показателей
        // Можно настроить по вашим предпочтениям
        value = Math.min(100, (totalDuration * 0.5) + (totalCalories * 0.01));
        
        // Берем самую долгую тренировку для отображения
        highlightWorkout = dayWorkouts.reduce((prev, current) => 
          prev.duration > current.duration ? prev : current
        );
      } else {
        // Если нет тренировок, создаем волнообразный паттерн для визуализации
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
        value = 20 + Math.sin(dayIndex * 1.5) * 15;
      }
      
      return {
        day: dayShort,
        date,
        value,
        highlight: isToday(date),
        workout: highlightWorkout
      };
    });
    
    setChartData(days);
    
    // Устанавливаем текущий день для выделения
    const todayName = format(today, 'EEE', { locale: ru });
    setHighlightDay(todayName);
  }, [workouts]);
  
  // Текущая подсвеченная тренировка
  const highlightedDay = chartData.find(day => day.highlight);
  const highlightedValue = highlightedDay?.value || 0;
  const highlightedWorkout = highlightedDay?.workout;
  
  // Преобразуем данные для создания SVG path
  const chartPoints = chartData.map((day, index) => ({
    x: (index / (chartData.length - 1)) * 100,
    y: 100 - day.value // Инвертируем Y, т.к. в SVG 0 сверху
  }));
  
  // Path для основной линии
  const linePath = createPath(chartPoints);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-semibold">Ваш прогресс</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">За неделю</Badge>
          <div className="text-xl font-bold text-primary">{Math.round(highlightedValue)}%</div>
        </div>
      </div>
      
      {highlightedWorkout && (
        <div className="mb-4">
          <div className="flex items-center gap-1">
            <p className="text-sm text-muted-foreground">
              {format(highlightedDay?.date || new Date(), 'E, dd MMM', { locale: ru })}:
            </p>
            <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
              {highlightedWorkout.name}
            </Badge>
          </div>
        </div>
      )}
      
      <div className="relative flex-1">
        {/* График с плавной кривой */}
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          {/* Заливка под графиком */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(var(--primary), 0.3)" />
              <stop offset="100%" stopColor="rgba(var(--primary), 0)" />
            </linearGradient>
          </defs>
          
          {/* Заливка под кривой */}
          <path 
            d={`${linePath} L 100,100 L 0,100 Z`} 
            fill="url(#gradient)" 
          />
          
          {/* Линия графика */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="rgba(var(--primary), 0.8)" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          
          {/* Точки с тренировками */}
          {chartData.map((day, index) => {
            if (day.workout) {
              const x = (index / (chartData.length - 1)) * 100;
              const y = 100 - day.value;
              
              return (
                <g key={index}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={day.highlight ? 3 : 2} 
                    fill={day.highlight ? "var(--primary)" : "rgba(var(--primary), 0.6)"}
                  />
                  {day.highlight && (
                    <rect 
                      x={x - 2} 
                      y={0} 
                      width={4} 
                      height={y} 
                      fill="rgba(var(--primary), 0.2)"
                      rx={1}
                    />
                  )}
                </g>
              );
            }
            return null;
          })}
        </svg>
        
        {/* Проценты */}
        <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-[10px] text-muted-foreground">
          <span>100%</span>
          <span>80%</span>
          <span>60%</span>
          <span>40%</span>
          <span>20%</span>
          <span>0%</span>
        </div>
      </div>
      
      {/* Дни недели */}
      <div className="flex justify-between mt-2">
        {chartData.map((day, index) => (
          <div 
            key={index} 
            className={`text-xs ${day.highlight ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
          >
            {day.day}
          </div>
        ))}
      </div>
    </div>
  );
} 
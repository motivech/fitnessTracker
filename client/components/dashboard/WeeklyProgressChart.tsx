"use client"

import { useState, useEffect } from "react"
import { format, parseISO, startOfWeek, addDays, isToday, isSameDay, getDay } from "date-fns"
import { ru } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface Workout {
  id: string
  name: string
  type: string
  duration: number
  calories: number
  createdAt: string
  status?: string
  completionPercentage?: number
}

interface WeeklyProgressChartProps {
  workouts: Workout[]
}

export function WeeklyProgressChart({ workouts }: WeeklyProgressChartProps) {
  const [weekData, setWeekData] = useState<{
    day: string;
    shortDay: string;
    date: Date;
    value: number;
    completed: number;
    scheduled: number;
    workout?: Workout;
  }[]>([])
  const [animationComplete, setAnimationComplete] = useState(false)
  const [highlightedDay, setHighlightedDay] = useState<number | null>(null)
  
  useEffect(() => {
    // Получаем текущую неделю
    const today = new Date();
    const startDay = startOfWeek(today, { weekStartsOn: 1 }); // Неделя начинается с понедельника
    
    // Формируем данные для каждого дня недели
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startDay, i);
      const dayName = format(date, 'EEEE', { locale: ru }); // Полное название дня
      const shortDayName = format(date, 'EEE', { locale: ru }); // Короткое название дня
      
      // Находим тренировки за этот день
      const dayWorkouts = workouts.filter(workout => {
        if (!workout.createdAt) return false;
        const workoutDate = new Date(workout.createdAt);
        return isSameDay(workoutDate, date);
      });
      
      // Вычисляем значение прогресса
      let value = Math.random() * 30 + 20; // Случайное значение от 20 до 50 для визуализации
      let workout = undefined;
      
      // Если есть тренировки, берем последнюю с наибольшим процентом выполнения
      if (dayWorkouts.length > 0) {
        workout = dayWorkouts.reduce((prev, current) => {
          const prevCompletion = prev.completionPercentage || 0;
          const currentCompletion = current.completionPercentage || 0;
          return currentCompletion > prevCompletion ? current : prev;
        });
        
        // Если у тренировки есть процент выполнения, используем его
        if (workout.completionPercentage) {
          value = workout.completionPercentage;
        } else {
          // Иначе рассчитываем на основе длительности и калорий
          value = Math.min(100, (workout.duration * 0.5) + (workout.calories * 0.01));
        }
      }
      
      // Подсчитываем выполненные и запланированные тренировки
      const completed = dayWorkouts.filter(w => w.status === 'COMPLETED').length;
      const scheduled = dayWorkouts.filter(w => w.status !== 'COMPLETED').length;
      
      return {
        day: dayName,
        shortDay: shortDayName,
        date,
        value,
        completed,
        scheduled,
        workout: dayWorkouts.length > 0 ? workout : undefined,
      };
    });
    
    setWeekData(days);
    
    // Анимация при загрузке
    setTimeout(() => {
      setAnimationComplete(true);
    }, 300);
  }, [workouts]);
  
  // Находим текущий день и его прогресс
  const todayData = weekData.find(day => isToday(day.date));
  const currentProgress = todayData?.value || 0;
  
  // Создаем точки для графика
  const generatePoints = () => {
    if (!weekData || weekData.length === 0) return [];
    
    // Получаем исходные точки
    const points = weekData.map((day, i) => ({
      x: i * (100 / 6), // равномерно распределяем по ширине (7 дней)
      y: 100 - day.value // инвертируем значения для SVG (0 вверху)
    }));
    
    return points;
  };
  
  const points = generatePoints();
  
  // Создаем SVG path для сектора
  const createSectorPath = (startAngle: number, endAngle: number, value: number) => {
    // Центр окружности
    const cx = 50;
    const cy = 50;
    
    // Радиус окружности
    const r = 40;
    
    // Конвертируем углы в радианы
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Координаты начальной и конечной точек дуги
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    
    // Флаг для определения большой дуги
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    // Путь для сектора
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-primary opacity-70">Текущий прогресс</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold">{Math.round(currentProgress)}%</p>
            <span className="text-xs text-muted-foreground">сегодня</span>
          </div>
        </div>
      </div>
      
      {/* Основной график */}
      <div className="flex-1 flex justify-center items-center">
        <div className="relative w-full max-w-[200px] h-[200px] flex items-center justify-center">
          {/* Круговой график */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Фоновый круг */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            
            {/* Активный сектор */}
            <path
              d={createSectorPath(0, (currentProgress / 100) * 360, currentProgress)}
              fill="hsl(var(--primary))"
              className="transition-all duration-500"
              style={{
                opacity: animationComplete ? 1 : 0,
                transform: `scale(${animationComplete ? 1 : 0.9})`,
                transformOrigin: 'center',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
              }}
            />
            
            {/* Центральный текст */}
            <text
              x="50"
              y="46"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              fontSize="14"
              fontWeight="bold"
              className="select-none"
            >
              {Math.round(currentProgress)}%
            </text>
            <text
              x="50"
              y="58"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="6"
              className="select-none"
            >
              прогресс
            </text>
          </svg>
          
          {/* Дни недели вокруг графика */}
          {weekData.map((day, index) => {
            const isActive = isToday(day.date);
            const angle = (index * (360 / 7) - 90) * Math.PI / 180;
            const x = 50 + 54 * Math.cos(angle);
            const y = 50 + 54 * Math.sin(angle);
            
            return (
              <div
                key={index}
                className={`absolute text-[10px] font-medium select-none
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: animationComplete ? 1 : 0,
                  transition: `opacity 0.3s ease-out ${index * 0.05 + 0.3}s`
                }}
              >
                {day.shortDay}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
"use client"

import React, { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WORKOUT_TYPE_REVERSE_MAP } from "@/lib/constants"

interface Workout {
  id: string
  type: string
}

interface PieChartItem {
  name: string
  value: number
}

interface WorkoutTypeChartProps {
  workouts: Workout[] | PieChartItem[]
}

// Цвета для типов тренировок
const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];

export function WorkoutTypeChart({ workouts }: WorkoutTypeChartProps) {
  const [chartData, setChartData] = useState<PieChartItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    // Проверяем, какой формат данных нам передали
    if (workouts && workouts.length > 0 && 'name' in workouts[0] && 'value' in workouts[0]) {
      // Это уже готовые данные PieChartItem[]
      setChartData(workouts as PieChartItem[])
    } else if (workouts && workouts.length > 0) {
      // Это сырые данные о тренировках, нужно преобразовать
      const typeCounts: Record<string, number> = {};
      
      // Подсчитываем количество тренировок каждого типа
      (workouts as Workout[]).forEach(workout => {
        const type = workout.type || 'custom';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      // Преобразуем в формат для диаграммы
      const data = Object.entries(typeCounts).map(([type, count]) => ({
        name: WORKOUT_TYPE_REVERSE_MAP[type] || type,
        value: count,
      }));
      
      setChartData(data);
    } else {
      // Если нет данных, создаем пустой набор
      setChartData([
        { name: 'Нет данных', value: 0 }
      ])
    }
  }, [workouts]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
    setIsHovered(true);
  };
  
  const onPieLeave = () => {
    setIsHovered(false);
  };

  // Рендеринг активного сектора с анимацией
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    
    const extraRadius = isHovered ? 7 : 0;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + extraRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="transition-all duration-200 ease-out"
          style={{ filter: isHovered ? 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))' : 'none' }}
        />
      </g>
    );
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={800}
              animationBegin={100}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Центральная метка */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-sm font-bold">
              {isHovered && chartData[activeIndex] 
                ? chartData[activeIndex].name 
                : 'Всего'
              }
            </div>
            <div className="text-2xl font-black">
              {isHovered && chartData[activeIndex]
                ? chartData[activeIndex].value
                : chartData.reduce((sum, item) => sum + item.value, 0)
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Легенда */}
      <div className="flex flex-wrap justify-center gap-2 p-2 mt-3">
        {chartData.map((entry, index) => (
          <Badge 
            key={index}
            variant="outline"
            className={`
              transition-all duration-200 px-2 py-1
              ${index === activeIndex && isHovered 
                ? 'bg-primary/20 border-primary' 
                : 'border-border'
              }
            `}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="text-xs">{entry.name}</span>
          </Badge>
        ))}
      </div>
    </div>
  )
} 
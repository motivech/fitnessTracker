"use client"

import { useState } from "react"

interface ActivityChartProps {
  data: {
    day: string
    value: number
  }[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  // Находим максимальное значение для масштабирования
  const maxValue = Math.max(...data.map(d => d.value), 10);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <div className="w-full h-full pt-8 relative flex flex-col">
      <div className="flex-1 relative">
        {/* Фоновая сетка */}
        <div className="absolute inset-0 grid grid-cols-1 grid-rows-5 gap-0 pointer-events-none z-0">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div 
              key={i} 
              className="border-t border-border/30 w-full"
            />
          ))}
        </div>
        
        <div className="relative z-10 grid grid-cols-7 gap-4 h-full px-4">
          {data.map((item, i) => {
            const isHovered = hoveredIndex === i;
            const barHeight = `${(item.value / maxValue) * 85}%`;
            const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
            
            return (
              <div 
                key={i} 
                className="flex flex-col items-center h-full" 
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="w-full relative flex-1 flex flex-col-reverse">
                  {/* Фоновая прямоугольная область */}
                  <div className="absolute bottom-0 left-0 right-0 bg-muted/10 rounded-md h-full" />
                  
                  {/* Показатель активности */}
                  <div 
                    className={`
                      relative w-full 
                      transition-all duration-300 
                      rounded-md shadow-sm
                      ${isToday 
                        ? 'bg-gradient-to-t from-primary to-primary/60' 
                        : 'bg-gradient-to-t from-primary/80 to-primary/40'
                      }
                      ${isHovered ? 'scale-105' : 'scale-100'}
                    `}
                    style={{ 
                      height: barHeight,
                      transform: `scaleY(${isHovered ? 1.05 : 1})`,
                      transformOrigin: 'bottom'
                    }}
                  >
                    {/* Подсветка при наведении */}
                    <div className={`
                      absolute inset-0 bg-white/10 rounded-md 
                      transition-opacity duration-300
                      ${isHovered ? 'opacity-100' : 'opacity-0'}
                    `} />
                    
                    {/* Значение над столбцом */}
                    {(isHovered || item.value > maxValue * 0.6) && (
                      <div className={`
                        absolute -top-7 left-1/2 transform -translate-x-1/2
                        bg-card border border-border rounded-lg py-1 px-2 
                        text-xs font-medium shadow-md z-10
                        transition-all duration-300
                        ${isHovered ? 'opacity-100 scale-100' : 'opacity-75 scale-90'}
                      `}>
                        {Math.round(item.value)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Дни недели под столбцами */}
      <div className="h-6 grid grid-cols-7 gap-4 px-4 mt-2">
        {data.map((item, i) => {
          const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
          return (
            <div 
              key={i} 
              className={`
                text-center font-medium text-xs
                transition-colors duration-300
                ${isToday ? 'text-primary' : 'text-muted-foreground'}
                ${hoveredIndex === i ? 'text-foreground' : ''}
              `}
            >
              {item.day}
            </div>
          );
        })}
      </div>
      
      {/* Метки процентов */}
      <div className="absolute top-0 left-2 bottom-8 w-8 flex flex-col justify-between text-[10px] text-muted-foreground pointer-events-none">
        <div className="text-right pr-1">100%</div>
        <div className="text-right pr-1">75%</div>
        <div className="text-right pr-1">50%</div>
        <div className="text-right pr-1">25%</div>
        <div className="text-right pr-1">0%</div>
      </div>
    </div>
  )
} 
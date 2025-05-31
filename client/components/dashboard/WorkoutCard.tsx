"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface WorkoutCardProps {
  workout: {
    id: string
    name: string
    duration: string
    calories: number
    date: string
    durationMinutes?: number
    caloriesBurned?: number
  }
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <div className="flex items-center p-3 border rounded-lg hover:bg-slate-50">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
        <span className="text-lg">🏋️‍♂️</span>
      </div>
      <div className="flex-grow">
        <h3 className="font-medium">{workout.name}</h3>
        <div className="text-sm text-gray-500">
          {workout.durationMinutes || workout.duration || 0} мин • {workout.caloriesBurned || workout.calories || 0} ккал
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/dashboard/workouts/${workout.id}`}>
          Подробнее
        </Link>
      </Button>
    </div>
  )
} 
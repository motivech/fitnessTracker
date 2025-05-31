"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GoalData {
  label: string
  current: number
  max: number
  unit: string
}

interface GoalProgressProps {
  title: string
  goals: GoalData[]
}

export function GoalProgress({ title, goals }: GoalProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const percentage = (goal.current / goal.max) * 100
            return (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{goal.label}</span>
                  <span className="text-sm">
                    {goal.current} / {goal.max} {goal.unit}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 
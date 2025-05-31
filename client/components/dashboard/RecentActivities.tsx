"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Activity {
  type: string
  amount?: string
  name?: string
  time: string
}

interface RecentActivitiesProps {
  activities: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние активности</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">
                    {item.type === 'water' ? '💧' : '🍎'}
                  </span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">
                    {item.type === 'water' 
                      ? `Выпито воды (${item.amount})` 
                      : item.name}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {item.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              Нет последних активностей
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
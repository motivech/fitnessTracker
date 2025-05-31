"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Dumbbell, 
  Calendar, 
  Award, 
  User,
  Bell
} from "lucide-react"
import NotificationSidebar from "@/components/ui/notification-sidebar"

const navItems = [
  {
    name: "Главная",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: "Тренировки",
    href: "/workouts",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    name: "Календарь",
    href: "/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    name: "Достижения",
    href: "/achievements",
    icon: <Award className="h-5 w-5" />,
  },
  {
    name: "Уведомления",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    name: "Профиль",
    href: "/profile",
    icon: <User className="h-5 w-5" />,
  },
]

export function MobileNavBar() {
  const pathname = usePathname()
  
  // Проверяем, нужно ли отображать навигацию
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register")
  if (isAuthPage) return null
  
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                        (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative"
            >
              <div 
                className={cn(
                  "flex flex-col items-center justify-center",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full transition-all relative",
                  isActive && "bg-primary/10"
                )}>
                  {item.icon}
                  {item.href === "/notifications" && <NotificationSidebar />}
                </div>
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </div>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 
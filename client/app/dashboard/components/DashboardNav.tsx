"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Dumbbell, 
  BarChart3, 
  User, 
  LogOut, 
  Calendar, 
  Award, 
  ListChecks,
  X,
  Bell
} from "lucide-react"
import NotificationSidebar from "@/components/ui/notification-sidebar"

const navLinks = [
  {
    name: "Дашборд",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: "Тренировки",
    href: "/workouts",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  {
    name: "Программы",
    href: "/programs",
    icon: <ListChecks className="h-5 w-5" />,
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

interface DashboardNavProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

export function DashboardNav({ isMobile, closeMobileMenu }: DashboardNavProps = {}) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex h-14 items-center border-b px-6 justify-between">
        <Link href="/" className="flex items-center font-semibold text-lg">
          FitTracker
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto py-6 px-4">
        <nav className="flex flex-col space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || 
                           (link.href !== "/dashboard" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
                onClick={isMobile ? closeMobileMenu : undefined}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  <span>{link.name}</span>
                </div>
                {link.href === "/notifications" && <NotificationSidebar />}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => {
            logout();
            if (isMobile && closeMobileMenu) closeMobileMenu();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </aside>
  )
} 
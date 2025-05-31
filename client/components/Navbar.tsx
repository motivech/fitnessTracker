"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Home, 
  Dumbbell, 
  User, 
  Menu, 
  LogIn,
  Calendar,
  Award,
  ListChecks,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import NotificationDropdown from "@/components/ui/notification-dropdown"

const NavLinks = [
  {
    href: "/dashboard",
    label: "Дашборд",
    icon: <Home className="h-4 w-4 mr-2" />
  },
  {
    href: "/workouts",
    label: "Тренировки",
    icon: <Dumbbell className="h-4 w-4 mr-2" />
  },
  {
    href: "/programs",
    label: "Программы",
    icon: <ListChecks className="h-4 w-4 mr-2" />
  },
  {
    href: "/calendar",
    label: "Календарь",
    icon: <Calendar className="h-4 w-4 mr-2" />
  },
  {
    href: "/achievements",
    label: "Достижения",
    icon: <Award className="h-4 w-4 mr-2" />
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold">
            FitTracker
          </Link>
          
          {/* Десктопное меню */}
          <div className="hidden md:flex gap-6">
            {NavLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={`text-sm font-medium flex items-center transition-colors hover:text-primary ${isActive(link.href) ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Действия */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar-placeholder.jpg" alt={user.firstName} />
                      <AvatarFallback>
                        {user.firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Профиль</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/calendar" className="flex items-center cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Расписание</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/achievements" className="flex items-center cursor-pointer">
                      <Award className="mr-2 h-4 w-4" />
                      <span>Достижения</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4 rotate-180" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="default">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Link>
            </Button>
          )}
          
          {/* Мобильное меню */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>FitTracker</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <nav className="flex flex-col gap-3">
                    {NavLinks.map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href}
                        className={`px-4 py-2 rounded-md flex items-center ${isActive(link.href) ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    ))}
                    <Link 
                      href="/profile"
                      className={`px-4 py-2 rounded-md flex items-center ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Профиль
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
} 
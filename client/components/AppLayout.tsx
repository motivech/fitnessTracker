"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { DashboardNav } from "@/app/dashboard/components/DashboardNav"
import { MobileNavBar } from "@/components/MobileNavBar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register")
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Определяем, является ли экран мобильным
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // Закрываем мобильное меню при изменении маршрута
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  if (isAuthPage) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Десктопное меню (видимое только на больших экранах) */}
      <div className={cn(
        "fixed inset-y-0 z-20 bg-background transition-transform lg:translate-x-0",
        "hidden lg:block w-64 border-r"
      )}>
        <DashboardNav />
      </div>

      {/* Мобильная кнопка меню */}
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-background shadow-md"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Мобильное выдвижное меню */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[80vw]">
          <DashboardNav isMobile={true} closeMobileMenu={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Мобильная нижняя навигация */}
      <MobileNavBar />

      {/* Основной контент */}
      <main className={cn(
        "flex-1 transition-all",
        isMobile ? "ml-0 px-4 pb-20" : "ml-64"
      )}>
        {children}
      </main>
    </div>
  )
} 
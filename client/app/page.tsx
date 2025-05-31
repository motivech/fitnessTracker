"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Фитнес-приложение</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/auth/login" className="text-gray-600 hover:text-blue-600">
              Войти
            </Link>
            <Link href="/auth/register" className="text-gray-600 hover:text-blue-600">
              Регистрация
            </Link>
          </nav>
          <div className="flex space-x-2 md:hidden">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Войти</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Регистрация</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4 md:p-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Фитнес-приложение
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl">
          Отслеживайте тренировки, принимайте вызовы, достигайте целей и
          поддерживайте здоровый образ жизни.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth/register">
            <Button className="px-8 py-6 text-lg" size="lg">
              Регистрация
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button className="px-8 py-6 text-lg" variant="outline" size="lg">
              Вход
            </Button>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-12 px-4 md:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Возможности приложения
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Отслеживание тренировок"
              description="Записывайте свои тренировки, отслеживайте прогресс и анализируйте результаты."
              icon="🏋️‍♂️"
              href="/dashboard/workouts"
            />
            <FeatureCard
              title="Активность"
              description="Отслеживайте свою активность, шаги, дистанцию и сожженные калории."
              icon="📊"
              href="/dashboard/activity"
            />
            <FeatureCard
              title="Личный профиль"
              description="Управляйте настройками профиля, устанавливайте цели и отслеживайте прогресс."
              icon="👤"
              href="/dashboard/profile"
            />
            <FeatureCard
              title="Мониторинг здоровья"
              description="Следите за показателями здоровья и видите динамику изменений."
              icon="❤️"
              href="/dashboard/health"
            />
            <FeatureCard
              title="Статистика и аналитика"
              description="Анализируйте свой прогресс с помощью детальной статистики и графиков."
              icon="📈"
              href="/dashboard/analytics"
            />
            <FeatureCard
              title="Персонализация"
              description="Настраивайте приложение под свои цели и предпочтения."
              icon="⚙️"
              href="/dashboard/settings"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Фитнес-приложение</h3>
              <p className="text-gray-300">
                Ваш персональный помощник для достижения фитнес-целей
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Ссылки</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/login" className="text-gray-300 hover:text-white">
                    Вход
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-gray-300 hover:text-white">
                    Регистрация
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-300 hover:text-white">
                    Дашборд
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Функции</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/workouts" className="text-gray-300 hover:text-white">
                    Тренировки
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/activity" className="text-gray-300 hover:text-white">
                    Активность
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/profile" className="text-gray-300 hover:text-white">
                    Профиль
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <p className="text-gray-300">
                Поддержка: support@fitness-app.com
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p>© 2025 Фитнес-приложение. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  icon,
  href,
}: {
  title: string
  description: string
  icon: string
  href: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 mb-4">{description}</p>
      <Link href={href}>
        <Button variant="outline" size="sm">Подробнее</Button>
      </Link>
    </div>
  )
} 
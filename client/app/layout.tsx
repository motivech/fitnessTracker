"use client"

import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/providers/auth-provider'
import { ExperienceProvider } from '@/contexts/ExperienceContext'
import { Toaster } from '@/components/ui/toaster'
import AppLayout from '@/components/AppLayout'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          <ExperienceProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </ExperienceProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 
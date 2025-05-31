import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_URL } from "@/lib/constants";

interface AvatarWithFallbackProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

/**
 * Компонент аватара с исправлением пути к изображению и фоллбэком.
 * Автоматически добавляет базовый URL API для относительных путей.
 */
export function AvatarWithFallback({ 
  src, 
  alt = "", 
  fallback = "U", 
  className 
}: AvatarWithFallbackProps) {
  // Создаем полный URL для аватара, если путь начинается с /uploads
  const fullSrc = src && src.startsWith("/uploads") 
    ? `${API_URL}${src}` 
    : src;
  
  // Берем первую букву от alt текста для фоллбэка
  const fallbackText = alt ? alt.charAt(0).toUpperCase() : fallback;

  return (
    <Avatar className={className}>
      {fullSrc ? (
        <AvatarImage 
          src={fullSrc} 
          alt={alt} 
          onError={(e) => {
            console.log("Ошибка загрузки аватара:", fullSrc);
            // Можно добавить дополнительную логику при ошибке загрузки
          }}
        />
      ) : null}
      <AvatarFallback>
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
} 
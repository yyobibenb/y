import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getLanguage } from "./i18n"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Функция для получения правильной локали на основе выбранного языка
export function getLocaleForDateFormatting(): string {
  const language = getLanguage();
  switch (language) {
    case 'th':
      return 'th-TH';
    case 'en':
      return 'en-US';
    default:
      return 'th-TH';
  }
}

// Функция для отображения даты с фиксированным годом 2025 (только дата без времени)
export function formatDateWith2025(dateString: string, locale: string = 'ru-RU', options?: Intl.DateTimeFormatOptions) {
  const date = new Date(dateString);
  // Устанавливаем год в 2025
  date.setFullYear(2025);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Europe/Moscow',
    ...options
  };
  
  return date.toLocaleDateString(locale, defaultOptions);
}

// Функция для получения текущей даты в формате YYYY-MM-DD с годом 2025
export function getCurrentDateWith2025(): string {
  const today = new Date();
  const year = 2025;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

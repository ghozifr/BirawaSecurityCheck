import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCookies (cookieName: string) {
  const cookiesJar = `; ${document.cookie}`
  const cookieFilter = cookiesJar.split(`; ${cookieName}=`)[1]
  if (cookieFilter) {
    const cookie = cookieFilter.split(';').shift()
    // console.log(`Cookie (${cookieName})`, cookie) //Debug.
    return cookie
  }
}

export function getAccessToken () {
  return getCookies ('accessToken')
}

export function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function getCurrentDate (): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Month is 0-based
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
};

export const parseTimeToMinutes = (time: string): number => {
  if (!time) return 0
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
};

export const formatMinutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0")
  const mins = (minutes % 60).toString().padStart(2, "0")
  return `${hours}:${mins}`
}

export function formatDate(inputDate: string): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  // Parse the input date
  const date = new Date(inputDate);

  // Extract date components
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Format the time components
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format

  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
}

export function formatMitraInitials(name: string) {
  const nameParts = name.split(' ');  // Pisahkan nama berdasarkan spasi
  const initials = nameParts
    .map(part => part.charAt(0).toUpperCase())  // Ambil huruf pertama dari setiap kata
    .join('');  // Gabungkan menjadi satu string

  return initials.substring(0, 1)+initials.substring(initials.length-1, initials.length);  // Ambil tiga huruf pertama
}

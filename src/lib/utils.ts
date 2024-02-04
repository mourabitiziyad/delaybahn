import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPeriod(totalSeconds: number): string {
  const secondsInADay = 86400;
  const secondsInAnHour = 3600;
  const secondsInAMinute = 60;

  const days = Math.floor(totalSeconds / secondsInADay);
  totalSeconds %= secondsInADay; // Remaining seconds after calculating days
  const hours = Math.floor(totalSeconds / secondsInAnHour);
  totalSeconds %= secondsInAnHour; // Remaining seconds after calculating hours
  const minutes = Math.floor(totalSeconds / secondsInAMinute);
  const seconds = totalSeconds % secondsInAMinute; // Remaining seconds

  let result = "";
  if (days > 0) {
    result += `${days} day${days > 1 ? "s" : ""} `;
  }
  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? "s" : ""} `;
  }
  if (minutes > 0) {
    result += `${minutes} minute${minutes > 1 ? "s" : ""} `;
  }
  if (seconds > 0 || result === "") {
    // Include seconds if it's the only unit or add to existing units
    result += `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  return result.trim(); // Trim any extra whitespace from the ends
}
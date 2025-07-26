import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Concatenate class names intelligently:
 *   cn("px-2", condition && "hidden") → "px-2"
 * Tailwind-merge removes conflicting duplicates.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

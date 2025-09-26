import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as helpers from "@/core/utils/helpers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export all helpers for backward compatibility
export { helpers };

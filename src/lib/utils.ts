import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function creditsToUsd(credits: number): string {
  return `$${(credits / 100).toFixed(2)}`;
}

export function formatCredits(credits: number): string {
  return credits.toLocaleString();
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export const CREDITS_PER_DOLLAR = 100;
export const WITHDRAWAL_THRESHOLD_CREDITS = 2000;
export const SUBMIT_WINDOW_SECONDS = 300;
export const T3_VERIFICATION_HOURS = 72;
export const BRAND_COOLDOWN_DAYS = 3;

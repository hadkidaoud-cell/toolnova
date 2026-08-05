"use client";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let handler: ((toast: ToastItem) => void) | null = null;

export function setToastHandler(fn: ((toast: ToastItem) => void) | null) {
  handler = fn;
}

export function toast(message: string, type: ToastType = "success") {
  handler?.({ id: Date.now() + Math.random(), message, type });
}

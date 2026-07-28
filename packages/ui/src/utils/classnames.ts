import { ComponentSize } from "../types";

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function sizeClasses(size: ComponentSize): string {
  const sizes: Record<ComponentSize, string> = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    xl: "px-6 py-3 text-lg",
  };
  return sizes[size];
}

export function inputSizeClasses(size: ComponentSize): string {
  const sizes: Record<ComponentSize, string> = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
    xl: "px-4 py-3 text-lg",
  };
  return sizes[size];
}

export function avatarSizeClasses(size: ComponentSize): string {
  const sizes: Record<ComponentSize, string> = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
  };
  return sizes[size];
}

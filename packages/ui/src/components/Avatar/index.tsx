import { AvatarProps } from "../../types";
import { cn, avatarSizeClasses } from "../../utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  shape = "circle",
  children,
  className,
  testId,
}: AvatarProps) {
  const initials = name ? getInitials(name) : "?";
  const bgColor = name ? getColorFromName(name) : "bg-neutral-400";

  return (
    <div
      data-testid={testId}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        avatarSizeClasses(size),
        shape === "circle" ? "rounded-full" : "rounded-lg",
        !src && bgColor,
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-medium text-white">{initials}</span>
      )}
      {children}
    </div>
  );
}

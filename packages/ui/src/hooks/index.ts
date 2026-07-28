import { useState, useCallback, useRef, useEffect } from "react";

export function useToggle(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

export function useClickOutside(handler: () => void): React.RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return ref;
}

export function useEscapeKey(handler: () => void): void {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    };

    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [handler]);
}

export function useId(prefix = "tn"): string {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substring(2, 9)}`);
  return id;
}

export function useLatest<T>(value: T): { current: T } {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

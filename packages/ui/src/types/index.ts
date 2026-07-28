import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ComponentVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning";
export type ColorScheme = "brand" | "gray" | "red" | "green" | "blue" | "yellow" | "purple";

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  testId?: string;
}

export interface ButtonProps extends BaseComponentProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "size"> {
  variant?: ComponentVariant;
  size?: ComponentSize;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export interface InputProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: ComponentSize;
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  isRequired?: boolean;
}

export interface TextareaProps extends BaseComponentProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: ComponentSize;
  label?: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  autoResize?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends BaseComponentProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: ComponentSize;
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  isRequired?: boolean;
}

export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  size?: ComponentSize;
}

export interface RadioProps extends BaseComponentProps {
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
  size?: ComponentSize;
}

export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: ComponentSize;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showClose?: boolean;
}

export interface DrawerProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}

export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export interface PopoverProps extends BaseComponentProps {
  trigger: ReactNode;
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export interface BadgeProps extends BaseComponentProps {
  variant?: "solid" | "subtle" | "outline";
  color?: ColorScheme;
  size?: ComponentSize;
}

export interface AlertProps extends BaseComponentProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  onClose?: () => void;
}

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  duration?: number;
  onClose?: (id: string) => void;
}

export interface CardProps extends BaseComponentProps {
  variant?: "elevated" | "outlined" | "filled";
  padding?: ComponentSize;
}

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: ComponentSize;
  shape?: "circle" | "square";
}

export interface TabsProps extends BaseComponentProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

export interface TabProps extends BaseComponentProps {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface AccordionProps extends BaseComponentProps {
  allowMultiple?: boolean;
  defaultValue?: string[];
}

export interface AccordionItemProps extends BaseComponentProps {
  value: string;
  title: string;
  disabled?: boolean;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: Array<{ label: string; href?: string; onClick?: () => void }>;
  separator?: ReactNode;
}

export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  siblingCount?: number;
}

export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode;
  items: Array<{ label: string; value?: string; onClick?: () => void; disabled?: boolean; divider?: boolean }>;
  align?: "start" | "center" | "end";
}

export interface SpinnerProps extends BaseComponentProps {
  size?: ComponentSize;
  color?: string;
}

export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: ComponentSize;
  color?: ColorScheme;
  showLabel?: boolean;
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular";
}

export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface ErrorStateProps extends BaseComponentProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export interface FileUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFilesChange?: (files: File[]) => void;
  disabled?: boolean;
}

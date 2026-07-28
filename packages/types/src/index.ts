export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  toolCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "user" | "guest";
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

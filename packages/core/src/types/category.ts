export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
  visible: boolean;
}

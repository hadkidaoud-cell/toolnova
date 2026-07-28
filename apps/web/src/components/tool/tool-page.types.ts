import { ReactNode } from "react";

export interface ToolPageProps {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  categorySlug: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  icon?: string;
  children: ReactNode;
  settings?: ReactNode;
  faq?: Array<{ question: string; answer: string }>;
  article?: {
    title: string;
    content: string;
  };
  relatedTools?: Array<{
    slug: string;
    name: string;
    description: string;
    icon?: string;
  }>;
}

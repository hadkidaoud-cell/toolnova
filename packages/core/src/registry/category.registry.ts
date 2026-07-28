import { Category } from "../types";
import { DEFAULT_CATEGORIES } from "../constants";
import { slugify } from "../utils";

export class CategoryRegistry {
  private categories: Map<string, Category> = new Map();

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults(): void {
    for (const cat of DEFAULT_CATEGORIES) {
      this.categories.set(cat.id, cat);
    }
  }

  register(category: Category): void {
    this.categories.set(category.id, category);
  }

  unregister(id: string): boolean {
    return this.categories.delete(id);
  }

  get(id: string): Category | undefined {
    return this.categories.get(id);
  }

  getBySlug(slug: string): Category | undefined {
    for (const cat of this.categories.values()) {
      if (cat.slug === slug) return cat;
    }
    return undefined;
  }

  getAll(): Category[] {
    return Array.from(this.categories.values())
      .filter((c) => c.visible)
      .sort((a, b) => a.order - b.order);
  }

  count(): number {
    return this.categories.size;
  }

  clear(): void {
    this.categories.clear();
  }

  fromName(name: string): Category {
    const id = slugify(name);
    const existing = this.get(id);
    if (existing) return existing;

    const cat: Category = {
      id,
      slug: id,
      name,
      description: "",
      order: this.categories.size + 1,
      visible: true,
    };
    this.register(cat);
    return cat;
  }
}

export const categoryRegistry = new CategoryRegistry();

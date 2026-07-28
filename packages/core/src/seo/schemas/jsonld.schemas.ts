import { JsonLdSchema, BreadcrumbItem } from "../seo.types";

export function createWebApplicationSchema(data: {
  name: string;
  description: string;
  url: string;
  image?: string;
  applicationCategory?: string;
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    applicationCategory: data.applicationCategory || "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function createSoftwareApplicationSchema(data: {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    applicationCategory: data.category || "UtilitiesApplication",
    operatingSystem: "Web",
  };
}

export function createArticleSchema(data: {
  title: string;
  description: string;
  url: string;
  image?: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    url: data.url,
    ...(data.image && { image: data.image }),
    author: {
      "@type": "Person",
      name: data.author,
    },
    datePublished: data.publishedAt,
    dateModified: data.updatedAt,
    publisher: {
      "@type": "Organization",
      name: "ToolNova",
      url: "https://toolnova.com",
    },
  };
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createCollectionPageSchema(data: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.name,
    description: data.description,
    url: data.url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.itemCount,
      itemListElement: [],
    },
  };
}

export function createFAQSchema(faqs: Array<{ question: string; answer: string }>): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function createOrganizationSchema(data: {
  name: string;
  url: string;
  logo?: string;
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
  };
}

export function createWebsiteSchema(data: {
  name: string;
  url: string;
  description?: string;
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
    ...(data.description && { description: data.description }),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${data.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

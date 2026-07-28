// ============================================================
// ToolNova Configuration
// ============================================================

export const siteConfig = {
  name: "ToolNova",
  shortName: "TN",
  slogan: "Every Tool. One Place.",
  sloganAr: "كل أداة تحتاجها... في مكان واحد.",
  description:
    "Discover hundreds of free online tools. Image editors, text processors, calculators, converters, and more.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og/default.png",
  creator: "ToolNova",
  keywords: ["online tools", "web tools", "free tools", "utilities", "productivity"],
} as const;

export const navigationConfig = {
  main: [
    { label: "Tools", href: "/tools" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

export const footerConfig = {
  sections: [
    {
      title: "Product",
      links: [
        { label: "All Tools", href: "/tools" },
        { label: "Pricing", href: "/pricing" },
        { label: "API", href: "/api-docs" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Help Center", href: "/help" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
} as const;

export const seoConfig = {
  titleTemplate: "%s | ToolNova",
  defaultTitle: "ToolNova - Every Tool. One Place.",
  defaultDescription:
    "Discover hundreds of free online tools. Image editors, text processors, calculators, converters, and more. Fast, free, and easy to use.",
} as const;

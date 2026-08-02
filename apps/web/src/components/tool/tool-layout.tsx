"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Heart,
  Flag,
  MessageCircle,
  Globe,
  Link2,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/tool/tool-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n";
import { getCategoryMeta, getToolMeta } from "@/lib/tool-catalog";

export interface ToolLayoutProps {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  categorySlug: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  icon?: string | ReactNode;
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

function Breadcrumb({ items }: { items: Array<{ label: string; href: string }> }) {
  const { dict } = useI18n();
  return (
    <nav aria-label={dict.toolLayout.breadcrumb} className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
        <li>
          <Link href="/" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400">
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <Link
              href={item.href}
              className="hover:text-brand-600 dark:hover:text-brand-400"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ToolHeader({ name, description, icon, category, categorySlug }: {
  name: string;
  description: string;
  icon?: string | ReactNode;
  category: string;
  categorySlug: string;
}) {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { dict } = useI18n();
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-xl text-white shadow-lg shadow-brand-500/20">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                <Link href={`/category/${categorySlug}`}>{category}</Link>
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
              {name}
            </h1>
            <p className="mt-1 text-base text-neutral-600 dark:text-neutral-400">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setLiked(!liked)}
                  className={cn(liked && "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400")}
                >
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{liked ? dict.toolLayout.saved : dict.toolLayout.saveTool}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={copyLink}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? dict.toolLayout.copied : dict.toolLayout.copyLink}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`, "_blank")}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{dict.toolLayout.shareOnX}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")}>
                  <Globe className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{dict.toolLayout.shareOnFacebook}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Flag className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{dict.toolLayout.reportIssue}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

function ToolSection({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <div id={id} className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}

function RelatedTools({ tools }: { tools: Array<{ slug: string; name: string; description: string; icon?: string }> }) {
  const { dict } = useI18n();
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{dict.toolLayout.relatedTools}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <ToolCard
            key={tool.slug}
            slug={tool.slug}
            name={tool.name}
            description={tool.description}
            compact
            delay={Math.min(i * 0.05, 0.2)}
          />
        ))}
      </div>
    </section>
  );
}

function FAQ({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { dict } = useI18n();

  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{dict.toolLayout.faq}</h2>
      <div className="mt-6 space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:text-white dark:hover:bg-neutral-800/50"
            >
              {item.question}
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200",
                  openIndex === i && "rotate-90"
                )}
              />
            </button>
            {openIndex === i && (
              <div className="border-t border-neutral-100 px-5 py-3.5 text-sm leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ArticleSection({ article }: { article: { title: string; content: string } }) {
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{article.title}</h2>      <div className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>{article.content}</p>
      </div>
    </section>
  );
}

function CommentsPlaceholder() {
  const { dict } = useI18n();
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{dict.toolLayout.comments}</h2>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
        <p className="text-neutral-600 dark:text-neutral-400">
          {dict.toolLayout.commentsComingSoon}
        </p>
      </div>
    </section>
  );
}

function Sidebar({ relatedTools }: { relatedTools?: Array<{ slug: string; name: string; description: string; icon?: string }> }) {
  const { dict } = useI18n();
  if (!relatedTools || relatedTools.length === 0) return null;

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">{dict.toolLayout.relatedTools}</h3>
          <div className="space-y-2">
            {relatedTools.slice(0, 5).map((tool) => {
              const meta = getToolMeta(tool.slug);
              const cat = meta ? getCategoryMeta(meta.category) : null;
              const Icon = meta?.icon;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="flex items-center gap-3 rounded-lg p-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                      cat ? cn("bg-gradient-to-br", cat.gradient) : "bg-brand-500"
                    )}
                  >
                    {Icon ? (
                      <Icon className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{tool.icon || "+"}</span>
                    )}
                  </div>
                  <span className="font-medium">{tool.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function ToolLayout({
  name,
  description,
  longDescription,
  category,
  categorySlug,
  breadcrumbs,
  icon,
  children,
  settings,
  faq,
  article,
  relatedTools,
}: ToolLayoutProps) {
  const { dict } = useI18n();
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbs} />

        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ToolHeader
                name={name}
                description={description}
                icon={icon}
                category={category}
                categorySlug={categorySlug}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
            >
              {children}

              {settings && (
                <ToolSection title={dict.toolLayout.settings} id="settings">
                  {settings}
                </ToolSection>
              )}
            </motion.div>

            {longDescription && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12"
              >
                <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{dict.toolLayout.aboutThisTool}</h2>
                  <p className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {longDescription}
                  </p>
                </div>
              </motion.section>
            )}

            {faq && faq.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <FAQ items={faq} />
              </motion.div>
            )}

            {article && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <ArticleSection article={article} />
              </motion.div>
            )}

            {relatedTools && relatedTools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <RelatedTools tools={relatedTools} />
              </motion.div>
            )}

            <CommentsPlaceholder />
          </div>

          <Sidebar relatedTools={relatedTools} />
        </div>
      </div>
    </div>
  );
}

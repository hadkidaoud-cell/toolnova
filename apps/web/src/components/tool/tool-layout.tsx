"use client";

import { ReactNode, useState } from "react";

export interface ToolLayoutProps {
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

function Breadcrumb({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm">
        <li>
          <a href="/" className="text-neutral-500 hover:text-brand-600 dark:text-neutral-400">
            Home
          </a>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <span className="text-neutral-400">/</span>
            <a href={item.href} className="text-neutral-500 hover:text-brand-600 dark:text-neutral-400">
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ToolHeader({ name, description, icon, category, categorySlug }: {
  name: string;
  description: string;
  icon?: string;
  category: string;
  categorySlug: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <span className="text-xl">{icon}</span>
          </div>
        )}
        <a
          href={`/category/${categorySlug}`}
          className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          {category}
        </a>
      </div>
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
        {name}
      </h1>
      <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
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
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Related Tools</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-brand-600"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
              <span className="text-lg font-bold">{tool.icon || "+"}</span>
            </div>
            <h3 className="font-semibold text-neutral-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
              {tool.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {tool.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

function FAQ({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">FAQ</h2>
      <div className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-700">
        {items.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between text-left font-medium text-neutral-900 dark:text-white">
              {item.question}
              <span className="ml-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function ArticleSection({ article }: { article: { title: string; content: string } }) {
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{article.title}</h2>
      <div className="mt-6 prose prose-neutral max-w-none dark:prose-invert prose-headings:text-neutral-900 prose-p:text-neutral-600 dark:prose-headings:text-white dark:prose-p:text-neutral-400">
        <p>{article.content}</p>
      </div>
    </section>
  );
}

function CommentsPlaceholder() {
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Comments</h2>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">
          Comments coming soon. Be the first to share your thoughts!
        </p>
      </div>
    </section>
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
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container-toolnova py-8">
        <Breadcrumb items={breadcrumbs} />

        <div className="mx-auto max-w-4xl">
          <ToolHeader
            name={name}
            description={description}
            icon={icon}
            category={category}
            categorySlug={categorySlug}
          />

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
            {children}

            {settings && (
              <ToolSection title="Settings" id="settings">
                {settings}
              </ToolSection>
            )}
          </div>

          {longDescription && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">About This Tool</h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {longDescription}
              </p>
            </section>
          )}

          {faq && faq.length > 0 && <FAQ items={faq} />}
          {article && <ArticleSection article={article} />}

          {relatedTools && relatedTools.length > 0 && (
            <RelatedTools tools={relatedTools} />
          )}

          <CommentsPlaceholder />
        </div>
      </div>
    </main>
  );
}

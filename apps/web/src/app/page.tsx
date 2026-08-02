"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Check,
  Zap,
  Globe,
  Code,
  Image,
  FileText,
  Calculator,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChartColumn,
  Users,
  Activity,
  Mail,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscoverySection } from "@/components/home/discovery-section";
import { AISpotlight } from "@/components/home/ai-spotlight";
import { useI18n } from "@/i18n";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  DISCOVERY,
  type ToolCategory,
} from "@/lib/tool-catalog";

const DISCOVERY_SECTIONS = (() => {
  const seen = new Set<string>();
  const pick = (list: string[]) => {
    const out = list.filter((slug) => !seen.has(slug));
    out.forEach((slug) => seen.add(slug));
    return out;
  };
  return {
    mostUsed: pick(DISCOVERY.mostUsed),
    trending: pick(DISCOVERY.trending),
    newAI: pick(DISCOVERY.newAI),
    recentlyAdded: pick(DISCOVERY.recentlyAdded),
    topRated: pick(DISCOVERY.topRated),
  };
})();

const STAT_META = [
  { value: 500, suffix: "+", key: "tools" as const, icon: ChartColumn },
  { value: 50, suffix: "K+", key: "users" as const, icon: Users },
  { value: 180, suffix: "+", key: "countries" as const, icon: Globe },
  { value: 99.9, suffix: "%", key: "uptime" as const, icon: Activity },
];

const PLAN_META = [
  { price: "0", period: "/month", popular: false },
  { price: "9", period: "/month", popular: true },
  { price: "29", period: "/month", popular: false },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix?: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  );
}

function FloatingIcon({ icon: Icon, className }: { icon: React.ElementType; className?: string }) {
  return (
    <motion.div
      className={cn(
        "absolute flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-neutral-200/50 ring-1 ring-neutral-200/50 dark:bg-neutral-900 dark:shadow-neutral-900/50 dark:ring-neutral-700/50",
        className
      )}
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
    </motion.div>
  );
}

function HeroSection() {
  const { dict } = useI18n();
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/tools?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-white pb-20 pt-24 dark:from-brand-950/10 dark:via-neutral-950 dark:to-neutral-950">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-b from-brand-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <FloatingIcon icon={Zap} className="left-[10%] top-[10%] hidden lg:flex" />
          <FloatingIcon icon={Code} className="right-[15%] top-[5%] hidden lg:flex" />
          <FloatingIcon icon={Image} className="left-[5%] bottom-[20%] hidden lg:flex" />
          <FloatingIcon icon={FileText} className="right-[10%] bottom-[15%] hidden lg:flex" />
          <FloatingIcon icon={Calculator} className="left-[20%] bottom-[5%] hidden lg:flex" />
          <FloatingIcon icon={RefreshCw} className="right-[20%] top-[20%] hidden lg:flex" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm backdrop-blur dark:border-brand-800/50 dark:bg-brand-900/20 dark:text-brand-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{dict.home.badge}</span>
          </motion.div>

          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-neutral-900 dark:text-white">{dict.home.heroTitle1}</span>
            <br />
            <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 bg-clip-text text-transparent">
              {dict.home.heroTitle2}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-xl">
            {dict.home.heroSubtitle}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 rtl:left-auto rtl:right-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={dict.home.searchPlaceholder}
                  className="h-14 w-full rounded-2xl border border-neutral-200 bg-white pl-12 pr-4 text-base text-neutral-900 shadow-lg shadow-neutral-200/50 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:shadow-neutral-900/50 dark:placeholder:text-neutral-500 rtl:pl-4 rtl:pr-12"
                />
              </div>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">{dict.home.popular}</span>
              {dict.home.featuredTools.slice(0, 4).map((term) => (
                <Link
                  key={term.id}
                  href={`/tools/${term.id}`}
                  className="rounded-full border border-neutral-200 bg-neutral-100/50 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:border-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-300"
                >
                  {term.name}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="#tools">
              <Button size="lg" className="h-12 px-8 text-base">
                {dict.home.startFree}
                <ArrowRight className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                {dict.home.viewPricing}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { dict } = useI18n();
  return (
    <section className="border-y border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STAT_META.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <stat.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <div className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">{dict.home.stats[stat.key]}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { dict } = useI18n();
  const categories = (Object.keys(CATEGORY_META) as ToolCategory[]).map((slug) => ({
    slug,
    name: dict.category.categories[slug].name,
    description: dict.category.categories[slug].description,
    count: CATEGORY_ORDER[slug].length,
    meta: CATEGORY_META[slug],
  }));

  return (
    <section className="bg-neutral-50/50 py-20 dark:bg-neutral-900/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4">{dict.home.categoriesBadge}</Badge>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
            {dict.home.categoriesTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {dict.home.categoriesSubtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-brand-700/50"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:group-hover:opacity-15" />
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ring-1 ring-inset ring-white/25",
                    cat.meta.gradient
                  )}
                >
                  <cat.meta.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {cat.description}
                  </p>
                  <p className={cn("mt-1 text-xs font-medium", cat.meta.soft)}>
                    {cat.count} {dict.home.toolsSuffix}
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 rtl:rotate-180" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { dict } = useI18n();
  const steps = dict.home.steps.map((step, i) => ({
    number: `0${i + 1}`,
    title: step.title,
    description: step.description,
    icon: [Search, FileText, Zap][i] ?? Zap,
  }));

  return (
    <section className="border-t border-neutral-200 bg-neutral-50/50 py-20 dark:border-neutral-800 dark:bg-neutral-900/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4">{dict.home.howBadge}</Badge>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
            {dict.home.howTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {dict.home.howSubtitle}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-sm font-bold text-brand-600 dark:text-brand-400">{step.number}</div>
              <h3 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden md:block">
                  <ArrowRight className="h-6 w-6 text-neutral-300 dark:text-neutral-600 rtl:rotate-180" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  const { dict } = useI18n();
  const plans = dict.home.plans.map((plan, i) => ({
    ...plan,
    price: PLAN_META[i]?.price ?? "0",
    period: PLAN_META[i]?.period ?? "/month",
    popular: PLAN_META[i]?.popular ?? false,
  }));

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4">{dict.home.pricingBadge}</Badge>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
            {dict.home.pricingTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {dict.home.pricingSubtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-8 shadow-sm transition-all",
                plan.popular
                  ? "border-brand-500 bg-white shadow-xl shadow-brand-500/10 dark:border-brand-600 dark:bg-neutral-900"
                  : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>{dict.home.mostPopular}</Badge>
                </div>
              )}
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-neutral-900 dark:text-white">${plan.price}</span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Check className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <Button
                  className={cn("mt-8 w-full", plan.popular && "shadow-lg shadow-brand-600/25")}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {dict.home.viewAllPlans}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { dict } = useI18n();
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = dict.home.faqItems.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="border-t border-neutral-200 bg-neutral-50/50 py-20 dark:border-neutral-800 dark:bg-neutral-900/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4">{dict.home.faqBadge}</Badge>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
            {dict.home.faqTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {dict.home.faqSubtitle}
          </p>
        </motion.div>

        <div className="mx-auto mt-10 max-w-2xl">
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder={dict.home.searchFaq}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 rtl:pl-3 rtl:pr-9"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:text-white dark:hover:bg-neutral-800/50"
                >
                  {item.q}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200",
                      openIndex === i && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-neutral-100 px-6 py-4 text-sm leading-relaxed text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const { dict } = useI18n();
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700" />
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
            <Mail className="h-3.5 w-3.5" />
            <span>{dict.home.newsletterBadge}</span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{dict.home.newsletterTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-brand-100">
            {dict.home.newsletterSubtitle}
          </p>
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-wrap gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.home.emailPlaceholder}
              required
              className="h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-brand-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="h-12 shrink-0 bg-white text-brand-700 hover:bg-brand-50"
            >
              {dict.home.subscribe}
              <ArrowRight className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2 rtl:rotate-180" />
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { dict } = useI18n();

  return (
    <>
      <HeroSection />
      <StatsSection />
      <div id="tools">
        <DiscoverySection
          badge={dict.home.discovery.mostUsed.badge}
          title={dict.home.discovery.mostUsed.title}
          subtitle={dict.home.discovery.mostUsed.subtitle}
          slugs={DISCOVERY_SECTIONS.mostUsed}
        />
        <DiscoverySection
          badge={dict.home.discovery.trending.badge}
          title={dict.home.discovery.trending.title}
          subtitle={dict.home.discovery.trending.subtitle}
          slugs={DISCOVERY_SECTIONS.trending}
          className="bg-neutral-50/50 dark:bg-neutral-900/20"
        />
      </div>
      <AISpotlight />
      <div>
        <DiscoverySection
          badge={dict.home.discovery.newAI.badge}
          title={dict.home.discovery.newAI.title}
          subtitle={dict.home.discovery.newAI.subtitle}
          slugs={DISCOVERY_SECTIONS.newAI}
        />
        <DiscoverySection
          badge={dict.home.discovery.recentlyAdded.badge}
          title={dict.home.discovery.recentlyAdded.title}
          subtitle={dict.home.discovery.recentlyAdded.subtitle}
          slugs={DISCOVERY_SECTIONS.recentlyAdded}
          className="bg-neutral-50/50 dark:bg-neutral-900/20"
        />
        <DiscoverySection
          badge={dict.home.discovery.topRated.badge}
          title={dict.home.discovery.topRated.title}
          subtitle={dict.home.discovery.topRated.subtitle}
          slugs={DISCOVERY_SECTIONS.topRated}
        />
      </div>
      <CategoriesSection />
      <HowItWorksSection />
      <PricingPreview />
      <FAQSection />
      <NewsletterSection />
    </>
  );
}

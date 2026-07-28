import { Metadata } from "next";
import { ToolLayout } from "@/components/tool/tool-layout";

export const metadata: Metadata = {
  title: "Word Counter - Free Online Text Counter",
  description:
    "Count words, characters, sentences, and paragraphs in your text instantly. Free online word counter tool.",
};

const TOOL = {
  slug: "word-counter",
  name: "Word Counter",
  description: "Count words, characters, sentences, and paragraphs in your text instantly.",
  longDescription:
    "Our Word Counter tool helps you quickly count words, characters, sentences, and paragraphs in any text. Whether you're writing an essay, blog post, or document, this tool gives you accurate counts to help you meet your requirements. Simply paste your text and see the results instantly.",
  category: "Text Tools",
  categorySlug: "text",
  icon: "T",
  breadcrumbs: [
    { label: "Text Tools", href: "/category/text" },
    { label: "Word Counter", href: "/tools/word-counter" },
  ],
};

const RELATED_TOOLS = [
  { slug: "character-counter", name: "Character Counter", description: "Count characters in your text", icon: "C" },
  { slug: "sentence-counter", name: "Sentence Counter", description: "Count sentences in your text", icon: "S" },
  { slug: "reading-time", name: "Reading Time", description: "Estimate reading time for your text", icon: "⏱" },
];

const FAQ = [
  {
    question: "What counts as a word?",
    answer: "A word is any sequence of characters separated by spaces. Numbers and punctuation marks are included in the count.",
  },
  {
    question: "Is there a character limit?",
    answer: "You can count up to 100,000 characters at once. For larger texts, we recommend splitting them into sections.",
  },
  {
    question: "Does it count spaces?",
    answer: "Yes, spaces are included in the character count. You can also see the character count without spaces.",
  },
];

const ARTICLE = {
  title: "Why Word Count Matters",
  content:
    "Word count is important for many types of writing. Academic papers, blog posts, and social media all have specific word limits. Knowing your word count helps you stay within requirements and communicate more effectively. Our tool makes it easy to track your word count in real-time as you write.",
};

export default function WordCounterPage() {
  return (
    <ToolLayout
      name={TOOL.name}
      description={TOOL.description}
      longDescription={TOOL.longDescription}
      category={TOOL.category}
      categorySlug={TOOL.categorySlug}
      breadcrumbs={TOOL.breadcrumbs}
      icon={TOOL.icon}
      faq={FAQ}
      article={ARTICLE}
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Enter Your Text
          </label>
          <textarea
            placeholder="Paste or type your text here..."
            rows={8}
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">0</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Words</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">0</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Characters</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">0</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Sentences</div>
          </div>
          <div className="rounded-lg bg-neutral-100 p-4 text-center dark:bg-neutral-800">
            <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">0</div>
            <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Paragraphs</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
            Count Words
          </button>
          <button className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700">
            Clear
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}

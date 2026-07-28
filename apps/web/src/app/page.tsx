import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ToolNova - Every Tool. One Place.",
  description:
    "Discover hundreds of free online tools. Image editors, text processors, calculators, converters, and more. No signup required.",
};

const PLACEHOLDER_TOOLS = [
  { id: "1", name: "Word Counter", description: "Count words, characters, and sentences in your text", category: "Text", icon: "T" },
  { id: "2", name: "JSON Formatter", description: "Format and validate JSON data instantly", category: "Developer", icon: "{ }" },
  { id: "3", name: "Image Compressor", description: "Reduce image file size without losing quality", category: "Image", icon: "🖼" },
  { id: "4", name: "UUID Generator", description: "Generate unique UUIDs for your applications", category: "Generator", icon: "#" },
  { id: "5", name: "Password Generator", description: "Create strong, secure passwords instantly", category: "Security", icon: "🔒" },
  { id: "6", name: "Color Picker", description: "Pick and convert colors between formats", category: "Design", icon: "🎨" },
];

const PLACEHOLDER_CATEGORIES = [
  { id: "text", name: "Text Tools", description: "Text manipulation and formatting", count: 24, icon: "📝" },
  { id: "image", name: "Image Tools", description: "Image editing and conversion", count: 18, icon: "🖼" },
  { id: "developer", name: "Developer Tools", description: "Code utilities and formatters", count: 32, icon: "💻" },
  { id: "calculation", name: "Calculators", description: "Math and financial calculators", count: 15, icon: "🔢" },
  { id: "converter", name: "Converters", description: "Unit and data conversion tools", count: 21, icon: "🔄" },
  { id: "generator", name: "Generators", description: "Random and auto-generated content", count: 12, icon: "⚡" },
];

const FAQ_ITEMS = [
  {
    question: "Is ToolNova free to use?",
    answer: "Yes! All tools on ToolNova are completely free. No signup or credit card required.",
  },
  {
    question: "Do I need to install anything?",
    answer: "No. All tools work directly in your browser. No downloads or installations needed.",
  },
  {
    question: "Is my data safe?",
    answer: "Yes. We process everything in your browser. Your data never leaves your device.",
  },
  {
    question: "Can I suggest a new tool?",
    answer: "Absolutely! We love hearing from our users. Contact us with your suggestions.",
  },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white dark:from-brand-950/20 dark:to-neutral-950">
      <div className="container-toolnova py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-brand-200 bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
            <span className="mr-2 h-2 w-2 rounded-full bg-brand-500" />
            100+ Free Online Tools
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl lg:text-7xl">
            Every Tool.
            <br />
            <span className="text-brand-600">One Place.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400 sm:text-xl">
            Discover hundreds of free online tools. Image editors, text processors,
            calculators, converters, and more. No signup required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="#tools"
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Explore Tools
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchSection() {
  return (
    <section className="py-12">
      <div className="container-toolnova">
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for tools..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-5 py-4 pl-12 text-lg shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-400"
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["JSON Formatter", "Word Counter", "Password Generator", "UUID Generator"].map((term) => (
              <span
                key={term}
                className="cursor-pointer rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolsGrid({ title, tools }: { title: string; tools: typeof PLACEHOLDER_TOOLS }) {
  return (
    <section id="tools" className="py-16">
      <div className="container-toolnova">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">{title}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-brand-600"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <span className="text-lg font-bold">{tool.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                {tool.name}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{tool.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand-600 dark:text-brand-400">
                Use Tool →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="bg-neutral-50 py-16 dark:bg-neutral-900/50">
      <div className="container-toolnova">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">Browse by Category</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-200 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-brand-600"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-2xl dark:bg-brand-900/30">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                  {cat.name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{cat.count} tools</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "Tools Available", value: "100+" },
    { label: "Monthly Users", value: "50K+" },
    { label: "Countries Served", value: "180+" },
    { label: "Uptime", value: "99.9%" },
  ];

  return (
    <section className="py-16">
      <div className="container-toolnova">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-400 sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { step: "1", title: "Choose a Tool", description: "Browse our collection or search for what you need." },
    { step: "2", title: "Enter Your Data", description: "Input your text, files, or settings into the tool." },
    { step: "3", title: "Get Results", description: "Instantly get your results. Copy, download, or share." },
  ];

  return (
    <section id="how-it-works" className="bg-neutral-50 py-16 dark:bg-neutral-900/50">
      <div className="container-toolnova">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          How It Works
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {step.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-16">
      <div className="container-toolnova">
        <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto mt-12 max-w-2xl divide-y divide-neutral-200 dark:divide-neutral-700">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between text-left text-lg font-medium text-neutral-900 dark:text-white">
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
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="bg-brand-600 py-16">
      <div className="container-toolnova text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Stay Updated</h2>
        <p className="mx-auto mt-3 max-w-md text-brand-100">
          Get notified when we add new tools and features.
        </p>
        <form className="mx-auto mt-8 flex max-w-md gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-lg border border-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  const links = {
    Product: ["All Tools", "Categories", "Featured", "New Tools"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy", "Terms", "Cookies"],
  };

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container-toolnova py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Tool<span className="text-brand-600">Nova</span>
            </h3>
            <p className="mt-3 max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
              Every tool you need, in one place. Free, fast, and easy to use.
            </p>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{category}</h4>
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-neutral-600 hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500 dark:border-neutral-800">
          © {new Date().getFullYear()} ToolNova. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SearchSection />
      <ToolsGrid title="Popular Tools" tools={PLACEHOLDER_TOOLS} />
      <ToolsGrid title="Featured Tools" tools={[...PLACEHOLDER_TOOLS].reverse()} />
      <CategoriesSection />
      <ToolsGrid title="Latest Tools" tools={PLACEHOLDER_TOOLS.slice(0, 3)} />
      <StatsSection />
      <HowItWorksSection />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </main>
  );
}

// ============================================================
// ToolNova Contact Page
// ============================================================

"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Mail, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setFormState({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="section-padding">
          <div className="container-toolnova">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
                Get in Touch
              </h1>
              <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
                Have a question, suggestion, or want to partner? We&apos;d love to hear from you.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="container-toolnova">
            <div className="mx-auto max-w-2xl">
              <div className="grid gap-6 sm:grid-cols-2 mb-8">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Email</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">hello@toolnova.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">Response</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Within 24 hours</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-neutral-900 dark:text-white">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-900 dark:text-white">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-neutral-900 dark:text-white">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="input-field"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-neutral-900 dark:text-white">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Tell us more..."
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitted ? "Message Sent!" : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

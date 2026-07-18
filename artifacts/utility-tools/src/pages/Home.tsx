import { SearchBar } from '@/components/SearchBar';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ToolFAQ } from '@/components/ToolFAQ';

const HOME_FAQS = [
  { question: "Are these tools really free?", answer: "Yes, 100% free forever. No premium tiers, no hidden costs." },
  { question: "Is my data secure?", answer: "Absolutely. All tools run client-side in your browser. Your data never leaves your device." },
  { question: "Do I need to create an account?", answer: "No account required. Just open the tool and start using it immediately." },
  { question: "Are there any usage limits?", answer: "No limits. Use any tool as many times as you need." }
];

export default function Home() {
  return (
    <div className="space-y-24 pb-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8 px-4">
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          100+ fully functional utility tools running securely in your browser. Fast, reliable, and completely free.
        </p>
        <div className="flex justify-center w-full max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Explore Categories</h2>
        <CategoryGrid />
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto">
        <ToolFAQ faqs={HOME_FAQS} />
      </section>

      {/* Feedback */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 tracking-tight">Feedback</h2>
        <p className="text-muted-foreground mb-6">
          Share your thoughts, feature requests, or issues so we can keep improving toolboxx.
        </p>
        <div className="rounded-2xl border overflow-hidden">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfh9ojujTb3NPXJ2T42r6lmfuY7v_6oH38ql_UH-9kTE9OQXw/viewform?embedded=true"
            width="100%"
            height="1703"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Feedback Form"
          >
            Loading…
          </iframe>
        </div>
      </section>
    </div>
  );
}

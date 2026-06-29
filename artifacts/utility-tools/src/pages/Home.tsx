import { useState } from 'react';
import { useLocation } from 'wouter';
import { toolsData } from '@/lib/tools-data';
import { ToolCard } from '@/components/ToolCard';
import { SearchBar } from '@/components/SearchBar';
import { CategoryGrid } from '@/components/CategoryGrid';
import { useRecentTools } from '@/hooks/useRecentTools';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ToolFAQ } from '@/components/ToolFAQ';

const HOME_FAQS = [
  { question: "Are these tools really free?", answer: "Yes, 100% free forever. No premium tiers, no hidden costs." },
  { question: "Is my data secure?", answer: "Absolutely. All tools run client-side in your browser. Your data never leaves your device." },
  { question: "Do I need to create an account?", answer: "No account required. Just open the tool and start using it immediately." },
  { question: "Are there any usage limits?", answer: "No limits. Use any tool as many times as you need." }
];

export default function Home() {
  const { recentTools } = useRecentTools();
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const trendingTools = toolsData.filter(t => t.trending).slice(0, 6);
  const popularTools = toolsData.filter(t => t.popular).slice(0, 8);
  const newTools = toolsData.filter(t => t.new).slice(0, 4);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast({
      title: "Subscribed successfully!",
      description: "You'll receive our next newsletter.",
    });
    setEmail('');
  };

  return (
    <div className="space-y-24 pb-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8 px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6">
          Premium tools.<br />
          <span className="text-primary">Always free.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          100+ fully functional utility tools running securely in your browser. Fast, reliable, and completely free.
        </p>
        <div className="flex justify-center w-full max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Trending Tools (Horizontal Scroll) */}
      <section>
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Trending Right Now</h2>
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 snap-x no-scrollbar">
          {trendingTools.map(tool => (
            <div key={tool.slug} className="min-w-[280px] sm:min-w-[320px] snap-start">
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Explore Categories</h2>
        <CategoryGrid />
      </section>

      {/* Popular Tools */}
      <section>
        <h2 className="text-2xl font-bold mb-6 tracking-tight">Most Popular</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Recently Used Tools */}
      {recentTools.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Recently Used</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {recentTools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Newly Added */}
      {newTools.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Newly Added</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newTools.map(tool => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-3xl mx-auto">
        <ToolFAQ faqs={HOME_FAQS} />
      </section>

      {/* Newsletter */}
      <section className="bg-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Stay updated</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Get notified when we add new tools and features. No spam, we promise.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background border-primary/20"
            required
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Subscribe
          </Button>
        </form>
      </section>
    </div>
  );
}

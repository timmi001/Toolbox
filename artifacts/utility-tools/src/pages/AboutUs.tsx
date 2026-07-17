import { Link } from 'wouter';
import { ArrowLeft, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const highlights = [
  {
    icon: Sparkles,
    title: '100+ free tools',
    description: 'From text and developer utilities to image, PDF, and business helpers, toolboxx brings everything into one place.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description: 'Most tools run directly in your browser, so your data stays local and secure.',
  },
  {
    icon: Zap,
    title: 'Fast and lightweight',
    description: 'We focus on simple, reliable tools that load quickly and work without friction.',
  },
];

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About toolboxx</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            toolboxx is built to make everyday digital work simpler with fast, useful, and free web tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground leading-7">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useRoute, Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPost() {
  const [match, params] = useRoute('/blog/:slug');

  if (!match || !params.slug) return null;

  const title = params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useSEO(`${title} | ToolKit Blog`, `Read our article about ${title.toLowerCase()}`);

  return (
    <div className="py-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/blog">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Blog
        </Link>
      </Button>

      <article className="prose prose-invert prose-primary max-w-none">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{title}</h1>
        <div className="text-primary mb-12">October 2023</div>

        <p className="text-xl text-muted-foreground leading-relaxed mb-8">
          This is a placeholder article for {title}. In a real application, this content would be fetched from a CMS or markdown files.
        </p>

        <h2>Introduction</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>

        <h2>The Core Concept</h2>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <ul>
          <li>First important point about this topic.</li>
          <li>Second crucial detail you should remember.</li>
          <li>Third aspect that ties it all together.</li>
        </ul>

        <h2>Conclusion</h2>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>
      </article>
    </div>
  );
}

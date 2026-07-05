import { Link } from 'wouter';
import { useSEO } from '@/hooks/useSEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const POSTS = [
  { slug: 'compress-pdf-files', title: 'How to Compress PDF Files Without Losing Quality', date: 'October 10, 2023', excerpt: 'Learn the best methods to reduce your PDF file size while maintaining readability.' },
  { slug: 'top-10-free-developer-tools', title: 'Top 10 Free Developer Tools You Should Bookmark', date: 'October 5, 2023', excerpt: 'A curated list of essential online utilities every developer needs in their toolkit.' },
  { slug: 'understanding-base64', title: 'Understanding Base64 Encoding', date: 'September 28, 2023', excerpt: 'What is Base64 encoding, how does it work, and when should you use it?' },
];

export default function BlogIndex() {
  useSEO('Blog | ToolKit', 'Read the latest articles about utility tools, web development, and productivity.');

  return (
    <div className="py-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">Blog</h1>
      <p className="text-xl text-muted-foreground mb-12">Insights, guides, and tutorials to help you work faster.</p>

      <div className="space-y-6">
        {POSTS.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="hover:border-primary/50 transition-colors bg-card/40 backdrop-blur-sm group cursor-pointer">
              <CardHeader>
                <div className="text-sm text-primary mb-2">{post.date}</div>
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">{post.excerpt}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

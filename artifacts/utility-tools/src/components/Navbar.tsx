import { Link } from 'wouter';
import { Menu, Sparkles } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const NAV_LINKS = [
  { name: 'AI Tools', href: '/ai-tools', highlight: true },
  { name: 'Calculators', href: '/calculators' },
  { name: 'PDF Tools', href: '/pdf-tools' },
  { name: 'Image Tools', href: '/image-tools' },
  { name: 'File Conversion', href: '/file-conversion-tools' },
  { name: 'Business Tools', href: '/business-tools' },
  { name: 'Developer Tools', href: '/developer-tools' },
  { name: 'SEO Tools', href: '/seo-tools' },
  { name: 'Text Tools', href: '/text-tools' },
  { name: 'Blog', href: '/blog' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">ToolKit</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map(link => (
            link.highlight
              ? <Link key={link.href} href={link.href} className="flex items-center gap-1.5 text-sm font-semibold text-purple-500 hover:text-purple-600 transition-colors">
                  <Sparkles className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              : <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.name}
                </Link>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-border bg-background">
            <div className="mt-8 mb-6">
              <SearchBar />
            </div>
            <nav className="flex flex-col gap-4">
              <Link href="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors">Home</Link>
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

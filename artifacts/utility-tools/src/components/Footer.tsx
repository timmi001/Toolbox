import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background pt-16 pb-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-bold text-lg text-foreground">ToolKit</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your premium destination for free, fast, and secure online utility tools. No backend calls, 100% client-side.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/text-tools" className="hover:text-primary transition-colors">Text Tools</Link></li>
              <li><Link href="/developer-tools" className="hover:text-primary transition-colors">Developer Tools</Link></li>
              <li><Link href="/seo-tools" className="hover:text-primary transition-colors">SEO Tools</Link></li>
              <li><Link href="/image-tools" className="hover:text-primary transition-colors">Image Tools</Link></li>
              <li><Link href="/file-conversion-tools" className="hover:text-primary transition-colors">File Conversion</Link></li>
              <li><Link href="/pdf-tools" className="hover:text-primary transition-colors">PDF Tools</Link></li>
              <li><Link href="/calculators" className="hover:text-primary transition-colors">Calculators</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ToolKit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

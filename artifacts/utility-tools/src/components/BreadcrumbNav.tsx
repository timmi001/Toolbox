import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { ToolCategory } from '@/lib/tools-data';

interface BreadcrumbNavProps {
  category?: ToolCategory;
  toolName?: string;
}

const CATEGORY_NAMES: Record<ToolCategory, string> = {
  text: 'Text Tools',
  developer: 'Developer Tools',
  image: 'Image Tools',
  'file-conversion': 'File Conversion Tools',
  business: 'Business Tools',
  pdf: 'PDF Tools',
  calculators: 'Calculators & Converters',
  ai: 'AI Tools',
  marketing: 'AI Marketing & Advertising',
  audio: 'Audio Tools',
  video: 'Video Tools',
  'ai-resume': 'AI Resume Tools',
  'ai-social': 'AI Social Media Tools',
  'ai-blogging-seo': 'AI Blogging & SEO Tools',
  'ai-email': 'AI Email Tools',
  'ai-grammar': 'AI Grammar & Writing Tools',
  'ai-study-exams': 'AI Study & Exams',
  'ai-ghostwriting': 'AI Ghostwriting',
};

const CATEGORY_LINKS: Record<ToolCategory, string> = {
  text: '/text-tools',
  developer: '/developer-tools',
  image: '/image-tools',
  'file-conversion': '/file-conversion-tools',
  business: '/business-tools',
  pdf: '/pdf-tools',
  calculators: '/calculators',
  ai: '/ai-tools',
  marketing: '/ai-marketing-advertising',
  audio: '/audio-tools',
  video: '/video-tools',
  'ai-resume': '/ai-resume-tools',
  'ai-social': '/ai-social-media-tools',
  'ai-blogging-seo': '/ai-blogging-seo-tools',
  'ai-email': '/ai-email-tools',
  'ai-grammar': '/ai-grammar-tools',
  'ai-study-exams': '/ai-study-exams-tools',
  'ai-ghostwriting': '/ai-ghostwriting-tools',
};

export function BreadcrumbNav({ category, toolName }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap pb-2">
      <Link href="/" className="hover:text-primary transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      
      {category && (
        <>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link href={CATEGORY_LINKS[category]} className="hover:text-primary transition-colors">
            {CATEGORY_NAMES[category]}
          </Link>
        </>
      )}

      {toolName && (
        <>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-foreground font-medium">{toolName}</span>
        </>
      )}
    </nav>
  );
}

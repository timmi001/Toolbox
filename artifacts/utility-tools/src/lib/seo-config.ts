export interface SeoMetadata {
  title: string;
  description: string;
}

export const SEO_CONFIG = {
  home: {
    title: 'Toolbuxx | Your AI Workspace',
    description: 'Study smarter, create faster, and build better with Toolbuxx AI hubs and practical productivity tools.',
  },
  study: {
    title: 'Study Hub | Toolbuxx',
    description: 'Learn faster with an AI study tutor for explanations, practice, notes, flashcards, and study planning.',
  },
  creator: {
    title: 'Creator Studio | Toolbuxx',
    description: 'Turn ideas into polished content, campaigns, scripts, and creative direction with AI.',
  },
  chatWithPdf: {
    title: 'Chat with PDF | Toolbuxx',
    description: 'Upload PDFs, ask questions, extract key points, and understand documents with focused AI assistance.',
  },
} satisfies Record<string, SeoMetadata>;

export function getRouteSeo(pathname: string): SeoMetadata | null {
  const path = pathname.split('?')[0];
  if (path === '/') return SEO_CONFIG.home;
  if (path === '/hub/study') return SEO_CONFIG.study;
  if (path === '/hub/creator') return SEO_CONFIG.creator;
  if (path === '/chat-with-pdf' || path.startsWith('/chat-with-pdf/')) return SEO_CONFIG.chatWithPdf;
  return null;
}

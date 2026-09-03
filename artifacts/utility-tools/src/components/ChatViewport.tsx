import { useEffect } from 'react';

interface ChatViewportProps {
  children: React.ReactNode;
  className?: string;
}

/** Viewport contract shared by all AI chat workspaces. */
export function ChatViewport({ children, className = '' }: ChatViewportProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  return (
    <div className={`chat-viewport flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

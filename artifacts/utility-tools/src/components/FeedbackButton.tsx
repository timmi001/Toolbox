const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfh9ojujTb3NPXJ2T42r6lmfuY7v_6oH38ql_UH-9kTE9OQXw/viewform';

export function openFeedbackForm() {
  window.open(FORM_URL, '_blank', 'noopener,noreferrer');
}

export function FeedbackButton() {
  return (
    <button
      onClick={openFeedbackForm}
      aria-label="Send feedback"
      className={[
        // Position
        'fixed bottom-6 right-6 z-50',
        // Shape & size
        'flex items-center gap-2 rounded-full',
        'h-11 pl-4 pr-5',
        // Colour — uses the site's primary purple tones
        'bg-purple-600 text-white shadow-lg shadow-purple-600/30',
        // Hover / active
        'hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-600/40',
        'active:scale-95',
        // Smooth motion
        'transition-all duration-200 ease-out',
        // Typography
        'text-sm font-semibold tracking-tight whitespace-nowrap',
        // Focus ring for keyboard nav
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      <span aria-hidden="true" className="text-base leading-none">💬</span>
      Feedback
    </button>
  );
}

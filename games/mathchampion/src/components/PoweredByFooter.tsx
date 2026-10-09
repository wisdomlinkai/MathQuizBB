export function PoweredByFooter() {
  return (
    <div className="flex items-center justify-center gap-2 bg-white rounded-xl px-3 py-2">
      <img 
        src="/wisdom-link-logo.png" 
        alt="Wisdom Link AI" 
        className="h-5 w-auto"
      />
      <a 
        href="https://www.wisdomlinkai.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="font-body font-semibold text-sky-500 text-xs hover:text-sky-600 transition-colors"
      >
        Powered by Wisdom Link AI
      </a>
    </div>
  );
}

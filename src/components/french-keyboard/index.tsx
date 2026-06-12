'use client';

const FRENCH_CHARS = [
  { char: 'é', alt: 'e' }, { char: 'è', alt: 'e' }, { char: 'ê', alt: 'e' },
  { char: 'ë', alt: 'e' }, { char: 'à', alt: 'a' }, { char: 'â', alt: 'a' },
  { char: 'ù', alt: 'u' }, { char: 'û', alt: 'u' }, { char: 'ü', alt: 'u' },
  { char: 'î', alt: 'i' }, { char: 'ï', alt: 'i' }, { char: 'ô', alt: 'o' },
  { char: 'ç', alt: 'c' }, { char: 'œ', alt: 'oe' },
];

export function FrenchKeyboard({ onInsert }: { onInsert: (char: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border/50 bg-card p-2">
      {FRENCH_CHARS.map(({ char }) => (
        <button key={char} type="button" onClick={() => onInsert(char)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          {char}
        </button>
      ))}
    </div>
  );
}

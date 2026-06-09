'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface DualLineChecklistItem {
  id: string;
  primary: string;
  secondary: string;
  checked?: boolean;
}

interface DualLineChecklistProps {
  items: DualLineChecklistItem[];
  onToggle: (id: string) => void;
}

export default function DualLineChecklist({ items, onToggle }: DualLineChecklistProps) {
  return (
    <div className="space-y-1">
      {items.map(item => (
        <button key={item.id} onClick={() => onToggle(item.id)}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-secondary/50">
          {item.checked
            ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" strokeWidth={1.5} />
            : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/20" strokeWidth={1.5} />}
          <div className="min-w-0 flex-1">
            <p className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : ''}`}>{item.primary}</p>
            <p className="text-xs text-muted-foreground">{item.secondary}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

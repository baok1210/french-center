import type { LearningResource, SubtitleLang } from '@/types/resources';
import { ExternalLink, Youtube, Headphones, Globe, GraduationCap, Keyboard, Subtitles } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Video: <Youtube className="h-4 w-4" />,
  Audio: <Headphones className="h-4 w-4" />,
  Audio_Text: <Headphones className="h-4 w-4" />,
  Website: <Globe className="h-4 w-4" />,
  Course: <GraduationCap className="h-4 w-4" />,
  Keyboard: <Keyboard className="h-4 w-4" />,
};

const SUBTITLE_BADGE: Record<SubtitleLang, { label: string; color: string }> = {
  French: { label: 'Phụ đề Pháp', color: 'bg-primary/10 text-primary' },
  English: { label: 'Phụ đề Anh', color: 'bg-primary/10 text-primary' },
  Both: { label: 'Phụ đề cả hai', color: 'bg-primary/10 text-primary' },
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || <ExternalLink className="h-4 w-4" />;
}

interface ResourceCardProps {
  resource: LearningResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Link
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="diffusion-shadow flex items-start gap-3 rounded-2xl border border-border/50 bg-card p-5 transition-all hover:shadow-md"
    >
      <span className="mt-0.5 shrink-0 text-muted-foreground">
        {getCategoryIcon(resource.category)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-medium">{resource.title}</h3>
          {resource.subtitle && (
            <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${SUBTITLE_BADGE[resource.subtitle].color}`}>
              <Subtitles className="mr-0.5 inline h-3 w-3" strokeWidth={1.5} />
              {SUBTITLE_BADGE[resource.subtitle].label}
            </span>
          )}
          {resource.is_kids && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
              Kids
            </span>
          )}
        </div>
        {resource.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {resource.description}
          </p>
        )}
        {resource.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

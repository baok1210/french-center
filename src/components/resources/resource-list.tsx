import type { ResourceGroup } from '@/types/resources';
import { ResourceCard } from './resource-card';

interface ResourceListProps {
  groups: ResourceGroup[];
}

export function ResourceList({ groups }: ResourceListProps) {
  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.category}>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

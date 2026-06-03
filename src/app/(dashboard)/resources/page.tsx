import { defaultResources } from '@/data/resources-seed';
import { groupResourcesByCategory } from '@/data/resources';
import { ResourceList } from '@/components/resources';

export default function ResourcesPage() {
  const groups = groupResourcesByCategory(defaultResources);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Tài nguyên học tiếng Pháp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bộ sưu tập tài nguyên chất lượng từ cộng đồng — video, audio, website, khóa học và nhiều hơn nữa.
        </p>
      </div>
      <ResourceList groups={groups} />
    </div>
  );
}

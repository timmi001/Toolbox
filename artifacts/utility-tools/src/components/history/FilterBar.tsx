import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { HistorySort } from '@/types/history';

interface FilterBarProps {
  category: string;
  setCategory: (value: string) => void;
  sort: HistorySort;
  setSort: (value: HistorySort) => void;
  categories: string[];
}

export function FilterBar({ category, setCategory, sort, setSort, categories }: FilterBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(option => (
              <SelectItem key={option} value={option}>
                {option === 'all' ? 'All categories' : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sort</label>
        <Select value={sort} onValueChange={value => setSort(value as HistorySort)}>
          <SelectTrigger>
            <SelectValue placeholder="Newest" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="favorites">Favorites</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

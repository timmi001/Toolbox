---
name: CategoryPage extension pattern
description: All places to touch when adding a new tool category
---

## Files to update for each new category

1. `artifacts/utility-tools/src/lib/tools-data.ts`  
   - Add the new string literal to the `ToolCategory` union type

2. `artifacts/utility-tools/src/pages/CategoryPage.tsx`  
   - Add an entry to `CATEGORY_DETAILS` (path → title + desc)  
   - Add a mapping in `mappedCategory` ternary chain

3. `artifacts/utility-tools/src/components/BreadcrumbNav.tsx`  
   - Add to `CATEGORY_NAMES` (ToolCategory → display string)  
   - Add to `CATEGORY_LINKS` (ToolCategory → URL path)

4. `artifacts/utility-tools/src/components/ToolCard.tsx`  
   - Add to `categoryColors` map (ToolCategory → Tailwind bubble/hover/title classes)

**Why:** TypeScript uses `Record<ToolCategory, ...>` in both BreadcrumbNav maps, so missing a new category value is a compile error — this is intentional and acts as a checklist reminder.

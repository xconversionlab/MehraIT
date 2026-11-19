import { createFileRoute, Link } from "@tanstack/react-router";
import { CategoryGlyph } from "@/components/mehrait/icons";
import { Shell, SkeletonRows } from "@/components/mehrait/shell";
import { useCatalog } from "@/lib/mehrait/use-catalog";

export const Route = createFileRoute("/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const { catalog, loading, error } = useCatalog();
  const tops = catalog?.categories.filter((category) => category.parentId == null) ?? [];
  return (
    <Shell>
      <h1 className="text-2xl font-extrabold tracking-tight">Categories</h1>
      {loading || !catalog ? <div className="mt-4"><SkeletonRows /></div> : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <div className="mt-4 grid gap-3">
        {tops.map((category) => {
          const kids = catalog?.categories.filter((item) => item.parentId === category.id) ?? [];
          return (
            <section key={category.id} className="rounded-3xl border border-line bg-cream p-4">
              <Link to="/c/$slug" params={{ slug: category.slug }} className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand">
                  <CategoryGlyph slug={category.slug} className="size-6" />
                </span>
                <span>
                  <span className="block font-semibold">{category.name}</span>
                  <span className="text-sm text-muted">{category.blurb}</span>
                </span>
              </Link>
              {kids.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {kids.map((kid) => (
                    <Link key={kid.id} to="/c/$slug" params={{ slug: kid.slug }} className="rounded-full border border-line px-3 py-1 text-sm">
                      {kid.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

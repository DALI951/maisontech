import { getAdminUser, jsonError, readJson, unauthorized } from "@/lib/api-auth";
import { readDb, updateDb } from "@/lib/db";
import { validateCategory } from "@/lib/category-admin";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const database = await readDb();
  return Response.json({ ok: true, categories: database.categories });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();

  const payload = await readJson<unknown>(request);
  const { value, errors } = validateCategory(payload);
  if (!value) return jsonError("Vérifiez les champs de la catégorie.", 422, { fields: errors });

  const slug = slugify(value.name);
  const created = await updateDb((database) => {
    if (database.categories.some((entry) => entry.slug === slug)) {
      return { error: "Une catégorie porte déjà ce nom." as const };
    }
    const category: Category = {
      id: `cat-${slug}`,
      slug,
      ...value,
    };
    database.categories.push(category);
    return { category };
  });

  if ("error" in created && created.error) {
    return jsonError(created.error, 409, { fields: { name: created.error } });
  }
  return Response.json({ ok: true, category: created.category }, { status: 201 });
}

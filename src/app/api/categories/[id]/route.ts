import { getAdminUser, jsonError, readJson, unauthorized } from "@/lib/api-auth";
import { updateDb } from "@/lib/db";
import { validateCategory } from "@/lib/category-admin";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const { id } = await params;

  const payload = await readJson<unknown>(request);
  const { value, errors } = validateCategory(payload);
  if (!value) return jsonError("Vérifiez les champs de la catégorie.", 422, { fields: errors });

  const result = await updateDb((database) => {
    const category = database.categories.find((entry) => entry.id === id || entry.slug === id);
    if (!category) return { error: "Catégorie introuvable.", status: 404 as const };
    // The slug is the storefront URL: changing it would break saved links, so it stays.
    Object.assign(category, value);
    return { category };
  });

  if (!("category" in result) || !result.category) {
    return jsonError(result.error ?? "Catégorie introuvable.", result.status ?? 400);
  }
  return Response.json({ ok: true, category: result.category });
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const { id } = await params;

  const result = await updateDb((database) => {
    const index = database.categories.findIndex((entry) => entry.id === id || entry.slug === id);
    if (index === -1) return { error: "Catégorie introuvable.", status: 404 as const };
    const category = database.categories[index];
    const used = database.products.filter((product) => product.categorySlug === category.slug).length;
    if (used > 0) {
      return {
        error: `Cette catégorie contient ${used} produit(s). Déplacez-les ou supprimez-les avant de retirer la catégorie.`,
        status: 409 as const,
      };
    }
    database.categories.splice(index, 1);
    return { category };
  });

  if (!("category" in result) || !result.category) {
    return jsonError(result.error ?? "Catégorie introuvable.", result.status ?? 400);
  }
  return Response.json({ ok: true, removed: result.category.slug });
}

import { getAdminUser, jsonError, readJson, unauthorized } from "@/lib/api-auth";
import { readDb, updateDb } from "@/lib/db";
import { summarizeProduct } from "@/lib/product";
import { createProductRecord, validateProductInput } from "@/lib/product-admin";

export const dynamic = "force-dynamic";

/** GET /api/products?ids=a,b,c[&full=1] — summaries (or full records) for wishlist / comparison / recent. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const full = params.get("full") === "1";
  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 40);

  const database = await readDb();
  const shape = (product: (typeof database.products)[number]) =>
    full ? product : summarizeProduct(product);

  if (ids.length === 0) {
    return Response.json({ products: database.products.slice(0, 24).map(shape) });
  }
  const byId = new Map(database.products.map((product) => [product.id, product]));
  const products = ids
    .map((id) => byId.get(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map(shape);
  return Response.json({ products, missing: ids.filter((id) => !byId.has(id)) });
}

/** POST /api/products — admin only. */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();

  const payload = await readJson<unknown>(request);
  const validation = validateProductInput(payload);
  if (!validation.ok || !validation.value) {
    return jsonError("Vérifiez les champs du produit.", 422, { fields: validation.errors });
  }

  const value = validation.value;
  const database = await readDb();
  if (!database.brands.some((brand) => brand.slug === value.brandSlug)) {
    return jsonError("Marque inconnue.", 422, { fields: { brandSlug: "Marque inconnue." } });
  }
  if (!database.categories.some((category) => category.slug === value.categorySlug)) {
    return jsonError("Catégorie inconnue.", 422, {
      fields: { categorySlug: "Catégorie inconnue." },
    });
  }

  const created = await updateDb((database) => {
    const product = createProductRecord(value, database.products);
    database.products.push(product);
    return product;
  });

  return Response.json({ ok: true, product: created }, { status: 201 });
}

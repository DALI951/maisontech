import { getAdminUser, jsonError, readJson, unauthorized } from "@/lib/api-auth";
import { readDb, updateDb } from "@/lib/db";
import { applyProductUpdate, validateProductInput } from "@/lib/product-admin";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const database = await readDb();
  const product = database.products.find((entry) => entry.id === id);
  if (!product) return jsonError("Produit introuvable.", 404);
  return Response.json({ product });
}

/** PUT /api/products/[id] — full replace with validated payload (admin only). */
export async function PUT(request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const { id } = await params;

  const payload = await readJson<unknown>(request);
  const validation = validateProductInput(payload);
  if (!validation.ok || !validation.value) {
    return jsonError("Vérifiez les champs du produit.", 422, { fields: validation.errors });
  }

  const database = await readDb();
  const value = validation.value;
  if (!database.brands.some((brand) => brand.slug === value.brandSlug)) {
    return jsonError("Marque inconnue.", 422, { fields: { brandSlug: "Marque inconnue." } });
  }
  if (!database.categories.some((category) => category.slug === value.categorySlug)) {
    return jsonError("Catégorie inconnue.", 422, {
      fields: { categorySlug: "Catégorie inconnue." },
    });
  }

  const updated = await updateDb((db) => {
    const product = db.products.find((entry) => entry.id === id);
    if (!product) return null;
    Object.assign(product, applyProductUpdate(product, value));
    return product;
  });

  if (!updated) return jsonError("Produit introuvable.", 404);
  return Response.json({ ok: true, product: updated });
}

/** PATCH /api/products/[id] — quick edits (stock, price, flags). */
export async function PATCH(request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const { id } = await params;
  const payload = await readJson<Record<string, unknown>>(request);
  if (!payload) return jsonError("Requête illisible.");

  const result = await updateDb((db) => {
    const product = db.products.find((entry) => entry.id === id);
    if (!product) return { error: "Produit introuvable.", status: 404 as const };

    if (payload.stock !== undefined) {
      const stock = Math.floor(Number(payload.stock));
      if (!Number.isFinite(stock) || stock < 0 || stock > 9999) {
        return { error: "Stock invalide.", status: 422 as const };
      }
      product.stock = stock;
    }
    if (payload.price !== undefined) {
      const price = Number(payload.price);
      if (!Number.isFinite(price) || price <= 0 || price > 100_000) {
        return { error: "Prix invalide.", status: 422 as const };
      }
      product.price = price;
    }
    if (payload.featured !== undefined) product.featured = Boolean(payload.featured);
    if (payload.bestseller !== undefined) product.bestseller = Boolean(payload.bestseller);
    if (payload.isNew !== undefined) product.isNew = Boolean(payload.isNew);
    product.updatedAt = new Date().toISOString();
    return { product };
  });

  if (!("product" in result) || !result.product) {
    return jsonError(result.error ?? "Produit introuvable.", result.status ?? 400);
  }
  return Response.json({ ok: true, product: result.product });
}

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();
  const { id } = await params;

  const removed = await updateDb((db) => {
    const index = db.products.findIndex((entry) => entry.id === id);
    if (index === -1) return null;
    const [product] = db.products.splice(index, 1);
    for (const other of db.products) {
      other.relatedIds = other.relatedIds.filter((relatedId) => relatedId !== id);
    }
    return product;
  });

  if (!removed) return jsonError("Produit introuvable.", 404);
  return Response.json({ ok: true, removed: removed.id, name: removed.name });
}

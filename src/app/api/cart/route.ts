import { buildCartView, sanitizeCartLines } from "@/lib/cart-server";
import { readJson } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/**
 * Re-prices a cart that only exists in localStorage.
 * The client never sends prices: it sends ids + quantities, the server answers
 * with authoritative prices, stock state, shipping and discount.
 */
export async function POST(request: Request) {
  const payload = await readJson<{ lines?: unknown; code?: unknown }>(request);
  if (!payload) {
    return Response.json({ ok: false, error: "Panier illisible." }, { status: 400 });
  }

  const lines = sanitizeCartLines(payload.lines);
  const code = typeof payload.code === "string" ? payload.code.slice(0, 40) : undefined;
  const cart = await buildCartView(lines, code);

  return Response.json(
    {
      ok: true,
      lines: cart.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        lineTotal: line.lineTotal,
        available: line.available,
        maxQuantity: line.maxQuantity,
        product: {
          id: line.product.id,
          slug: line.product.slug,
          name: line.product.name,
          brandSlug: line.product.brandSlug,
          categorySlug: line.product.categorySlug,
          subcategory: line.product.subcategory,
          shortDescription: line.product.shortDescription,
          price: line.product.price,
          originalPrice: line.product.originalPrice,
          stock: line.product.stock,
          rating: line.product.rating,
          reviewCount: line.product.reviewCount,
          energyClass: line.product.energyClass,
          isNew: line.product.isNew,
          bestseller: line.product.bestseller,
          featured: line.product.featured,
          visual: line.product.visual,
          imageUrl: line.product.imageUrl,
          dimensions: line.product.dimensions,
        },
      })),
      totals: cart.totals,
      discount: cart.discount,
      settings: {
        shipping: cart.settings.shipping,
        payments: cart.settings.payments,
        demoBanner: cart.settings.demoBanner,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

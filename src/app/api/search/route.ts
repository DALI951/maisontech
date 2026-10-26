import { getStoreData } from "@/lib/catalog";
import { searchProducts } from "@/lib/search";
import { summarizeProduct } from "@/lib/product";
import { normalizeText } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const query = raw.trim().slice(0, 80);

  if (query.length < 2) {
    return Response.json({
      products: [],
      categories: [],
      brands: [],
      suggestions: [],
      total: 0,
      query,
    });
  }

  const { products, categories, brands } = await getStoreData();
  const hits = searchProducts(products, query, 500);
  const term = normalizeText(query);

  const categoryMatches = categories
    .filter((category) => normalizeText(category.name).includes(term) || normalizeText(category.shortName).includes(term))
    .slice(0, 3)
    .map((category) => ({ slug: category.slug, name: category.shortName }));

  const brandMatches = brands
    .filter((brand) => normalizeText(brand.name).includes(term))
    .slice(0, 3)
    .map((brand) => ({ slug: brand.slug, name: brand.name }));

  return Response.json(
    {
      products: hits.slice(0, 6).map(summarizeProduct),
      categories: categoryMatches,
      brands: brandMatches,
      suggestions: hits.slice(0, 5).map((product) => product.name),
      total: hits.length,
      query,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

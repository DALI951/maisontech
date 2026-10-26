import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { Badge } from "@/components/ui/primitives";
import { getStoreData } from "@/lib/catalog";
import { availabilityOf } from "@/lib/product";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = { title: "Modifier un produit" };

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const { products, brands, categories } = await getStoreData();
  const product = products.find((entry) => entry.id === id || entry.slug === id);
  if (!product) notFound();

  const availability = availabilityOf(product);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow={`Catalogue · ${product.sku}`}
        title={product.name}
        description={`Créé le ${formatDateTime(product.createdAt)} · dernière modification le ${formatDateTime(product.updatedAt)}`}
        actions={
          <>
            <Badge
              tone={
                availability === "out_of_stock" ? "out" : availability === "low_stock" ? "low" : "stock"
              }
            >
              {availability === "out_of_stock"
                ? "Rupture"
                : availability === "low_stock"
                  ? "Stock faible"
                  : "En stock"}
            </Badge>
            <Link href="/admin/produits" className="text-[12px] font-semibold text-ink-soft hover:text-accent-dark">
              ← Retour au catalogue
            </Link>
          </>
        }
      />

      <ProductForm
        product={product}
        brands={brands.map((brand) => ({ slug: brand.slug, name: brand.name }))}
        categories={categories.map((category) => ({ slug: category.slug, shortName: category.shortName }))}
      />
    </div>
  );
}

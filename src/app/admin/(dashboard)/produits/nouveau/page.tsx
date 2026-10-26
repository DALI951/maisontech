import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { getStoreData } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Nouveau produit" };

export default async function NewProductPage() {
  const { brands, categories } = await getStoreData();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Nouveau produit"
        description="Créez une fiche complète. Le produit est visible sur la boutique dès l'enregistrement."
        actions={
          <Link href="/admin/produits" className="text-[12px] font-semibold text-ink-soft hover:text-accent-dark">
            ← Retour au catalogue
          </Link>
        }
      />

      <ProductForm
        brands={brands.map((brand) => ({ slug: brand.slug, name: brand.name }))}
        categories={categories.map((category) => ({ slug: category.slug, shortName: category.shortName }))}
      />
    </div>
  );
}

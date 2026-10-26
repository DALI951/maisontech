import { AdminPageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/category-manager";
import { readDb } from "@/lib/db";
import { countByCategory } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  const database = await readDb();
  const counts = countByCategory(database.products);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Catégories"
        description="Structure du menu de la boutique. Une catégorie non vide ne peut pas être supprimée : déplacez d'abord ses produits."
      />

      <CategoryManager
        initial={database.categories.slice().sort((a, b) => a.sortOrder - b.sortOrder)}
        counts={counts}
      />
    </div>
  );
}

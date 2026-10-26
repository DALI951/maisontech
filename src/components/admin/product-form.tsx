"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconEye, IconSpinner } from "@/components/icons";
import { Alert, Button } from "@/components/ui/primitives";
import { ProductVisual } from "@/components/product/product-visual";
import { ENERGY_OPTIONS, VISUAL_SHAPE_OPTIONS, validateProductInput } from "@/lib/product-admin";
import type { Category, EnergyClass, Product, VisualShape } from "@/lib/types";
import { useToast } from "@/store/toast";

type BrandOption = { slug: string; name: string };
type CategoryOption = Pick<Category, "slug" | "shortName">;

interface FormState {
  name: string;
  brandSlug: string;
  categorySlug: string;
  subcategory: string;
  price: string;
  originalPrice: string;
  stock: string;
  shortDescription: string;
  description: string;
  specs: string;
  colors: string;
  energyClass: string;
  warranty: string;
  shape: VisualShape;
  body: string;
  imageUrl: string;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
}

function specsToText(product?: Product): string {
  if (!product) {
    return "Capacité | 300 L | performance\nClasse énergétique | A++ | energy\nDimensions (H×L×P) | 85 × 60 × 60 cm | dimensions";
  }
  return product.specs
    .map((spec) => `${spec.label} | ${spec.value}${spec.group ? ` | ${spec.group}` : ""}`)
    .join("\n");
}

function colorsToText(product?: Product): string {
  if (!product) return "Inox | #c9d2d7";
  return product.colors.map((color) => `${color.name} | ${color.hex}`).join("\n");
}

function initialState(product?: Product): FormState {
  return {
    name: product?.name ?? "",
    brandSlug: product?.brandSlug ?? "",
    categorySlug: product?.categorySlug ?? "",
    subcategory: product?.subcategory ?? "",
    price: product ? String(product.price) : "",
    originalPrice: product?.originalPrice ? String(product.originalPrice) : "",
    stock: product ? String(product.stock) : "10",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description.join("\n\n") ?? "",
    specs: specsToText(product),
    colors: colorsToText(product),
    energyClass: product?.energyClass ?? "",
    warranty: product?.warranty ?? "Garantie 2 ans (conditions de démonstration)",
    shape: product?.visual.shape ?? "fridge",
    body: product?.visual.body ?? "#cdd6db",
    imageUrl: product?.imageUrl ?? "",
    featured: product?.featured ?? false,
    bestseller: product?.bestseller ?? false,
    isNew: product?.isNew ?? true,
  };
}

export function ProductForm({
  product,
  brands,
  categories,
}: {
  product?: Product;
  brands: BrandOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const mode = product ? "edit" : "create";

  const [form, setForm] = useState<FormState>(() => initialState(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  };

  const preview = useMemo(() => {
    return {
      id: product?.id ?? "preview",
      slug: product?.slug ?? "preview",
      name: form.name || "Nouveau produit",
      brandSlug: form.brandSlug,
      categorySlug: form.categorySlug,
      subcategory: form.subcategory || "Général",
      shortDescription: form.shortDescription,
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock) || 0,
      rating: product?.rating ?? 0,
      reviewCount: product?.reviewCount ?? 0,
      energyClass: (form.energyClass || undefined) as EnergyClass | undefined,
      isNew: form.isNew,
      bestseller: form.bestseller,
      featured: form.featured,
      visual: { shape: form.shape, body: form.body },
      imageUrl: form.imageUrl || undefined,
      dimensions: product?.dimensions ?? { width: 60, height: 85, depth: 60, unit: "cm" as const },
    };
  }, [form, product]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setFormError("");

    const payload = {
      ...form,
      price: Number(form.price.replace(",", ".")),
      originalPrice: form.originalPrice ? Number(form.originalPrice.replace(",", ".")) : undefined,
      stock: Number(form.stock),
    };

    const local = validateProductInput(payload);
    if (!local.ok) {
      setErrors(local.errors);
      setFormError("Corrigez les champs signalés avant d'enregistrer.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch(
        mode === "edit" ? `/api/products/${product!.id}` : "/api/products",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; fields?: Record<string, string>; product?: Product }
        | null;

      if (!response.ok) {
        if (body?.fields) setErrors(body.fields);
        throw new Error(body?.error ?? "Enregistrement impossible.");
      }

      push({
        tone: "success",
        title: mode === "edit" ? "Produit mis à jour" : "Produit créé",
        description: body?.product?.name,
      });
      router.push("/admin/produits");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  const field = (
    key: keyof FormState,
    label: string,
    options?: { type?: string; hint?: string; placeholder?: string; span?: boolean; step?: string },
  ) => (
    <div className={options?.span ? "sm:col-span-2" : ""}>
      <label className="field-label" htmlFor={`p-${key}`}>
        {label}
      </label>
      <input
        id={`p-${key}`}
        type={options?.type ?? "text"}
        step={options?.step}
        value={form[key] as string}
        onChange={(event) => update(key, event.target.value as never)}
        placeholder={options?.placeholder}
        aria-invalid={Boolean(errors[key as string])}
        aria-describedby={errors[key as string] ? `p-${key}-error` : options?.hint ? `p-${key}-hint` : undefined}
        className="field-input"
      />
      {options?.hint && !errors[key as string] && (
        <p className="mt-1 text-[11px] text-ink-muted" id={`p-${key}-hint`}>
          {options.hint}
        </p>
      )}
      {errors[key as string] && (
        <p className="field-error" id={`p-${key}-error`} role="alert">
          {errors[key as string]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
      <div className="min-w-0 space-y-4">
        {formError && (
          <Alert tone="error" title="Produit non enregistré">
            {formError}
          </Alert>
        )}

        <section className="rounded-panel border border-line bg-surface p-4">
          <h2 className="text-[14px] font-bold text-ink">Informations générales</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {field("name", "Nom du produit *", {
              span: true,
              placeholder: "Réfrigérateur combiné 320 L No Frost",
            })}
            <div>
              <label className="field-label" htmlFor="p-brandSlug">
                Marque *
              </label>
              <select
                id="p-brandSlug"
                value={form.brandSlug}
                onChange={(event) => update("brandSlug", event.target.value)}
                className="field-input"
                aria-invalid={Boolean(errors.brandSlug)}
              >
                <option value="">Choisir…</option>
                {brands.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {errors.brandSlug && (
                <p className="field-error" role="alert">
                  {errors.brandSlug}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="p-categorySlug">
                Catégorie *
              </label>
              <select
                id="p-categorySlug"
                value={form.categorySlug}
                onChange={(event) => update("categorySlug", event.target.value)}
                className="field-input"
                aria-invalid={Boolean(errors.categorySlug)}
              >
                <option value="">Choisir…</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.shortName}
                  </option>
                ))}
              </select>
              {errors.categorySlug && (
                <p className="field-error" role="alert">
                  {errors.categorySlug}
                </p>
              )}
            </div>
            {field("subcategory", "Sous-catégorie", { placeholder: "Réfrigérateur combiné" })}
            <div>
              <label className="field-label" htmlFor="p-shape">
                Illustration
              </label>
              <select
                id="p-shape"
                value={form.shape}
                onChange={(event) => update("shape", event.target.value as VisualShape)}
                className="field-input"
              >
                {VISUAL_SHAPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {field("shortDescription", "Description courte *", {
              span: true,
              hint: "Affichée sur les cartes produit et dans les résultats de recherche.",
            })}
          </div>
        </section>

        <section className="rounded-panel border border-line bg-surface p-4">
          <h2 className="text-[14px] font-bold text-ink">Prix et stock</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {field("price", "Prix de vente (DT) *", { type: "number", step: "0.001" })}
            {field("originalPrice", "Prix barré (DT)", {
              type: "number",
              step: "0.001",
              hint: "Doit être supérieur au prix de vente.",
            })}
            {field("stock", "Stock *", { type: "number" })}
            <div>
              <label className="field-label" htmlFor="p-energyClass">
                Classe énergétique
              </label>
              <select
                id="p-energyClass"
                value={form.energyClass}
                onChange={(event) => update("energyClass", event.target.value)}
                className="field-input"
              >
                <option value="">Non applicable</option>
                {ENERGY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {field("warranty", "Garantie")}
          </div>
        </section>

        <section className="rounded-panel border border-line bg-surface p-4">
          <h2 className="text-[14px] font-bold text-ink">Contenu</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="field-label" htmlFor="p-description">
                Description * <span className="font-normal text-ink-muted">(un paragraphe par ligne)</span>
              </label>
              <textarea
                id="p-description"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                rows={5}
                className="field-input"
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && (
                <p className="field-error" role="alert">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="p-specs">
                Caractéristiques *{" "}
                <span className="font-normal text-ink-muted">
                  (une par ligne : libellé | valeur | groupe)
                </span>
              </label>
              <textarea
                id="p-specs"
                value={form.specs}
                onChange={(event) => update("specs", event.target.value)}
                rows={6}
                className="field-input font-mono text-[12px]"
                aria-invalid={Boolean(errors.specs)}
              />
              <p className="mt-1 text-[11px] text-ink-muted">
                Groupes reconnus : performance, dimensions, energy, features, general.
              </p>
              {errors.specs && (
                <p className="field-error" role="alert">
                  {errors.specs}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="p-colors">
                Coloris <span className="font-normal text-ink-muted">(nom | #hex)</span>
              </label>
              <textarea
                id="p-colors"
                value={form.colors}
                onChange={(event) => update("colors", event.target.value)}
                rows={3}
                className="field-input font-mono text-[12px]"
                aria-invalid={Boolean(errors.colors)}
              />
            </div>
            {field("imageUrl", "Photo réelle (URL, optionnel)", {
              hint: "Laissez vide pour utiliser l'illustration vectorielle générée.",
            })}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="dark" size="lg" disabled={pending}>
            {pending ? <IconSpinner size={16} /> : null}
            {mode === "edit" ? "Enregistrer les modifications" : "Créer le produit"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.push("/admin/produits")}
            disabled={pending}
          >
            Annuler
          </Button>
          {mode === "edit" && product && (
            <Link
              href={`/produit/${product.slug}`}
              className="ml-auto inline-flex items-center gap-1 text-[12px] font-semibold text-accent-dark hover:underline"
            >
              <IconEye size={13} />
              Voir sur la boutique
              <IconArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>

      <aside className="space-y-3 xl:sticky xl:top-[84px]">
        <section className="rounded-panel border border-line bg-surface p-3">
          <h2 className="text-[12.5px] font-bold text-ink">Aperçu</h2>
          <div className="mt-2 overflow-hidden rounded-tile border border-line bg-[#f7f8f7]">
            <ProductVisual product={preview} variant="front" className="aspect-[4/3] w-full p-4" />
          </div>
          <p className="mt-2 line-clamp-2 text-[12px] font-semibold text-ink">{preview.name}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">{preview.subcategory}</p>
          <p className="mt-1 text-[13px] font-bold text-ink">
            {Number.isFinite(preview.price) && preview.price > 0
              ? `${preview.price.toFixed(3)} DT`
              : "Prix à définir"}
          </p>
        </section>

        <section className="rounded-panel border border-line bg-surface p-4">
          <h2 className="text-[12.5px] font-bold text-ink">Mise en avant</h2>
          <div className="mt-2 space-y-2">
            {(
              [
                ["featured", "Vedette (page d'accueil)"],
                ["bestseller", "Meilleure vente"],
                ["isNew", "Nouveauté"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-start gap-2.5 text-[12.5px] text-ink-soft">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(event) => update(key, event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-accent"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 border-t border-line pt-3">
            <label className="field-label" htmlFor="p-body">
              Couleur de l&apos;illustration
            </label>
            <div className="flex items-center gap-2">
              <input
                id="p-body"
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(form.body) ? form.body : "#cdd6db"}
                onChange={(event) => update("body", event.target.value)}
                className="h-9 w-12 rounded-field border border-line-strong bg-surface"
                aria-label="Couleur de l'illustration"
              />
              <input
                value={form.body}
                onChange={(event) => update("body", event.target.value)}
                className="field-input h-9 flex-1 font-mono text-[12px]"
                aria-label="Code couleur hexadécimal"
              />
            </div>
            {errors.body && (
              <p className="field-error" role="alert">
                {errors.body}
              </p>
            )}
          </div>
        </section>

        <p className="px-1 text-[11px] leading-relaxed text-ink-muted">
          Les modifications sont enregistrées dans la base de démonstration locale et visibles
          immédiatement sur la boutique.
        </p>
      </aside>
    </form>
  );
}

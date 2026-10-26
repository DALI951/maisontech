import { expect, test } from "@playwright/test";

/** Storefront journey: browse → filter → product → cart → promos. */
test.describe("parcours boutique", () => {
  test("l'accueil présente l'enseigne, la navigation et des produits", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/MaisonTech/);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: /MaisonTech — accueil/i }).first()).toBeVisible();
    // Hero + a product rail must render real content, not a skeleton.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('a[href^="/produit/"]').first()).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("le catalogue affiche des produits et se trie par prix", async ({ page }) => {
    await page.goto("/produits");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/appareils/i);

    const cards = page.locator('a[href^="/produit/"]');
    expect(await cards.count()).toBeGreaterThan(0);

    await page.selectOption("#tri, select[aria-label='Trier les produits']", "prix-asc");
    await expect(page).toHaveURL(/tri=prix-asc/);
    await expect(cards.first()).toBeVisible();
  });

  test("un filtre de catégorie restreint la liste", async ({ page }) => {
    await page.goto("/categorie/refrigerateurs");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Réfrigérateur/i);
    const count = await page.locator('a[href^="/produit/"]').count();
    expect(count).toBeGreaterThan(0);

    // Empty state must never appear on a category that has products.
    await expect(page.getByText(/aucun produit/i)).toHaveCount(0);
  });

  test("la recherche du header trouve un produit", async ({ page }) => {
    await page.goto("/");
    const search = page.locator('input[type="search"]').first();
    await search.fill("lave-linge");
    await search.press("Enter");

    await expect(page).toHaveURL(/\/recherche\?/);
    await expect(page.locator('a[href^="/produit/"]').first()).toBeVisible();
  });

  test("ajouter au panier puis voir le panier", async ({ page }) => {
    await page.goto("/produits");
    await page.locator('a[href^="/produit/"]').first().click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("button", { name: /ajouter au panier/i }).first().click();

    await page.goto("/panier");
    await expect(page.getByText(/Sous-total/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Passer la commande/i })).toBeVisible();
  });

  test("un code promo invalide affiche une erreur, sans casser le panier", async ({ page }) => {
    await page.goto("/produits");
    await page.locator('a[href^="/produit/"]').first().click();
    await page.getByRole("button", { name: /ajouter au panier/i }).first().click();

    await page.goto("/panier");
    const input = page.locator("#discount-code");
    await input.fill("CODE-QUI-NEXISTE-PAS");
    await page.getByRole("button", { name: /^Appliquer$/ }).click();

    await expect(page.getByText(/n'existe pas|n’existe pas|invalide|expiré/i).first()).toBeVisible();
  });

  test("une URL inconnue renvoie une page 404 utile", async ({ page }) => {
    const response = await page.goto("/cette-page-nexiste-vraiment-pas");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /n'existe pas|n’existe pas/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Retour à l'accueil|Retour à l’accueil/i })).toBeVisible();
  });
});

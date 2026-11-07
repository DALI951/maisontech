import { expect, test } from "@playwright/test";

/**
 * Post-deploy smoke tests. They run against a real deployment:
 *   PLAYWRIGHT_LIVE_URL=https://modali.powerpme.com/maisontech npx playwright test --config=playwright.live.config.ts
 *
 * They exercise the paths that a sub-path deployment can break: client fetches
 * to /api/*, the cart, the search dropdown and the authenticated admin area.
 *
 * NOTE: `page.goto("/produits")` would resolve against the DOMAIN root and drop
 * the "/maisontech" base path, so every navigation goes through `url()`.
 */

const BASE = (process.env.PLAYWRIGHT_LIVE_URL ?? "").replace(/\/$/, "");

function url(path: string): string {
  return `${BASE}${path}`;
}

test("accueil, catalogue et fiche produit se chargent", async ({ page }) => {
  await page.goto(url("/"), { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toBeVisible();

  await page.goto(url("/produits"), { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toContainText("Tous nos appareils");

  const firstProduct = page.locator('a[href*="/produit/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();
  await expect(page.locator("h1")).toBeVisible();
});

test("ajout au panier via /api/cart (client fetch sous basePath)", async ({ page }) => {
  await page.goto(url("/produit/lave-linge-frontal-8-kg"), { waitUntil: "domcontentloaded" });

  const addToCart = page.getByRole("button", { name: /ajouter au panier/i }).first();
  await expect(addToCart).toBeVisible();
  await addToCart.click();

  await expect
    .poll(
      async () => {
        const raw = await page.evaluate(() => window.localStorage.getItem("mt.cart.v1"));
        return raw ? JSON.parse(raw).length : 0;
      },
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);

  await page.goto(url("/panier"), { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toContainText(/lave-linge/i);
});

test("recherche instantanée et connexion admin", async ({ page }) => {
  await page.goto(url("/"), { waitUntil: "domcontentloaded" });

  const search = page.locator('input[type="search"]').first();
  await expect(search).toBeVisible();
  await search.click();
  await search.fill("cafe");
  await expect(page.getByRole("option").first()).toBeVisible({ timeout: 15_000 });

  await page.goto(url("/admin/connexion"), { waitUntil: "domcontentloaded" });
  await page.fill("#admin-email", "admin@maisontech.example");
  await page.fill("#admin-password", "Admin!2345");
  await page.getByRole("button", { name: /se connecter/i }).first().click();

  await expect(page).toHaveURL(/\/admin\/?$/, { timeout: 30_000 });
  await expect(page.locator("h1").first()).toContainText(/tableau de bord/i);
});

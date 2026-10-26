import { expect, test } from "@playwright/test";

const ADMIN = { email: "admin@maisontech.example", password: "Admin!2345" };

async function adminLogin(page: import("@playwright/test").Page) {
  await page.goto("/admin/connexion");
  await page.locator("#admin-email").fill(ADMIN.email);
  await page.locator("#admin-password").fill(ADMIN.password);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("administration", () => {
  test("l'accès direct au tableau de bord exige une connexion", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/connexion/);
    await expect(page.getByRole("heading", { name: /Administration/i })).toBeVisible();
  });

  test("un compte client ne peut pas entrer dans l'administration", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.locator("#admin-email").fill("client@maisontech.example");
    await page.locator("#admin-password").fill("Client!2345");
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/admin\/connexion/);
    await expect(page.getByText(/administrateur|réservé/i).first()).toBeVisible();
  });

  test("l'administrateur voit le tableau de bord et ses indicateurs", async ({ page }) => {
    await adminLogin(page);

    await expect(page.getByRole("heading", { name: /Tableau de bord/i })).toBeVisible();
    await expect(page.getByText(/Chiffre d'affaires|Commandes|Panier moyen/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Commandes/i }).first()).toBeVisible();
  });

  test("la liste des produits est filtrable et paginée", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/produits");

    await expect(page.getByRole("heading", { level: 1, name: /Produits/i })).toBeVisible();
    const rows = page.locator("table tbody tr");
    expect(await rows.count()).toBeGreaterThan(0);

    await page.locator('input[type="search"], input[name="q"]').first().fill("lave");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/q=lave|q=lave-linge/);
  });

  test("les commandes s'ouvrent et changent de statut", async ({ page }) => {
    await adminLogin(page);
    await page.goto("/admin/commandes");

    const firstOrder = page.locator('a[href^="/admin/commandes/"]').first();
    await expect(firstOrder).toBeVisible();
    await firstOrder.click();

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const select = page.locator("select").first();
    await expect(select).toBeVisible();
    await select.selectOption("confirmed");
    await expect(page.getByText(/Confirmée/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("les pages d'administration principales répondent", async ({ page }) => {
    await adminLogin(page);
    for (const pathname of [
      "/admin/commandes",
      "/admin/produits",
      "/admin/produits/nouveau",
      "/admin/clients",
      "/admin/codes-promo",
      "/admin/categories",
      "/admin/parametres",
    ]) {
      const response = await page.goto(pathname);
      expect(response?.status(), `${pathname} doit répondre 200`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("la déconnexion ramène à l'écran de connexion admin", async ({ page }) => {
    await adminLogin(page);
    await page.getByRole("button", { name: /déconnexion/i }).click();
    await expect(page).toHaveURL(/\/admin\/connexion/);
  });
});

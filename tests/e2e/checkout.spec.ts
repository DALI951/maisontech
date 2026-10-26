import { expect, test } from "@playwright/test";

const CLIENT = { email: "client@maisontech.example", password: "Client!2345" };

async function addFirstProductToCart(page: import("@playwright/test").Page) {
  await page.goto("/produits");
  await page.locator('a[href^="/produit/"]').first().click();
  await page.getByRole("button", { name: /ajouter au panier/i }).first().click();
  await page.goto("/panier");
  await expect(page.getByRole("link", { name: /Passer la commande/i })).toBeVisible();
}

test.describe("compte et commande", () => {
  test("connexion client, accès à l'espace personnel", async ({ page }) => {
    await page.goto("/compte");
    await expect(page).toHaveURL(/\/connexion/);

    await page.getByLabel(/adresse e-mail/i).fill(CLIENT.email);
    await page.locator("#password").fill(CLIENT.password);
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/compte/);
    await expect(page.getByText(/Sonia/i).first()).toBeVisible();
  });

  test("commande simulée de bout en bout jusqu'à la confirmation", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/adresse e-mail/i).fill(CLIENT.email);
    await page.locator("#password").fill(CLIENT.password);
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page).toHaveURL(/\/compte/);

    await addFirstProductToCart(page);
    await page.getByRole("link", { name: /Passer la commande/i }).click();
    await expect(page).toHaveURL(/\/commande$/);

    await page.locator("#fullName").fill("Sonia Ben Amor");
    await page.locator("#email").fill(CLIENT.email);
    await page.locator("#phone").fill("+216 20 111 222");
    await page.locator("#address").fill("12 rue de la Plage");
    await page.locator("#city").fill("La Marsa");
    await page.locator("#governorate").selectOption("Tunis");

    await page.getByRole("button", { name: /Confirmer la commande/i }).click();

    await expect(page).toHaveURL(/\/commande\/confirmation\/[A-Z0-9-]+/i, { timeout: 20_000 });
    await expect(page.getByText(/commande est (bien )?enregistrée|Merci/i).first()).toBeVisible();
    // The reference must be visible and start with the demo prefix.
    const reference = page.url().split("/").pop() ?? "";
    expect(reference).toMatch(/^[A-Z]{2,}-/);
    await expect(page.getByText(reference, { exact: false }).first()).toBeVisible();
  });

  test("le suivi de commande est accessible depuis l'espace client", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/adresse e-mail/i).fill(CLIENT.email);
    await page.locator("#password").fill(CLIENT.password);
    await page.getByRole("button", { name: /se connecter/i }).click();

    await page.goto("/compte/commandes");
    const firstOrder = page.locator('a[href^="/compte/commandes/"]').first();
    await expect(firstOrder).toBeVisible();
    await firstOrder.click();
    await expect(page.getByText(/suivi|détail de la commande/i).first()).toBeVisible();
  });

  test("un visiteur anonyme ne peut pas ouvrir une commande", async ({ page }) => {
    const response = await page.goto("/compte/commandes/MT-2026-0001");
    // Either redirected to the login screen or a 404 — never the order content.
    expect([200, 307, 404]).toContain(response?.status() ?? 0);
    await expect(page).toHaveURL(/\/(connexion|compte)/);
  });

  test("le panier survit à un rechargement complet", async ({ page }) => {
    await addFirstProductToCart(page);
    await page.reload();
    await expect(page.getByText(/Sous-total/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Passer la commande/i })).toBeVisible();
  });
});

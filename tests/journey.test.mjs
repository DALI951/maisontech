import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * End-to-end HTTP journey against a production build.
 *
 * Run `npm run build` first (or `npm run battery`, which does it for you).
 * The server starts on its own port with a throwaway database, so the developer
 * data in `.data/` is never touched.
 */

const PORT = 3311;
const BASE = `http://127.0.0.1:${PORT}`;
const ROOT = path.resolve(import.meta.dirname, "..");

let server;
let cookie = "";
const tempDir = mkdtempSync(path.join(tmpdir(), "maisontech-test-"));

function cookieHeader(response) {
  const raw = response.headers.getSetCookie?.() ?? [];
  return raw.map((entry) => entry.split(";")[0]).join("; ");
}

async function api(pathname, init = {}) {
  const response = await fetch(`${BASE}${pathname}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { response, json, text };
}

async function login(email, password) {
  const { response } = await api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200, `login ${email} should succeed`);
  const next = cookieHeader(response);
  assert.match(next, /mt_session=/, "login must set the session cookie");
  cookie = next;
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/api/auth/me`);
      if (response.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error("le serveur de test n'a pas démarré");
}

before(async () => {
  server = spawn(
    process.execPath,
    [path.join(ROOT, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(PORT)],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        NODE_ENV: "production",
        DEMO_DB_PATH: path.join(tempDir, "journey-db.json"),
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", () => {});
  server.stderr.on("data", () => {});
  await waitForServer();
});

after(async () => {
  if (server && !server.killed) {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
    } else {
      server.kill("SIGTERM");
    }
  }
  rmSync(tempDir, { recursive: true, force: true });
});

describe("catalogue public", () => {
  it("sert la page d'accueil avec l'en-tête et le pied de page", async () => {
    const response = await fetch(`${BASE}/`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /MaisonTech/);
    assert.match(html, /Ajouter au panier|Voir le produit|Tous les produits/);
    assert.match(html, /Newsletter|newsletter/);
  });

  it("contient au moins 60 produits répartis dans 12 catégories", async () => {
    // The whole dataset is not exposed through a public list endpoint, so read
    // the throwaway database the server just seeded.
    await api("/api/products");
    const database = JSON.parse(readFileSync(path.join(tempDir, "journey-db.json"), "utf8"));

    assert.ok(database.products.length >= 60, `attendu >= 60 produits, reçu ${database.products.length}`);
    const categories = new Set(database.products.map((product) => product.categorySlug));
    assert.equal(categories.size, 12);
    for (const product of database.products) {
      assert.ok(product.price > 0, `${product.slug} doit avoir un prix`);
      assert.ok(product.stock >= 0);
      assert.ok(product.slug && product.name, `${product.id} est incomplet`);
    }
    const slugs = database.products.map((product) => product.slug);
    assert.equal(new Set(slugs).size, slugs.length, "les slugs produits doivent être uniques");
  });

  it("filtre et pagine la liste des produits", async () => {
    const response = await fetch(`${BASE}/produits?tri=prix-asc&page=2&parPage=12`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /href="\/produit\//);
    assert.equal(response.headers.get("content-type")?.includes("text/html"), true);
  });

  it("trouve les produits sans accents (recherche normalisée)", async () => {
    const { json } = await api("/api/search?q=refrigerateur");
    assert.ok(json.products.length > 0, "refrigerateur doit trouver les réfrigérateurs");
    const { json: brandsOnly } = await api("/api/search?q=zzzz-introuvable");
    assert.equal(brandsOnly.products.length, 0);
  });

  it("renvoie 404 sur un produit inexistant et une URL inconnue", async () => {
    const missing = await fetch(`${BASE}/produit/produit-qui-nexiste-pas`);
    assert.equal(missing.status, 404);
    const unknown = await fetch(`${BASE}/url-inconnue-xyz`);
    assert.equal(unknown.status, 404);
    const html = await unknown.text();
    assert.match(html, /404/);
  });

  it("expose un sitemap et un robots.txt cohérents", async () => {
    const sitemap = await fetch(`${BASE}/sitemap.xml`);
    assert.equal(sitemap.status, 200);
    const xml = await sitemap.text();
    assert.match(xml, /<urlset/);
    assert.match(xml, /\/produit\//);
    assert.match(xml, /\/categorie\//);

    const robots = await fetch(`${BASE}/robots.txt`);
    assert.equal(robots.status, 200);
    const txt = await robots.text();
    assert.match(txt, /Disallow: \/admin/);
    assert.match(txt, /Sitemap: .*sitemap\.xml/);
  });
});

describe("panier et codes promo", () => {
  it("recalcule le panier côté serveur et applique une remise valide", async () => {
    const { json: catalogue } = await api("/api/products");
    const [first, second] = catalogue.products.sort((a, b) => b.price - a.price);

    const { response, json } = await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        lines: [
          { productId: first.id, quantity: 1 },
          { productId: second.id, quantity: 2 },
        ],
        code: "BIENVENUE10",
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(json.lines.length, 2);
    assert.equal(json.lines.find((line) => line.productId === second.id).quantity, 2);
    assert.ok(json.totals.subtotal >= 500, "le panier doit dépasser le minimum de la promo");
    assert.equal(json.discount.valid, true, "BIENVENUE10 doit être acceptée");
    assert.ok(json.totals.discount > 0);
    assert.equal(
      json.totals.total,
      json.totals.subtotal - json.totals.discount + json.totals.shipping,
      "total = sous-total - remise + livraison",
    );
    assert.ok(json.totals.total <= json.totals.subtotal, "la remise doit réduire le total");
  });

  it("refuse un code promo expiré et ignore les identifiants inconnus", async () => {
    const { json: catalogue } = await api("/api/products");
    const product = catalogue.products[0];

    const { json } = await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({ lines: [{ productId: product.id, quantity: 1 }], code: "PROMO2025" }),
    });
    assert.equal(json.discount.valid, false, "PROMO2025 est expiré");
    assert.equal(json.totals.discount, 0);

    const { json: withFake } = await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({
        lines: [
          { productId: "produit-inexistant", quantity: 1 },
          { productId: product.id, quantity: 1 },
        ],
      }),
    });
    assert.equal(withFake.lines.length, 1, "les lignes inconnues sont écartées");
  });

  it("plafonne les quantités au stock disponible", async () => {
    const { json: catalogue } = await api("/api/products?full=1");
    const product = catalogue.products.find((item) => item.stock > 0);
    const { json } = await api("/api/cart", {
      method: "POST",
      body: JSON.stringify({ lines: [{ productId: product.id, quantity: 999 }] }),
    });
    assert.ok(json.lines[0].quantity <= Math.min(10, product.stock));
  });
});

describe("comptes, commandes et administration", () => {
  it("protège l'administration côté serveur", async () => {
    const response = await fetch(`${BASE}/admin`, { redirect: "manual" });
    assert.ok([307, 308, 302].includes(response.status), `attendu une redirection, reçu ${response.status}`);
    assert.match(response.headers.get("location") ?? "", /\/admin\/connexion/);

    const anonymous = await api("/api/admin/stats");
    assert.equal(anonymous.response.status, 401);
  });

  it("refuse un mauvais mot de passe puis connecte le client de démonstration", async () => {
    const bad = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "client@maisontech.example", password: "mauvais" }),
    });
    assert.equal(bad.response.status, 401);

    await login("client@maisontech.example", "Client!2345");

    const me = await api("/api/auth/me");
    assert.equal(me.response.status, 200);
    assert.equal(me.json.user.email, "client@maisontech.example");
    assert.ok(!JSON.stringify(me.json).includes("password"), "aucun mot de passe ne doit sortir de l'API");
  });

  it("crée une commande simulée visible dans l'espace client", async () => {
    const { json: catalogue } = await api("/api/products");
    const product = catalogue.products[0];

    const { response, json } = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        fullName: "Sonia Ben Amor",
        email: "client@maisontech.example",
        phone: "+216 20 111 222",
        address: "12 rue de la Plage",
        city: "La Marsa",
        governorate: "Tunis",
        paymentMethod: "cod",
        lines: [{ productId: product.id, quantity: 1 }],
        discountCode: "",
      }),
    });

    assert.equal(response.status, 201, JSON.stringify(json));
    assert.ok(json.order.reference);
    assert.equal(json.order.status, "pending");

    const list = await api("/api/orders");
    assert.equal(list.response.status, 200);
    assert.ok(list.json.orders.some((order) => order.reference === json.order.reference));

    const page = await fetch(`${BASE}/compte/commandes/${json.order.reference}`, {
      headers: { cookie },
    });
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, new RegExp(json.order.reference));
  });

  it("refuse une commande sans lignes valides", async () => {
    const { response, json } = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        fullName: "Sonia Ben Amor",
        email: "client@maisontech.example",
        phone: "+216 20 111 222",
        address: "12 rue de la Plage",
        city: "La Marsa",
        governorate: "Tunis",
        paymentMethod: "cod",
        lines: [],
      }),
    });
    assert.ok(response.status >= 400);
    assert.equal(json.ok, false);
  });

  it("connecte l'administrateur et sert les statistiques", async () => {
    cookie = "";
    await login("admin@maisontech.example", "Admin!2345");

    const dashboard = await fetch(`${BASE}/admin`, { headers: { cookie } });
    assert.equal(dashboard.status, 200);
    const html = await dashboard.text();
    assert.match(html, /Tableau de bord|Vue d'ensemble|Commandes/);

    const stats = await api("/api/admin/stats");
    assert.equal(stats.response.status, 200);
    assert.ok(stats.json.stats, "les statistiques doivent être renvoyées");

    const orders = await fetch(`${BASE}/admin/commandes`, { headers: { cookie } });
    assert.equal(orders.status, 200);
  });

  it("valide le formulaire de contact", async () => {
    const invalid = await api("/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "A", email: "nope", subject: "", message: "court" }),
    });
    assert.equal(invalid.response.status, 422);
    assert.ok(invalid.json.fields.email);

    const valid = await api("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Journey",
        email: "test@example.tn",
        subject: "Question produit",
        message: "Bonjour, je souhaite connaître la largeur exacte du modèle testé.",
      }),
    });
    assert.equal(valid.response.status, 201);
    assert.equal(valid.json.ok, true);
  });

  it("expose les pages éditoriales", async () => {
    const pages = [
      "/a-propos",
      "/contact",
      "/faq",
      "/livraison",
      "/retours",
      "/cgv",
      "/confidentialite",
      "/mentions-legales",
      "/marques",
      "/promotions",
    ];
    for (const pathname of pages) {
      const response = await fetch(`${BASE}${pathname}`);
      assert.equal(response.status, 200, `${pathname} doit répondre 200`);
    }
  });
});

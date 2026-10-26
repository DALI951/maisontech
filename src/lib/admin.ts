import type { Database, Order, Product } from "./types";
import { addMoney, fromMillimes, toMillimes } from "./money";
import { availabilityOf } from "./product";

export interface AdminStats {
  revenue: number;
  deliveredRevenue: number;
  orderCount: number;
  averageBasket: number;
  customerCount: number;
  productCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingCount: number;
  subscriberCount: number;
  openMessages: number;
  statusCounts: { status: Order["status"]; label: string; count: number }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { slug: string; name: string; units: number; revenue: number }[];
  categoryPerformance: { slug: string; name: string; units: number; revenue: number }[];
  lowStock: Pick<Product, "id" | "slug" | "name" | "stock" | "categorySlug">[];
  recentOrders: Order[];
  discountUsage: { code: string; usedCount: number; maxUses: number | null; revenue: number }[];
}

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmées",
  preparing: "En préparation",
  shipped: "Expédiées",
  delivered: "Livrées",
  cancelled: "Annulées",
};

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Demo analytics computed from the demo database.
 * Revenue excludes cancelled orders; "deliveredRevenue" is the conservative view.
 */
export function buildAdminStats(database: Database, now: Date = new Date()): AdminStats {
  const active = database.orders.filter((order) => order.status !== "cancelled");
  const delivered = active.filter((order) => order.status === "delivered");

  const revenue = addMoney(...active.map((order) => order.total));
  const deliveredRevenue = addMoney(...delivered.map((order) => order.total));
  const orderCount = active.length;

  const statusCounts = (Object.keys(STATUS_LABELS) as Order["status"][]).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: database.orders.filter((order) => order.status === status).length,
  }));

  // Last 30 days, zero-filled so the chart never lies about gaps.
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let offset = 29; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    byDay.set(dayKey(date), { revenue: 0, orders: 0 });
  }
  for (const order of active) {
    const key = dayKey(new Date(order.createdAt));
    const bucket = byDay.get(key);
    if (!bucket) continue;
    bucket.revenue = fromMillimes(toMillimes(bucket.revenue) + toMillimes(order.total));
    bucket.orders += 1;
  }

  const productTotals = new Map<string, { units: number; revenue: number }>();
  const categoryTotals = new Map<string, { units: number; revenue: number }>();
  const productById = new Map(database.products.map((product) => [product.id, product]));
  const categoryBySlug = new Map(database.categories.map((category) => [category.slug, category]));

  for (const order of active) {
    for (const item of order.items) {
      const productEntry = productTotals.get(item.slug) ?? { units: 0, revenue: 0 };
      productEntry.units += item.quantity;
      productEntry.revenue = fromMillimes(
        toMillimes(productEntry.revenue) + toMillimes(item.lineTotal),
      );
      productTotals.set(item.slug, productEntry);

      const categorySlug = productById.get(item.productId)?.categorySlug ?? "inconnu";
      const categoryEntry = categoryTotals.get(categorySlug) ?? { units: 0, revenue: 0 };
      categoryEntry.units += item.quantity;
      categoryEntry.revenue = fromMillimes(
        toMillimes(categoryEntry.revenue) + toMillimes(item.lineTotal),
      );
      categoryTotals.set(categorySlug, categoryEntry);
    }
  }

  const topProducts = [...productTotals.entries()]
    .map(([slug, totals]) => {
      const product = database.products.find((entry) => entry.slug === slug);
      return {
        slug,
        name: product?.name ?? slug,
        units: totals.units,
        revenue: totals.revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const categoryPerformance = [...categoryTotals.entries()]
    .map(([slug, totals]) => ({
      slug,
      name: categoryBySlug.get(slug)?.shortName ?? slug,
      units: totals.units,
      revenue: totals.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const lowStock = database.products
    .filter((product) => product.stock > 0 && product.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      stock: product.stock,
      categorySlug: product.categorySlug,
    }));

  const discountUsage = database.discounts
    .map((discount) => {
      const code = discount.code.toUpperCase();
      const orders = database.orders.filter(
        (order) => order.status !== "cancelled" && order.discountCode?.toUpperCase() === code,
      );
      return {
        code: discount.code,
        usedCount: discount.usedCount,
        maxUses: discount.maxUses,
        revenue: addMoney(...orders.map((order) => order.total)),
      };
    })
    .sort((a, b) => b.usedCount - a.usedCount);

  return {
    revenue,
    deliveredRevenue,
    orderCount,
    averageBasket: orderCount > 0 ? fromMillimes(Math.round(toMillimes(revenue) / orderCount)) : 0,
    customerCount: database.users.filter((user) => user.role === "customer").length,
    productCount: database.products.length,
    lowStockCount: database.products.filter((product) => product.stock > 0 && product.stock <= 5).length,
    outOfStockCount: database.products.filter((product) => availabilityOf(product) === "out_of_stock")
      .length,
    pendingCount: database.orders.filter((order) => order.status === "pending").length,
    subscriberCount: database.subscribers.length,
    openMessages: database.messages.filter((message) => !message.handled).length,
    statusCounts,
    salesByDay: [...byDay.entries()].map(([date, value]) => ({ date, ...value })),
    topProducts,
    categoryPerformance,
    lowStock,
    recentOrders: database.orders.slice(0, 6),
    discountUsage,
  };
}

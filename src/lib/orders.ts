import type { CheckoutInput } from "./validation";
import { readDb, updateDb } from "./db";
import { buildCartView } from "./cart-server";
import { availabilityOf } from "./product";
import { multiplyMoney } from "./money";
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "./types";

/**
 * Order creation lives here (server only).
 *
 * DEMO BEHAVIOUR, ON PURPOSE:
 *  - no payment is captured, ever — `simulated` is always true;
 *  - stock is decremented so the admin stock screens react to sales;
 *  - nothing is emailed and nothing ships.
 */

export interface CreateOrderInput extends CheckoutInput {
  lines: { productId: string; quantity: number }[];
  discountCode?: string;
  userId?: string;
}

export interface CreateOrderResult {
  ok: boolean;
  error?: string;
  order?: Order;
}

const MAX_QUANTITY = 10;

function reference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `MT-${stamp}${random}`;
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"].includes(value)
  );
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "cod" || value === "bank_transfer" || value === "online";
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const cart = await buildCartView(input.lines, input.discountCode);
  const purchaseable = cart.lines.filter((line) => line.available);

  if (purchaseable.length === 0) {
    return {
      ok: false,
      error:
        "Aucun article disponible dans le panier. Retirez les articles indisponibles ou ajoutez un autre appareil.",
    };
  }

  if (cart.settings.demoBanner && input.paymentMethod === "online") {
    return {
      ok: false,
      error:
        "Le paiement en ligne n'est pas activé dans cette démonstration. Choisissez le paiement à la livraison ou le virement.",
    };
  }

  if (input.paymentMethod === "cod" && !cart.settings.payments.cashOnDelivery) {
    return { ok: false, error: "Le paiement à la livraison est momentanément indisponible." };
  }
  if (input.paymentMethod === "bank_transfer" && !cart.settings.payments.bankTransfer) {
    return { ok: false, error: "Le virement bancaire est momentanément indisponible." };
  }

  const created = await updateDb((database) => {
    // Re-check stock inside the write lock: two tabs can submit at once.
    for (const line of purchaseable) {
      const product = database.products.find((entry) => entry.id === line.productId);
      if (!product) {
        return { ok: false as const, error: "Un article du panier n'existe plus dans le catalogue." };
      }
      const wanted = Math.min(MAX_QUANTITY, line.quantity);
      if (availabilityOf(product) === "out_of_stock" || product.stock < wanted) {
        return {
          ok: false as const,
          error: `Stock insuffisant pour « ${product.name} » (${product.stock} disponible(s)).`,
        };
      }
    }

    const items: OrderItem[] = purchaseable.map((line) => ({
      productId: line.productId,
      slug: line.product.slug,
      name: line.product.name,
      brandSlug: line.product.brandSlug,
      quantity: line.quantity,
      unitPrice: line.product.price,
      lineTotal: multiplyMoney(line.product.price, line.quantity),
    }));

    const now = new Date().toISOString();
    const order: Order = {
      id: `ord-${Date.now().toString(36)}`,
      reference: reference(),
      createdAt: now,
      updatedAt: now,
      status: "pending",
      customer: {
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        city: input.city.trim(),
        governorate: input.governorate.trim(),
        notes: input.notes?.trim() || undefined,
      },
      items,
      subtotal: cart.totals.subtotal,
      shipping: cart.totals.shipping,
      discount: cart.totals.discount,
      discountCode: cart.discount.valid ? cart.discount.code : undefined,
      total: cart.totals.total,
      paymentMethod: input.paymentMethod,
      simulated: true,
      userId: input.userId,
    };

    for (const item of items) {
      const product = database.products.find((entry) => entry.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.updatedAt = now;
      }
    }

    if (order.discountCode) {
      const discount = database.discounts.find(
        (entry) => entry.code.toUpperCase() === order.discountCode?.toUpperCase(),
      );
      if (discount) discount.usedCount += 1;
    }

    database.orders.unshift(order);

    if (input.userId) {
      const user = database.users.find((entry) => entry.id === input.userId);
      if (user && user.addresses.length === 0) {
        user.addresses.push({
          id: `addr-${Date.now().toString(36)}`,
          label: "Adresse de livraison",
          fullName: order.customer.fullName,
          phone: order.customer.phone,
          address: order.customer.address,
          city: order.customer.city,
          governorate: order.customer.governorate,
          isDefault: true,
        });
      }
    }

    return { ok: true as const, order };
  });

  return created.ok ? { ok: true, order: created.order } : { ok: false, error: created.error };
}

export async function getOrderByReference(reference: string): Promise<Order | undefined> {
  const database = await readDb();
  const wanted = reference.trim().toUpperCase();
  return database.orders.find((order) => order.reference.toUpperCase() === wanted);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const database = await readDb();
  return database.orders.find((order) => order.id === id);
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const database = await readDb();
  return database.orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  return updateDb((database) => {
    const order = database.orders.find((entry) => entry.id === orderId);
    if (!order) return undefined;
    if (order.status === "cancelled" && status !== "cancelled") return order;
    // Cancelling puts the stock back so the catalogue stays honest.
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const product = database.products.find((entry) => entry.id === item.productId);
        if (product) product.stock += item.quantity;
      }
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  });
}

/**
 * Domain types for the MaisonTech demo store.
 *
 * Everything here describes *demo* content. Prices are stored as plain numbers
 * in Tunisian dinars (3 decimals max) and are never formatted into strings in
 * the data layer.
 */

export type EnergyClass =
  | "A+++"
  | "A++"
  | "A+"
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G";

export type VisualShape =
  | "fridge"
  | "fridge-side"
  | "freezer"
  | "washer"
  | "washer-dryer"
  | "dishwasher"
  | "cooker"
  | "oven"
  | "hob"
  | "hood"
  | "microwave"
  | "ac"
  | "tv"
  | "vacuum"
  | "coffee"
  | "mixer"
  | "kettle"
  | "heater"
  | "toaster"
  | "fryer"
  | "iron"
  | "fan";

export type Availability = "in_stock" | "low_stock" | "out_of_stock";

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  sortOrder: number;
  featured: boolean;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  origin: string;
  description: string;
  accent: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Specification {
  label: string;
  value: string;
  /** Used by the comparison view to decide whether two rows are comparable. */
  group?: "performance" | "dimensions" | "energy" | "features" | "general";
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandSlug: string;
  categorySlug: string;
  subcategory: string;
  sku: string;
  price: number;
  originalPrice?: number;
  shortDescription: string;
  description: string[];
  specs: Specification[];
  colors: ProductColor[];
  dimensions: { width: number; height: number; depth: number; unit: "cm" };
  weightKg: number;
  energyClass?: EnergyClass;
  stock: number;
  warranty: string;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  keywords: string[];
  relatedIds: string[];
  visual: { shape: VisualShape; body: string };
  /** Optional real photography. Falls back to the vector illustration when empty. */
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Trimmed product payload for cards, rails and search suggestions.
 * Keeps client bundles small while still carrying everything the visuals need.
 */
export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brandSlug: string;
  categorySlug: string;
  subcategory: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  energyClass?: EnergyClass;
  isNew: boolean;
  bestseller: boolean;
  featured: boolean;
  visual: { shape: VisualShape; body: string };
  imageUrl?: string;
  dimensions: { width: number; height: number; depth: number; unit: "cm" };
}

export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minOrder: number;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
}

export type PaymentMethod = "cod" | "bank_transfer" | "online";

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  brandSlug: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    governorate: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  /** Demo orders are simulated: no payment is captured and nothing ships. */
  simulated: boolean;
  userId?: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  createdAt: string;
  addresses: Address[];
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
  addresses: Address[];
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  body: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  categorySlug: string;
  productSlug: string;
  discountLabel: string;
  expiresAt: string | null;
  theme: "light" | "navy";
}

export interface StoreSettings {
  brandName: string;
  brandTagline: string;
  announcements: string[];
  supportPhone: string;
  supportEmail: string;
  supportHours: string;
  storeAddress: string;
  shipping: {
    flatRate: number;
    freeShippingThreshold: number;
    expressRate: number;
    estimatedDays: string;
    returnsDays: number;
  };
  payments: {
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    onlinePayment: boolean;
  };
  trustBadges: { title: string; description: string; icon: string }[];
  newsletter: { heading: string; description: string; note: string };
  hero: HeroSlide[];
  featuredCategorySlugs: string[];
  demoBanner: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
}

export interface Database {
  version: number;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  users: User[];
  sessions: Session[];
  discounts: DiscountCode[];
  reviews: Review[];
  settings: StoreSettings;
  subscribers: NewsletterSubscriber[];
  messages: ContactMessage[];
}

/** Cart line as persisted in localStorage. Prices are re-validated server-side. */
export interface CartLine {
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface CartLineView extends CartLine {
  product: Product;
  lineTotal: number;
  available: boolean;
  maxQuantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  freeShippingRemaining: number;
}

import { db } from "@/db";
import { products, categories, brands, inventory, reviews } from "@/db/schema";
import { and, asc, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import type { ProductListItem, ProductDetail, CategorySummary, BrandSummary } from "@/types/catalog";

const productListSelect = {
  id: products.id,
  sku: products.sku,
  name: products.name,
  slug: products.slug,
  images: products.images,
  price: products.price,
  mrp: products.mrp,
  unit: products.unit,
  rating: products.rating,
  ratingCount: products.ratingCount,
  isFeatured: products.isFeatured,
  isBestSeller: products.isBestSeller,
  categoryName: categories.name,
  categorySlug: categories.slug,
  brandName: brands.name,
  stockQty: sql<number>`coalesce(${inventory.quantity} - ${inventory.reservedQty}, 0)`,
};

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price_asc" | "price_desc" | "newest" | "rating";
  featuredOnly?: boolean;
  bestSellerOnly?: boolean;
  limit?: number;
};

const FALLBACK_CATEGORIES: CategorySummary[] = [
  {
    id: "cat-1",
    name: "Paints & Painting Supplies",
    slug: "paints-painting-supplies",
    description: "Interior & exterior emulsions, primers, wall putty, brushes and rollers.",
    imageUrl: "/paint_buckets.jpg",
    icon: "paint",
    productCount: 4,
  },
  {
    id: "cat-2",
    name: "Plumbing",
    slug: "plumbing",
    description: "PVC & CPVC pipes, fittings, taps, valves and bathroom fixtures.",
    imageUrl: "/plumbing_supplies.jpg",
    icon: "pipe",
    productCount: 3,
  },
  {
    id: "cat-3",
    name: "Electrical",
    slug: "electrical",
    description: "Wires, cables, switches, MCBs, and lighting.",
    imageUrl: "/electrical_hardware.jpg",
    icon: "bolt",
    productCount: 2,
  },
  {
    id: "cat-4",
    name: "Hardware & Tools",
    slug: "hardware-tools",
    description: "Hand tools, power tools, fasteners and locks.",
    imageUrl: "/storefront_hero.jpg",
    icon: "wrench",
    productCount: 3,
  },
  {
    id: "cat-5",
    name: "Construction Materials",
    slug: "construction-materials",
    description: "Cement, wall putty, waterproofing and masonry supplies.",
    imageUrl: "/storefront_hero.jpg",
    icon: "brick",
    productCount: 1,
  },
];

const FALLBACK_BRANDS: BrandSummary[] = [
  { id: "b-1", name: "Asian Paints", slug: "asian-paints", logoUrl: null, productCount: 1 },
  { id: "b-2", name: "Berger Paints", slug: "berger-paints", logoUrl: null, productCount: 2 },
  { id: "b-3", name: "Finolex", slug: "finolex", logoUrl: null, productCount: 1 },
  { id: "b-4", name: "Astral Pipes", slug: "astral-pipes", logoUrl: null, productCount: 1 },
  { id: "b-5", name: "Havells", slug: "havells", logoUrl: null, productCount: 1 },
  { id: "b-6", name: "Anchor", slug: "anchor", logoUrl: null, productCount: 1 },
  { id: "b-7", name: "Stanley", slug: "stanley", logoUrl: null, productCount: 2 },
  { id: "b-8", name: "UltraTech Cement", slug: "ultratech-cement", logoUrl: null, productCount: 1 },
];

const FALLBACK_PRODUCTS: ProductDetail[] = [
  {
    id: "prod-1",
    sku: "AP-EMU-4L",
    name: "Asian Paints Tractor Emulsion 4L",
    slug: "asian-paints-tractor-emulsion-4l",
    description: "Smooth-finish interior emulsion paint offering excellent coverage and washability. Ideal for bedrooms, living rooms and offices.",
    specifications: { Coverage: "140-160 sq.ft/litre", Finish: "Matt", Base: "Water", "Pack Size": "4 Litre" },
    images: ["/paint_buckets.jpg"],
    price: "780.00",
    mrp: "899.00",
    unit: "can",
    categoryName: "Paints & Painting Supplies",
    categorySlug: "paints-painting-supplies",
    brandName: "Asian Paints",
    stockQty: 42,
    rating: "4.8",
    ratingCount: 24,
    isFeatured: true,
    isBestSeller: true,
    categoryId: "cat-1",
    brandId: "b-1",
    lowStockAt: 5,
  },
  {
    id: "prod-2",
    sku: "BP-WP-20KG",
    name: "Berger WeatherCoat Wall Putty 20kg",
    slug: "berger-weathercoat-wall-putty-20kg",
    description: "White cement-based wall putty for a smooth, durable base before painting.",
    specifications: { Coverage: "18-20 sq.ft/kg", Type: "White Cement Putty", "Pack Size": "20 kg" },
    images: ["/paint_buckets.jpg"],
    price: "620.00",
    mrp: "699.00",
    unit: "bag",
    categoryName: "Paints & Painting Supplies",
    categorySlug: "paints-painting-supplies",
    brandName: "Berger Paints",
    stockQty: 30,
    rating: "4.7",
    ratingCount: 18,
    isFeatured: false,
    isBestSeller: true,
    categoryId: "cat-1",
    brandId: "b-2",
    lowStockAt: 5,
  },
  {
    id: "prod-3",
    sku: "FIN-PVC-4IN",
    name: "Finolex PVC Pipe 4 inch (3m length)",
    slug: "finolex-pvc-pipe-4-inch-3m",
    description: "ISI-marked rigid PVC pipe for drainage and plumbing lines. Corrosion resistant and long-lasting.",
    specifications: { Diameter: "4 inch", Length: "3 metre", Pressure: "6 kgf/cm²" },
    images: ["/plumbing_supplies.jpg"],
    price: "540.00",
    mrp: "600.00",
    unit: "pc",
    categoryName: "Plumbing",
    categorySlug: "plumbing",
    brandName: "Finolex",
    stockQty: 60,
    rating: "4.9",
    ratingCount: 32,
    isFeatured: true,
    isBestSeller: false,
    categoryId: "cat-2",
    brandId: "b-3",
    lowStockAt: 10,
  },
  {
    id: "prod-4",
    sku: "AST-CPVC-1IN",
    name: "Astral CPVC Pipe 1 inch (3m length)",
    slug: "astral-cpvc-pipe-1-inch-3m",
    description: "Hot & cold water CPVC pipe, rated for pressure plumbing applications.",
    specifications: { Diameter: "1 inch", Length: "3 metre", "Max Temp": "93°C" },
    images: ["/plumbing_supplies.jpg"],
    price: "310.00",
    mrp: "350.00",
    unit: "pc",
    categoryName: "Plumbing",
    categorySlug: "plumbing",
    brandName: "Astral Pipes",
    stockQty: 4,
    rating: "4.6",
    ratingCount: 12,
    isFeatured: false,
    isBestSeller: false,
    categoryId: "cat-2",
    brandId: "b-4",
    lowStockAt: 5,
  },
  {
    id: "prod-5",
    sku: "HAV-WIRE-1.5",
    name: "Havells 1.5 sq.mm FR PVC Wire (90m coil)",
    slug: "havells-1-5-sqmm-fr-wire-90m",
    description: "Flame-retardant copper wiring for domestic and light commercial electrical circuits.",
    specifications: { "Cross Section": "1.5 sq.mm", Length: "90 metre", Type: "FR PVC Insulated" },
    images: ["/electrical_hardware.jpg"],
    price: "1450.00",
    mrp: "1650.00",
    unit: "coil",
    categoryName: "Electrical",
    categorySlug: "electrical",
    brandName: "Havells",
    stockQty: 25,
    rating: "4.9",
    ratingCount: 45,
    isFeatured: true,
    isBestSeller: true,
    categoryId: "cat-3",
    brandId: "b-5",
    lowStockAt: 5,
  },
  {
    id: "prod-6",
    sku: "ANC-SWITCH-6A",
    name: "Anchor Roma 6A Modular Switch",
    slug: "anchor-roma-6a-modular-switch",
    description: "Elegant white modular switch with silver-alloy contacts for long life.",
    specifications: { Rating: "6A, 240V", Series: "Roma", Color: "White" },
    images: ["/electrical_hardware.jpg"],
    price: "45.00",
    mrp: "60.00",
    unit: "pc",
    categoryName: "Electrical",
    categorySlug: "electrical",
    brandName: "Anchor",
    stockQty: 200,
    rating: "4.7",
    ratingCount: 50,
    isFeatured: false,
    isBestSeller: true,
    categoryId: "cat-3",
    brandId: "b-6",
    lowStockAt: 20,
  },
  {
    id: "prod-7",
    sku: "STN-HAMMER-500",
    name: "Stanley Claw Hammer 500g",
    slug: "stanley-claw-hammer-500g",
    description: "Drop-forged steel hammer with a fibreglass shock-absorbing handle.",
    specifications: { Weight: "500g", "Handle Material": "Fibreglass" },
    images: ["/storefront_hero.jpg"],
    price: "420.00",
    mrp: "480.00",
    unit: "pc",
    categoryName: "Hardware & Tools",
    categorySlug: "hardware-tools",
    brandName: "Stanley",
    stockQty: 18,
    rating: "4.8",
    ratingCount: 15,
    isFeatured: true,
    isBestSeller: false,
    categoryId: "cat-4",
    brandId: "b-7",
    lowStockAt: 5,
  },
  {
    id: "prod-8",
    sku: "STN-TAPE-5M",
    name: "Stanley Measuring Tape 5m",
    slug: "stanley-measuring-tape-5m",
    description: "Durable steel measuring tape with a sturdy locking mechanism.",
    specifications: { Length: "5 metre", Blade: "Steel" },
    images: ["/storefront_hero.jpg"],
    price: "180.00",
    mrp: "220.00",
    unit: "pc",
    categoryName: "Hardware & Tools",
    categorySlug: "hardware-tools",
    brandName: "Stanley",
    stockQty: 55,
    rating: "4.7",
    ratingCount: 22,
    isFeatured: false,
    isBestSeller: true,
    categoryId: "cat-4",
    brandId: "b-7",
    lowStockAt: 5,
  },
  {
    id: "prod-9",
    sku: "UT-CEM-50KG",
    name: "UltraTech Cement OPC 53 Grade 50kg",
    slug: "ultratech-cement-opc-53-grade-50kg",
    description: "High-strength cement suitable for RCC structural work and general construction.",
    specifications: { Grade: "OPC 53", "Pack Size": "50 kg" },
    images: ["/storefront_hero.jpg"],
    price: "410.00",
    mrp: "440.00",
    unit: "bag",
    categoryName: "Construction Materials",
    categorySlug: "construction-materials",
    brandName: "UltraTech Cement",
    stockQty: 120,
    rating: "4.9",
    ratingCount: 60,
    isFeatured: true,
    isBestSeller: true,
    categoryId: "cat-5",
    brandId: "b-8",
    lowStockAt: 20,
  },
  {
    id: "prod-10",
    sku: "GEN-LOCK-BRASS",
    name: "Heavy Duty Brass Door Lock Set",
    slug: "heavy-duty-brass-door-lock-set",
    description: "Solid brass mortise lock set with 3 keys, suitable for main doors.",
    specifications: { Material: "Brass", "Keys Included": "3" },
    images: ["/storefront_hero.jpg"],
    price: "890.00",
    mrp: "1050.00",
    unit: "set",
    categoryName: "Hardware & Tools",
    categorySlug: "hardware-tools",
    brandName: null,
    stockQty: 15,
    rating: "4.6",
    ratingCount: 8,
    isFeatured: false,
    isBestSeller: false,
    categoryId: "cat-4",
    brandId: null,
    lowStockAt: 3,
  },
  {
    id: "prod-11",
    sku: "GEN-TAP-CP",
    name: "Chrome Plated Bib Tap",
    slug: "chrome-plated-bib-tap",
    description: "Corrosion-resistant chrome plated brass bib tap for bathrooms and kitchens.",
    specifications: { Material: "Brass, Chrome Plated", Thread: "1/2 inch" },
    images: ["/plumbing_supplies.jpg"],
    price: "260.00",
    mrp: "320.00",
    unit: "pc",
    categoryName: "Plumbing",
    categorySlug: "plumbing",
    brandName: null,
    stockQty: 0,
    rating: "4.5",
    ratingCount: 6,
    isFeatured: false,
    isBestSeller: false,
    categoryId: "cat-2",
    brandId: null,
    lowStockAt: 5,
  },
  {
    id: "prod-12",
    sku: "BP-PRIMER-1L",
    name: "Berger Wall Primer 1L",
    slug: "berger-wall-primer-1l",
    description: "Water-based wall primer that seals the surface for a uniform top-coat finish.",
    specifications: { Coverage: "110-120 sq.ft/litre", "Pack Size": "1 Litre" },
    images: ["/paint_buckets.jpg"],
    price: "210.00",
    mrp: "245.00",
    unit: "can",
    categoryName: "Paints & Painting Supplies",
    categorySlug: "paints-painting-supplies",
    brandName: "Berger Paints",
    stockQty: 18,
    rating: "4.7",
    ratingCount: 14,
    isFeatured: false,
    isBestSeller: false,
    categoryId: "cat-1",
    brandId: "b-2",
    lowStockAt: 5,
  },
];

export async function listProducts(filters: ProductFilters = {}): Promise<ProductListItem[]> {
  try {
    const conditions = [eq(products.isActive, true)];
    if (filters.q) conditions.push(ilike(products.name, `%${filters.q}%`));
    if (filters.category) conditions.push(eq(categories.slug, filters.category));
    if (filters.brand) conditions.push(eq(brands.slug, filters.brand));
    if (filters.minPrice !== undefined) conditions.push(gte(products.price, filters.minPrice.toString()));
    if (filters.maxPrice !== undefined) conditions.push(lte(products.price, filters.maxPrice.toString()));
    if (filters.featuredOnly) conditions.push(eq(products.isFeatured, true));
    if (filters.bestSellerOnly) conditions.push(eq(products.isBestSeller, true));

    let orderBy = desc(products.isFeatured);
    if (filters.sort === "price_asc") orderBy = asc(products.price);
    else if (filters.sort === "price_desc") orderBy = desc(products.price);
    else if (filters.sort === "newest") orderBy = desc(products.createdAt);
    else if (filters.sort === "rating") orderBy = desc(products.rating);

    const rows = await db
      .select(productListSelect)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(filters.limit ?? 100);

    if (rows && rows.length > 0) {
      return rows as unknown as ProductListItem[];
    }
  } catch (err) {
    console.warn("Database query failed in listProducts, returning fallback catalog:", err);
  }

  // Fallback filtering over static list
  let res = [...FALLBACK_PRODUCTS];
  if (filters.q) {
    const qLower = filters.q.toLowerCase();
    res = res.filter((p) => p.name.toLowerCase().includes(qLower));
  }
  if (filters.category) {
    res = res.filter((p) => p.categorySlug === filters.category);
  }
  if (filters.brand) {
    const bLower = filters.brand.toLowerCase();
    res = res.filter((p) => p.brandName?.toLowerCase().replace(/\s+/g, "-") === bLower);
  }
  if (filters.minPrice !== undefined) {
    res = res.filter((p) => parseFloat(p.price) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    res = res.filter((p) => parseFloat(p.price) <= filters.maxPrice!);
  }
  if (filters.featuredOnly) {
    res = res.filter((p) => p.isFeatured);
  }
  if (filters.bestSellerOnly) {
    res = res.filter((p) => p.isBestSeller);
  }
  if (filters.limit) {
    res = res.slice(0, filters.limit);
  }
  return res as unknown as ProductListItem[];
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const rows = await db
      .select({
        ...productListSelect,
        description: products.description,
        specifications: products.specifications,
        categoryId: products.categoryId,
        brandId: products.brandId,
        lowStockAt: products.lowStockAt,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);

    if (rows[0]) return rows[0] as unknown as ProductDetail;
  } catch (err) {
    console.warn("Database query failed in getProductBySlug, checking fallback list:", err);
  }

  const match = FALLBACK_PRODUCTS.find((p) => p.slug === slug);
  return match || null;
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  const list = await listProducts({ category: categorySlug, limit: limit + 1 });
  return list.filter((p) => p.id !== excludeId).slice(0, limit);
}

export async function listCategories(): Promise<CategorySummary[]> {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        icon: categories.icon,
        productCount: sql<number>`count(${products.id})::int`,
      })
      .from(categories)
      .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.isActive, true)))
      .groupBy(categories.id)
      .orderBy(asc(categories.sortOrder));

    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("Database query failed in listCategories, returning fallback list:", err);
  }

  return FALLBACK_CATEGORIES;
}

export async function listBrands(): Promise<BrandSummary[]> {
  try {
    const rows = await db
      .select({
        id: brands.id,
        name: brands.name,
        slug: brands.slug,
        logoUrl: brands.logoUrl,
        productCount: sql<number>`count(${products.id})::int`,
      })
      .from(brands)
      .leftJoin(products, and(eq(products.brandId, brands.id), eq(products.isActive, true)))
      .groupBy(brands.id)
      .orderBy(asc(brands.name));

    if (rows && rows.length > 0) return rows;
  } catch (err) {
    console.warn("Database query failed in listBrands, returning fallback list:", err);
  }

  return FALLBACK_BRANDS;
}

export async function getProductReviews(productId: string) {
  try {
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  } catch {
    return [];
  }
}

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

export async function listProducts(filters: ProductFilters = {}): Promise<ProductListItem[]> {
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

  return rows as unknown as ProductListItem[];
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
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

  if (!rows[0]) return null;
  return rows[0] as unknown as ProductDetail;
}

export async function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  return listProducts({ category: categorySlug, limit: limit + 1 }).then((list) =>
    list.filter((p) => p.id !== excludeId).slice(0, limit)
  );
}

export async function listCategories(): Promise<CategorySummary[]> {
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

  return rows;
}

export async function listBrands(): Promise<BrandSummary[]> {
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

  return rows;
}

export async function getProductReviews(productId: string) {
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
}

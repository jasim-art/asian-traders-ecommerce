import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, categories, brands, inventory } from "@/db/schema";
import { desc, eq, ilike } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/format";

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string()).default([]),
  price: z.number().positive(),
  mrp: z.number().positive(),
  unit: z.string().default("pc"),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  stockQty: z.number().int().min(0).default(0),
  lowStockAt: z.number().int().min(0).default(5),
});

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q");
  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      slug: products.slug,
      price: products.price,
      mrp: products.mrp,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      categoryName: categories.name,
      brandName: brands.name,
      stockQty: inventory.quantity,
      lowStockAt: products.lowStockAt,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(q ? ilike(products.name, `%${q}%`) : undefined)
    .orderBy(desc(products.createdAt));

  return NextResponse.json({ products: rows });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const data = parsed.data;

  const [product] = await db
    .insert(products)
    .values({
      sku: data.sku,
      name: data.name,
      slug: `${slugify(data.name)}-${data.sku.toLowerCase()}`,
      description: data.description || null,
      specifications: data.specifications || null,
      images: data.images,
      price: data.price.toFixed(2),
      mrp: data.mrp.toFixed(2),
      unit: data.unit,
      categoryId: data.categoryId,
      brandId: data.brandId || null,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      isBestSeller: data.isBestSeller,
      lowStockAt: data.lowStockAt,
    })
    .returning();

  await db.insert(inventory).values({ productId: product.id, quantity: data.stockQty });

  return NextResponse.json({ product });
}

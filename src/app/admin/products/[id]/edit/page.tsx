import { notFound } from "next/navigation";
import { db } from "@/db";
import { products, inventory } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product] = await db.select().from(products).where(eq(products.id, params.id)).limit(1);
  if (!product) notFound();
  const [inv] = await db.select().from(inventory).where(eq(inventory.productId, params.id)).limit(1);

  return (
    <div>
      <h1 className="text-[28px] mb-8">Edit Product</h1>
      <ProductForm
        productId={product.id}
        initial={{
          sku: product.sku,
          name: product.name,
          description: product.description || "",
          images: (product.images || []).join(", "),
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
          categoryId: product.categoryId,
          brandId: product.brandId || "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isBestSeller: product.isBestSeller,
          stockQty: String(inv?.quantity ?? 0),
          lowStockAt: String(product.lowStockAt),
        }}
      />
    </div>
  );
}

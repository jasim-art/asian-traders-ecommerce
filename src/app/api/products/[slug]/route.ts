import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug, getRelatedProducts, getProductReviews } from "@/lib/queries";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [related, productReviews] = await Promise.all([
    getRelatedProducts(product.categorySlug, product.id),
    getProductReviews(product.id),
  ]);

  return NextResponse.json({ product, related, reviews: productReviews });
}

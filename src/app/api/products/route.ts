import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  try {
    const products = await listProducts({
      q: sp.get("q") || undefined,
      category: sp.get("category") || undefined,
      brand: sp.get("brand") || undefined,
      minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
      maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
      sort: (sp.get("sort") as any) || undefined,
      featuredOnly: sp.get("featured") === "1",
      bestSellerOnly: sp.get("bestseller") === "1",
      limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    });
    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

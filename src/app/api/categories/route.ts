export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { listCategories } from "@/lib/queries";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ categories });
}

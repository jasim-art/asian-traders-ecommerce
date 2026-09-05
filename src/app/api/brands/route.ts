export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { listBrands } from "@/lib/queries";

export async function GET() {
  const brands = await listBrands();
  return NextResponse.json({ brands });
}

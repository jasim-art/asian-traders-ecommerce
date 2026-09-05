import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  const res = NextResponse.json({ customer: session || null });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

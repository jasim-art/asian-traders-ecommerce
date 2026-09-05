import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { session: null, error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }
  return { session, error: null };
}

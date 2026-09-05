import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/format";

const schema = z.object({
  name: z.string().min(2),
  logoUrl: z.string().optional().or(z.literal("")),
});

export async function GET() {
  const rows = await db.select().from(brands).orderBy(asc(brands.name));
  return NextResponse.json({ brands: rows });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const [brand] = await db
    .insert(brands)
    .values({ ...parsed.data, slug: slugify(parsed.data.name) })
    .returning();
  return NextResponse.json({ brand });
}

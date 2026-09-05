import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/format";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().optional().or(z.literal("")),
  icon: z.string().optional().or(z.literal("")),
});

export async function GET() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return NextResponse.json({ categories: rows });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const [category] = await db
    .insert(categories)
    .values({ ...parsed.data, slug: slugify(parsed.data.name) })
    .returning();
  return NextResponse.json({ category });
}

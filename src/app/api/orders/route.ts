import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders, orderItems, inventory, products, addresses, coupons } from "@/db/schema";
import { and, eq, sql, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/format";

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(3),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
});

const checkoutSchema = z.object({
  items: z.array(itemSchema).min(1, "Your cart is empty"),
  deliveryMethod: z.enum(["DELIVERY", "PICKUP"]),
  paymentMethod: z.enum(["COD", "UPI", "RAZORPAY"]),
  guestName: z.string().min(2).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().min(10).optional(),
  address: addressSchema.optional(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_CHARGE = 49;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;
  const session = await getSession();

  if (data.deliveryMethod === "DELIVERY" && !data.address) {
    return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
  }
  if (!session && (!data.guestName || !data.guestEmail || !data.guestPhone)) {
    return NextResponse.json({ error: "Contact details are required" }, { status: 400 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Lock and validate stock for every line item first.
      const lineItems: { productId: string; name: string; quantity: number; unitPrice: number }[] = [];

      for (const item of data.items) {
        const [row] = await tx
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            isActive: products.isActive,
            qty: inventory.quantity,
            reserved: inventory.reservedQty,
          })
          .from(products)
          .leftJoin(inventory, eq(inventory.productId, products.id))
          .where(eq(products.id, item.productId))
          .for("update", { of: products });

        if (!row || !row.isActive) {
          throw new Error(`One of the items in your cart is no longer available`);
        }
        const available = (row.qty ?? 0) - (row.reserved ?? 0);
        if (available < item.quantity) {
          throw new Error(`Only ${Math.max(available, 0)} unit(s) of "${row.name}" left in stock`);
        }
        lineItems.push({
          productId: row.id,
          name: row.name,
          quantity: item.quantity,
          unitPrice: parseFloat(row.price),
        });
      }

      const subtotal = lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      const deliveryCharge =
        data.deliveryMethod === "PICKUP" || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

      let discount = 0;
      let couponCode: string | null = null;
      if (data.couponCode) {
        const [coupon] = await tx
          .select()
          .from(coupons)
          .where(and(eq(coupons.code, data.couponCode.toUpperCase().trim()), eq(coupons.isActive, true)));
        if (coupon && subtotal >= parseFloat(coupon.minOrderValue)) {
          if (coupon.percentOff) discount = (subtotal * coupon.percentOff) / 100;
          else if (coupon.flatOff) discount = parseFloat(coupon.flatOff);
          couponCode = coupon.code;
        }
      }

      const total = Math.max(subtotal + deliveryCharge - discount, 0);

      let addressId: string | null = null;
      if (data.deliveryMethod === "DELIVERY" && data.address) {
        const [addr] = await tx
          .insert(addresses)
          .values({
            customerId: session?.customerId,
            label: "Order Address",
            fullName: data.address.fullName,
            phone: data.address.phone,
            line1: data.address.line1,
            line2: data.address.line2 || null,
            city: data.address.city,
            state: data.address.state,
            pincode: data.address.pincode,
          })
          .returning();
        addressId = addr.id;
      }

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          customerId: session?.customerId,
          guestName: session ? null : data.guestName,
          guestEmail: session ? null : data.guestEmail,
          guestPhone: session ? null : data.guestPhone,
          addressId,
          deliveryMethod: data.deliveryMethod,
          paymentMethod: data.paymentMethod,
          status: "PENDING",
          subtotal: subtotal.toFixed(2),
          deliveryCharge: deliveryCharge.toFixed(2),
          discount: discount.toFixed(2),
          total: total.toFixed(2),
          couponCode,
          notes: data.notes || null,
        })
        .returning();

      for (const item of lineItems) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          lineTotal: (item.unitPrice * item.quantity).toFixed(2),
        });

        // Decrement stock; never allow it to go negative.
        await tx
          .update(inventory)
          .set({ quantity: sql`${inventory.quantity} - ${item.quantity}`, updatedAt: new Date() })
          .where(eq(inventory.productId, item.productId));
      }

      return order;
    });

    return NextResponse.json({ ok: true, order: { id: result.id, orderNumber: result.orderNumber } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Could not place order" }, { status: 400 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, session.customerId))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: rows });
}

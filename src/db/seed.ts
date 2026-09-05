import "dotenv/config";
import { db } from "./index";
import { categories, brands, products, inventory, customers, coupons } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding Asian Traders database...");

  const categoryData = [
    {
      name: "Paints & Painting Supplies",
      slug: "paints-painting-supplies",
      description: "Interior & exterior emulsions, primers, wall putty, brushes and rollers.",
      imageUrl: "/paint_buckets.jpg",
      icon: "paint",
      sortOrder: 1,
    },
    {
      name: "Plumbing",
      slug: "plumbing",
      description: "PVC & CPVC pipes, fittings, taps, valves and bathroom fixtures.",
      imageUrl: "/plumbing_supplies.jpg",
      icon: "pipe",
      sortOrder: 2,
    },
    {
      name: "Electrical",
      slug: "electrical",
      description: "Wires, cables, switches, MCBs, and lighting.",
      imageUrl: "/electrical_hardware.jpg",
      icon: "bolt",
      sortOrder: 3,
    },
    {
      name: "Hardware & Tools",
      slug: "hardware-tools",
      description: "Hand tools, power tools, fasteners and locks.",
      imageUrl: "/storefront_hero.jpg",
      icon: "wrench",
      sortOrder: 4,
    },
    {
      name: "Construction Materials",
      slug: "construction-materials",
      description: "Cement, wall putty, waterproofing and masonry supplies.",
      imageUrl: "/storefront_hero.jpg",
      icon: "brick",
      sortOrder: 5,
    },
  ];
  const insertedCategories = await db.insert(categories).values(categoryData).returning();
  const catBySlug = Object.fromEntries(insertedCategories.map((c) => [c.slug, c]));

  const brandData = [
    { name: "Asian Paints", slug: "asian-paints" },
    { name: "Berger Paints", slug: "berger-paints" },
    { name: "Finolex", slug: "finolex" },
    { name: "Astral Pipes", slug: "astral-pipes" },
    { name: "Havells", slug: "havells" },
    { name: "Anchor", slug: "anchor" },
    { name: "Stanley", slug: "stanley" },
    { name: "UltraTech Cement", slug: "ultratech-cement" },
  ];
  const insertedBrands = await db.insert(brands).values(brandData).returning();
  const brandBySlug = Object.fromEntries(insertedBrands.map((b) => [b.slug, b]));

  type SeedProduct = {
    sku: string;
    name: string;
    slug: string;
    description: string;
    specifications: Record<string, string>;
    images: string[];
    price: string;
    mrp: string;
    unit: string;
    categorySlug: string;
    brandSlug: string | null;
    isFeatured: boolean;
    isBestSeller: boolean;
    stock: number;
  };

  const productData: SeedProduct[] = [
    {
      sku: "AP-EMU-4L",
      name: "Asian Paints Tractor Emulsion 4L",
      slug: "asian-paints-tractor-emulsion-4l",
      description:
        "Smooth-finish interior emulsion paint offering excellent coverage and washability. Ideal for bedrooms, living rooms and offices.",
      specifications: { Coverage: "140-160 sq.ft/litre", Finish: "Matt", Base: "Water", "Pack Size": "4 Litre" },
      images: ["https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80"],
      price: "780.00",
      mrp: "899.00",
      unit: "can",
      categorySlug: "paints-painting-supplies",
      brandSlug: "asian-paints",
      isFeatured: true,
      isBestSeller: true,
      stock: 42,
    },
    {
      sku: "BP-WP-20KG",
      name: "Berger WeatherCoat Wall Putty 20kg",
      slug: "berger-weathercoat-wall-putty-20kg",
      description: "White cement-based wall putty for a smooth, durable base before painting.",
      specifications: { Coverage: "18-20 sq.ft/kg", Type: "White Cement Putty", "Pack Size": "20 kg" },
      images: ["https://images.unsplash.com/photo-1620641622502-19c4a51944e0?w=600&q=80"],
      price: "620.00",
      mrp: "699.00",
      unit: "bag",
      categorySlug: "paints-painting-supplies",
      brandSlug: "berger-paints",
      isFeatured: false,
      isBestSeller: true,
      stock: 30,
    },
    {
      sku: "FIN-PVC-4IN",
      name: "Finolex PVC Pipe 4 inch (3m length)",
      slug: "finolex-pvc-pipe-4-inch-3m",
      description: "ISI-marked rigid PVC pipe for drainage and plumbing lines. Corrosion resistant and long-lasting.",
      specifications: { Diameter: "4 inch", Length: "3 metre", Pressure: "6 kgf/cm²" },
      images: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80"],
      price: "540.00",
      mrp: "600.00",
      unit: "pc",
      categorySlug: "plumbing",
      brandSlug: "finolex",
      isFeatured: true,
      isBestSeller: false,
      stock: 60,
    },
    {
      sku: "AST-CPVC-1IN",
      name: "Astral CPVC Pipe 1 inch (3m length)",
      slug: "astral-cpvc-pipe-1-inch-3m",
      description: "Hot & cold water CPVC pipe, rated for pressure plumbing applications.",
      specifications: { Diameter: "1 inch", Length: "3 metre", "Max Temp": "93°C" },
      images: ["https://images.unsplash.com/photo-1621905252472-e8de6d3a3e1f?w=600&q=80"],
      price: "310.00",
      mrp: "350.00",
      unit: "pc",
      categorySlug: "plumbing",
      brandSlug: "astral-pipes",
      isFeatured: false,
      isBestSeller: false,
      stock: 4,
    },
    {
      sku: "HAV-WIRE-1.5",
      name: "Havells 1.5 sq.mm FR PVC Wire (90m coil)",
      slug: "havells-1-5-sqmm-fr-wire-90m",
      description: "Flame-retardant copper wiring for domestic and light commercial electrical circuits.",
      specifications: { "Cross Section": "1.5 sq.mm", Length: "90 metre", Type: "FR PVC Insulated" },
      images: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80"],
      price: "1450.00",
      mrp: "1650.00",
      unit: "coil",
      categorySlug: "electrical",
      brandSlug: "havells",
      isFeatured: true,
      isBestSeller: true,
      stock: 25,
    },
    {
      sku: "ANC-SWITCH-6A",
      name: "Anchor Roma 6A Modular Switch",
      slug: "anchor-roma-6a-modular-switch",
      description: "Elegant white modular switch with silver-alloy contacts for long life.",
      specifications: { Rating: "6A, 240V", Series: "Roma", Color: "White" },
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"],
      price: "45.00",
      mrp: "60.00",
      unit: "pc",
      categorySlug: "electrical",
      brandSlug: "anchor",
      isFeatured: false,
      isBestSeller: true,
      stock: 200,
    },
    {
      sku: "STN-HAMMER-500",
      name: "Stanley Claw Hammer 500g",
      slug: "stanley-claw-hammer-500g",
      description: "Drop-forged steel hammer with a fibreglass shock-absorbing handle.",
      specifications: { Weight: "500g", "Handle Material": "Fibreglass" },
      images: ["https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=600&q=80"],
      price: "420.00",
      mrp: "480.00",
      unit: "pc",
      categorySlug: "hardware-tools",
      brandSlug: "stanley",
      isFeatured: true,
      isBestSeller: false,
      stock: 18,
    },
    {
      sku: "STN-TAPE-5M",
      name: "Stanley Measuring Tape 5m",
      slug: "stanley-measuring-tape-5m",
      description: "Durable steel measuring tape with a sturdy locking mechanism.",
      specifications: { Length: "5 metre", Blade: "Steel" },
      images: ["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80"],
      price: "180.00",
      mrp: "220.00",
      unit: "pc",
      categorySlug: "hardware-tools",
      brandSlug: "stanley",
      isFeatured: false,
      isBestSeller: true,
      stock: 55,
    },
    {
      sku: "UT-CEM-50KG",
      name: "UltraTech Cement OPC 53 Grade 50kg",
      slug: "ultratech-cement-opc-53-grade-50kg",
      description: "High-strength cement suitable for RCC structural work and general construction.",
      specifications: { Grade: "OPC 53", "Pack Size": "50 kg" },
      images: ["https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=600&q=80"],
      price: "410.00",
      mrp: "440.00",
      unit: "bag",
      categorySlug: "construction-materials",
      brandSlug: "ultratech-cement",
      isFeatured: true,
      isBestSeller: true,
      stock: 120,
    },
    {
      sku: "GEN-LOCK-BRASS",
      name: "Heavy Duty Brass Door Lock Set",
      slug: "heavy-duty-brass-door-lock-set",
      description: "Solid brass mortise lock set with 3 keys, suitable for main doors.",
      specifications: { Material: "Brass", "Keys Included": "3" },
      images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80"],
      price: "890.00",
      mrp: "1050.00",
      unit: "set",
      categorySlug: "hardware-tools",
      brandSlug: null,
      isFeatured: false,
      isBestSeller: false,
      stock: 15,
    },
    {
      sku: "GEN-TAP-CP",
      name: "Chrome Plated Bib Tap",
      slug: "chrome-plated-bib-tap",
      description: "Corrosion-resistant chrome plated brass bib tap for bathrooms and kitchens.",
      specifications: { Material: "Brass, Chrome Plated", Thread: "1/2 inch" },
      images: ["https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=600&q=80"],
      price: "260.00",
      mrp: "320.00",
      unit: "pc",
      categorySlug: "plumbing",
      brandSlug: null,
      isFeatured: false,
      isBestSeller: false,
      stock: 0,
    },
    {
      sku: "BP-PRIMER-1L",
      name: "Berger Wall Primer 1L",
      slug: "berger-wall-primer-1l",
      description: "Water-based wall primer that seals the surface for a uniform top-coat finish.",
      specifications: { Coverage: "110-120 sq.ft/litre", "Pack Size": "1 Litre" },
      images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80"],
      price: "210.00",
      mrp: "245.00",
      unit: "can",
      categorySlug: "paints-painting-supplies",
      brandSlug: "berger-paints",
      isFeatured: false,
      isBestSeller: false,
      stock: 33,
    },
  ];

  for (const p of productData) {
    const { categorySlug, brandSlug, stock, ...rest } = p;
    const [product] = await db
      .insert(products)
      .values({
        ...rest,
        categoryId: catBySlug[categorySlug].id,
        brandId: brandSlug ? brandBySlug[brandSlug].id : null,
      })
      .returning();
    await db.insert(inventory).values({ productId: product.id, quantity: stock });
  }

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  await db.insert(customers).values({
    name: "Store Admin",
    email: "admin@asiantraders.test",
    phone: "9442425301",
    passwordHash: adminPasswordHash,
    role: "admin",
  });

  const demoPasswordHash = await bcrypt.hash("Demo@1234", 10);
  await db.insert(customers).values({
    name: "Demo Customer",
    email: "demo@asiantraders.test",
    phone: "9876543210",
    passwordHash: demoPasswordHash,
    role: "customer",
  });

  await db.insert(coupons).values([
    {
      code: "WELCOME50",
      description: "Flat ₹50 off on your first order",
      flatOff: "50.00",
      minOrderValue: "500.00",
    },
    {
      code: "SAVE10",
      description: "10% off on orders above ₹2000",
      percentOff: 10,
      minOrderValue: "2000.00",
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin login: admin@asiantraders.test / Admin@123");
  console.log("Demo login: demo@asiantraders.test / Demo@1234");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

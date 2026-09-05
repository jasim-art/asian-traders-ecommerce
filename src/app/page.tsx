import Link from "next/link";
import { listCategories, listBrands, listProducts } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const WHY_CHOOSE = [
  { num: "01", title: "Trusted Local Business", body: "Serving Manalmedu with genuine products and honest pricing for years." },
  { num: "02", title: "Everything Under One Roof", body: "Paints, plumbing, electrical, tools and construction supplies — no need to visit multiple shops." },
  { num: "03", title: "Fast Local Delivery", body: "Quick delivery across Manalmedu, or pick up your order in-store the same day." },
  { num: "04", title: "Genuine Brands Only", body: "We stock only authentic products from Asian Paints, Berger, Finolex, Havells and more." },
  { num: "05", title: "Expert Advice", body: "Not sure what you need? Our team helps you pick the right product for your project." },
  { num: "06", title: "WhatsApp Ordering", body: "Enquire or order directly on WhatsApp — no app download required." },
];

export default async function HomePage() {
  const [categories, brands, featured, bestSellers] = await Promise.all([
    listCategories(),
    listBrands(),
    listProducts({ featuredOnly: true, limit: 8 }),
    listProducts({ bestSellerOnly: true, limit: 4 }),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="pt-16 pb-16 bg-bg relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6 grid md:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white border border-line px-3.5 py-2 rounded-full shadow-card font-mono text-[12px] font-semibold text-brown mb-5">
              <span className="w-[7px] h-[7px] rounded-full bg-orange" /> Manalmedu&apos;s Hardware Store
            </span>
            <h1 className="text-[38px] sm:text-[52px] md:text-[64px] leading-[1.03] text-brown-deep">
              Everything You Need To Build. <em className="text-orange not-italic">Under One Roof.</em>
            </h1>
            <p className="mt-6 text-[18px] text-ink-soft max-w-[520px] normal-case">
              From paints and pipes to electrical and tools — Asian Traders stocks trusted brands for every stage of your project, with local delivery across Manalmedu.
            </p>
            <div className="flex gap-4 mt-8 flex-wrap">
              <Link href="/shop" className="btn btn-primary">Shop Now</Link>
              <Link href="/shop#categories" className="btn btn-outline">Browse Categories</Link>
            </div>
            <div className="flex gap-9 mt-11 flex-wrap">
              <div>
                <strong className="block font-display text-[30px] text-brown-deep font-extrabold">500+</strong>
                <span className="text-[12.5px] text-ink-soft font-semibold uppercase tracking-wide">Products in Stock</span>
              </div>
              <div>
                <strong className="block font-display text-[30px] text-brown-deep font-extrabold">8+</strong>
                <span className="text-[12.5px] text-ink-soft font-semibold uppercase tracking-wide">Trusted Brands</span>
              </div>
              <div>
                <strong className="block font-display text-[30px] text-brown-deep font-extrabold">Same-Day</strong>
                <span className="text-[12.5px] text-ink-soft font-semibold uppercase tracking-wide">Local Delivery</span>
              </div>
            </div>
          </div>
          <div className="relative h-[340px] md:h-[460px] hidden sm:block">
            <div className="absolute top-0 left-5 w-[190px] card p-5 rotate-[-4deg] shadow-card-lg">
              <div className="w-[46px] h-[46px] rounded-[10px] bg-orange-tint flex items-center justify-center mb-3.5 text-xl">🎨</div>
              <h4 className="text-[14.5px] normal-case font-bold text-brown-deep">Paints</h4>
              <p className="text-[12px] text-ink-soft mt-1">Asian Paints, Berger</p>
            </div>
            <div className="absolute top-[70px] right-0 w-[190px] card p-5 rotate-[3deg] shadow-card-lg">
              <div className="w-[46px] h-[46px] rounded-[10px] bg-orange-tint flex items-center justify-center mb-3.5 text-xl">🔧</div>
              <h4 className="text-[14.5px] normal-case font-bold text-brown-deep">Tools</h4>
              <p className="text-[12px] text-ink-soft mt-1">Stanley &amp; more</p>
            </div>
            <div className="absolute bottom-10 left-[60px] w-[190px] card p-5 rotate-[2deg] shadow-card-lg">
              <div className="w-[46px] h-[46px] rounded-[10px] bg-orange-tint flex items-center justify-center mb-3.5 text-xl">🚿</div>
              <h4 className="text-[14.5px] normal-case font-bold text-brown-deep">Plumbing</h4>
              <p className="text-[12px] text-ink-soft mt-1">Finolex, Astral</p>
            </div>
            <div className="absolute bottom-0 right-[30px] w-[190px] card p-5 rotate-[-3deg] shadow-card-lg">
              <div className="w-[46px] h-[46px] rounded-[10px] bg-orange-tint flex items-center justify-center mb-3.5 text-xl">⚡</div>
              <h4 className="text-[14.5px] normal-case font-bold text-brown-deep">Electrical</h4>
              <p className="text-[12px] text-ink-soft mt-1">Havells, Anchor</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="py-20 bg-bg border-t border-line">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="max-w-[640px] mb-11">
            <span className="eyebrow">Shop by Category</span>
            <h2 className="mt-2.5">Popular Categories</h2>
            <p className="mt-3.5 text-ink-soft normal-case text-[16.5px]">
              Whatever stage your project is at, find exactly what you need.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="card p-6 flex flex-col gap-3.5 hover:-translate-y-1.5 hover:shadow-card-lg hover:border-orange transition-all"
              >
                <div className="w-[52px] h-[52px] rounded-xl bg-orange-tint flex items-center justify-center text-2xl">
                  🧱
                </div>
                <h3 className="text-[18px] normal-case">{cat.name}</h3>
                <p className="text-[13px] text-ink-soft normal-case line-clamp-2">{cat.description}</p>
                <span className="mt-auto pt-3 border-t border-dashed border-line font-mono text-[11.5px] text-orange-deep font-semibold uppercase tracking-wide">
                  {cat.productCount} products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 bg-white border-t border-b border-line">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="flex items-end justify-between mb-11 flex-wrap gap-4">
            <div>
              <span className="eyebrow">Handpicked For You</span>
              <h2 className="mt-2.5">Featured Products</h2>
            </div>
            <Link href="/shop" className="btn btn-outline btn-sm">View All Products</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="py-20 bg-bg">
          <div className="max-w-[1240px] mx-auto px-6">
            <div className="max-w-[640px] mb-11">
              <span className="eyebrow">Customer Favourites</span>
              <h2 className="mt-2.5">Best Sellers</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BRANDS */}
      <section id="brands" className="py-20 bg-brown-deep">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="max-w-[640px] mb-11">
            <span className="eyebrow [&::before]:bg-[#F0B98A] !text-[#F0B98A]">Genuine Products</span>
            <h2 className="mt-2.5 text-white">Trusted Brands</h2>
            <p className="mt-3.5 text-[#CBBBA9] normal-case text-[16.5px]">
              We stock authentic products from India&apos;s most trusted manufacturers.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brands.map((b) => (
              <div
                key={b.id}
                className="bg-white/[0.06] border border-white/[0.14] rounded-xl px-4 py-6 text-center flex flex-col items-center gap-3 hover:bg-white/[0.12] hover:-translate-y-1 transition-all"
              >
                <div className="h-[60px] flex items-center justify-center">
                  <span className="font-display font-extrabold text-lg text-white uppercase">{b.name}</span>
                </div>
                <span className="font-mono text-[10.5px] text-[#F0B98A] uppercase tracking-wide">
                  {b.productCount} products
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-20 bg-white border-t border-b border-line">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="max-w-[640px] mb-11">
            <span className="eyebrow">Why Asian Traders</span>
            <h2 className="mt-2.5">Why Choose Us</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {WHY_CHOOSE.map((w) => (
              <div key={w.num}>
                <div className="font-mono text-[13px] text-orange font-bold mb-2.5">{w.num}</div>
                <h3 className="text-[19px] normal-case mb-2">{w.title}</h3>
                <p className="text-ink-soft text-[14.5px] normal-case">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT / STORE INFO */}
      <section className="py-20 bg-bg-alt">
        <div className="max-w-[1240px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="eyebrow">Visit Us</span>
            <h2 className="mt-2.5">Get In Touch</h2>
            <p className="mt-3.5 text-ink-soft normal-case text-[16.5px] max-w-[440px]">
              Have a question about a product, or want to place a bulk order? Reach out — we&apos;re happy to help.
            </p>
            <div className="flex flex-col gap-4 mt-7">
              <div className="flex gap-3.5 items-start">
                <div className="w-[42px] h-[42px] rounded-[10px] bg-white border border-line flex items-center justify-center shrink-0">📍</div>
                <div>
                  <strong className="block text-sm text-brown-deep">Store Address</strong>
                  <span className="text-sm text-ink-soft normal-case">Asian Traders, Manalmedu, Tamil Nadu</span>
                </div>
              </div>
              <div className="flex gap-3.5 items-start">
                <div className="w-[42px] h-[42px] rounded-[10px] bg-white border border-line flex items-center justify-center shrink-0">📞</div>
                <div>
                  <strong className="block text-sm text-brown-deep">Phone / WhatsApp</strong>
                  <span className="text-sm text-ink-soft normal-case">+91 94424 25301</span>
                </div>
              </div>
              <div className="flex gap-3.5 items-start">
                <div className="w-[42px] h-[42px] rounded-[10px] bg-white border border-line flex items-center justify-center shrink-0">🕒</div>
                <div>
                  <strong className="block text-sm text-brown-deep">Opening Hours</strong>
                  <span className="text-sm text-ink-soft normal-case">Mon–Sat: 8:30 AM – 8:30 PM</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3.5 mt-8 flex-wrap">
              <a href="https://wa.me/919442425301" className="btn btn-primary">WhatsApp Us</a>
              <a href="https://maps.app.goo.gl/HZkvJY9nhtN2hSVS8" className="btn btn-outline">Get Directions</a>
            </div>
          </div>
          <div className="card overflow-hidden h-[340px] relative">
            <iframe
              title="Asian Traders location"
              className="w-full h-full border-0"
              loading="lazy"
              src="https://www.google.com/maps?q=Manalmedu&output=embed"
            />
          </div>
        </div>
      </section>
    </>
  );
}

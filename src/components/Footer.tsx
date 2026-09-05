import Link from "next/link";

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919442425301";

  return (
    <footer className="bg-brown-deep text-white pt-16 pb-6">
      <div className="max-w-[1240px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
        <div>
          <span className="font-display font-extrabold text-[22px] uppercase text-white">Asian Traders</span>
          <p className="text-[#CBBBA9] text-sm mt-3 leading-relaxed">
            Your one-stop destination for hardware &amp; building materials.
            <br />
            Proprietor: Mohamed Saleem.
            <br />
            GSTIN: 33EDPM6822G2ZN
          </p>
        </div>
        <div>
          <h4 className="text-white text-[15px] normal-case font-bold mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-2 text-[#CBBBA9] text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/shop#brands">Brands</Link></li>
            <li><Link href="/account">My Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-[15px] normal-case font-bold mb-4">Categories</h4>
          <ul className="flex flex-col gap-2 text-[#CBBBA9] text-sm">
            <li><Link href="/shop?category=hardware-tools">Hardware &amp; Tools</Link></li>
            <li><Link href="/shop?category=paints-painting-supplies">Paints &amp; Finishing</Link></li>
            <li><Link href="/shop?category=plumbing">Pipes &amp; Plumbing</Link></li>
            <li><Link href="/shop?category=electrical">Electrical Supplies</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white text-[15px] normal-case font-bold mb-4">Contact</h4>
          <ul className="flex flex-col gap-2 text-[#CBBBA9] text-sm">
            <li><a href="tel:+919442425301">+91 94424 25301</a></li>
            <li><a href={`https://wa.me/${whatsapp}`}>WhatsApp Us</a></li>
            <li><a href="https://maps.app.goo.gl/HZkvJY9nhtN2hSVS8">Get Directions</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1240px] mx-auto px-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#B4A392]">
        <span>© {new Date().getFullYear()} Asian Traders. All Rights Reserved.</span>
        <span>Designed to bring your project — from foundation to finishing — under one roof.</span>
      </div>
    </footer>
  );
}

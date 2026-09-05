export default function WhatsAppFloat() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919442425301";
  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-[150] w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-card-lg hover:scale-105 transition-transform"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M17.6 6.4A8 8 0 1 0 5 17l-1 4 4.1-1a8 8 0 0 0 9.5-13.6z" stroke="#fff" strokeWidth="1.7" />
      </svg>
    </a>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-[#AD4836] mb-4">404</h1>
        <p className="text-xl md:text-2xl text-[#3D3430] mb-8">
          Pagina nu a fost găsită
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#AD4836] text-white rounded-lg hover:bg-[#8a3a2b] transition-colors text-lg"
        >
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}

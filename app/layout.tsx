import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EPIAssist - Legislația medicală într-un singur loc',
  description: 'Acces instant la ordine și legi esențiale pentru practica medicală din România.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className="bg-bg-warm text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}

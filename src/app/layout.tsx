import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Kombucha Hub – Osobný Kombucha Asistent',
  description: 'Webový portál pre sledovanie kombucha fermentácie, recepty, kalkulačky a Raspberry Pi IoT monitorovanie.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk">
      <body className="min-h-screen flex flex-col bg-[#fbfbf8] text-[#1c2e24] antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-emerald-950 text-emerald-300 py-8 border-t border-emerald-900 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs space-y-2">
            <p className="font-medium text-emerald-200">🍃 Kombucha Hub – Osobný fermentačný sprievodca</p>
            <p className="text-emerald-400/80">Optimalizované pre domáce nádoby s objemom 3 – 4 litre</p>
            <p className="text-emerald-500 text-[11px] pt-2">© {new Date().getFullYear()} Kombucha Hub. Všetky práva vyhradené.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

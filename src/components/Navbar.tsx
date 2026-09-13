'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlaskConical, BookOpen, Cpu, ShieldCheck, User, Sparkles, Home } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);
  const [userName] = useState('Mária Fermenter');

  const navItems = [
    { href: '/', label: 'Prehľad', icon: Home },
    { href: '/batches', label: 'Várky', icon: FlaskConical },
    { href: '/recipes', label: 'Recepty & Kalkulačka', icon: BookOpen },
    { href: '/scoby', label: 'SCOBY Hotel', icon: ShieldCheck },
    { href: '/iot', label: 'Raspberry Pi IoT', icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-900 text-emerald-50 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-emerald-950 font-bold text-xl shadow-inner transform group-hover:scale-105 transition-transform">
              🍃
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Kombucha<span className="text-amber-400">Hub</span>
              </span>
              <span className="block text-[10px] text-emerald-300 tracking-wider font-medium uppercase -mt-1">
                Osobný Kombucha Asistent
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-amber-300 shadow-sm border border-emerald-700'
                      : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth & Notifications Area */}
          <div className="flex items-center gap-3">
            {isUserLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  title="Druhú fermentáciu pripraviť"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 font-semibold text-xs transition-all shadow-sm"
                  onClick={() => alert('Prihlasovanie cez Google OAuth je aktívne. Relácia používateľa bola automaticky obnovená.')}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Google Účet
                </button>
                <div className="flex items-center gap-2 bg-emerald-800/80 px-2.5 py-1.5 rounded-full border border-emerald-700">
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xs">
                    MF
                  </div>
                  <span className="text-xs font-medium text-emerald-100 hidden lg:inline">{userName}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsUserLoggedIn(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 text-emerald-950 text-xs font-bold hover:bg-amber-400 transition"
              >
                <User className="w-4 h-4" /> Prihlásiť cez Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-emerald-800 bg-emerald-950 px-2 py-1.5 flex justify-around overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-md text-[11px] font-medium transition ${
                isActive ? 'text-amber-400 bg-emerald-900' : 'text-emerald-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

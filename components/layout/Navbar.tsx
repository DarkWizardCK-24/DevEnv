'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { RiShieldKeyholeLine, RiMenu3Line, RiCloseLine, RiSafeLine, RiDownloadLine } from 'react-icons/ri';
import AuthButton from '@/components/auth/AuthButton';

const links = [
  { href: '/', label: '~/vault', icon: RiSafeLine },
  { href: '/import', label: '~/import', icon: RiDownloadLine },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-[var(--color-border)] bg-[rgba(5,7,15,0.85)]"
      style={{ boxShadow: '0 1px 0 rgba(28,33,56,0.5), 0 4px 24px rgba(0,0,0,0.4)' }}>
      <div className="container-app flex items-center justify-between h-14">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md flex items-center justify-center border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.05)] group-hover:border-[rgba(170,255,0,0.4)] group-hover:bg-[rgba(170,255,0,0.08)] transition-all">
            <RiShieldKeyholeLine size={14} style={{ color: 'var(--color-neon-lime)' }} />
          </div>
          <span className="font-bold text-sm tracking-tight">
            <span style={{ color: 'var(--color-neon-lime)' }} className="glow-lime">dev</span>
            <span style={{ color: 'var(--color-neon-cyan)' }}>env</span>
            <span style={{ color: 'var(--color-text-dim)' }}>.sh</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className="relative px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                style={{ color: active ? 'var(--color-neon-lime)' : 'var(--color-text-muted)' }}>
                <span className="relative z-10">{label}</span>
                {active && (
                  <span className="absolute inset-0 rounded-md bg-[rgba(170,255,0,0.06)] border border-[rgba(170,255,0,0.12)]" />
                )}
              </Link>
            );
          })}

          <div className="w-px h-4 bg-[var(--color-border)] mx-2" />

          <a href="http://localhost:3000"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[rgba(0,229,255,0.3)] hover:text-[var(--color-neon-cyan)] hover:bg-[rgba(0,229,255,0.04)] transition-all">
            ↗ DevFolio
          </a>
          <AuthButton />
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all"
          onClick={() => setOpen(v => !v)}>
          {open ? <RiCloseLine size={20} /> : <RiMenu3Line size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-4 py-3 space-y-1">
            {links.map(({ href, label }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-all"
                  style={{
                    color: active ? 'var(--color-neon-lime)' : 'var(--color-text-muted)',
                    background: active ? 'rgba(170,255,0,0.05)' : 'transparent',
                  }}>
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { ECOSYSTEM } from '@/lib/ecosystem';

export const metadata: Metadata = {
  title: 'DevEnv — Environment Vault',
  description: 'Securely manage your .env variables per project.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '56px', minHeight: '100vh' }}>{children}</main>
        <footer className="border-t border-[var(--color-border)] mt-20 py-10">
          <div className="container-app">
            <div className="flex items-center gap-2 mb-5">
              <span style={{ color: 'var(--color-neon-green)' }} className="text-xs">$</span>
              <span className="text-xs text-[var(--color-text-dim)]">devenv — part of the deveco ecosystem</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {ECOSYSTEM.map(app => (
                <a key={app.name} href={app.url} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-neon-cyan)] transition-colors">
                  {app.name}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

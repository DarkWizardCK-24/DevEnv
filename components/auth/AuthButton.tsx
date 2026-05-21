'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { RiGithubFill, RiLogoutBoxLine } from 'react-icons/ri';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const sb = createClient();

  useEffect(() => {
    sb.auth.getUser().then(({ data: { user } }) => { setUser(user); setLoading(false); });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  function signIn() {
    const callbackUrl = `${window.location.origin}/api/auth/callback`;
    void sb.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: callbackUrl } });
  }

  async function signOut() {
    await sb.auth.signOut();
    setUser(null);
  }

  if (loading) return (
    <div className="w-7 h-7 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] animate-pulse" />
  );

  if (!user) {
    return (
      <button onClick={signIn}
        className="btn btn-ghost flex items-center gap-1.5 ml-1">
        <RiGithubFill size={13} /> sign in
      </button>
    );
  }

  const avatar = user.user_metadata?.avatar_url;
  const username = user.user_metadata?.user_name ?? user.email;

  return (
    <div className="flex items-center gap-2 ml-1">
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]">
        {avatar ? (
          <img src={avatar} alt={username} className="w-5 h-5 rounded-full" />
        ) : (
          <div className="w-5 h-5 rounded-full border border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.08)] flex items-center justify-center text-[9px] font-bold"
            style={{ color: 'var(--color-neon-cyan)' }}>
            {username?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-[11px] text-[var(--color-text-muted)] max-w-[80px] truncate">{username}</span>
      </div>
      <button onClick={signOut} title="Sign out"
        className="p-1.5 rounded-md text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] hover:bg-[rgba(255,51,102,0.06)] transition-all">
        <RiLogoutBoxLine size={13} />
      </button>
    </div>
  );
}

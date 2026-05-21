'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProject, saveVars, exportDotEnv, type Project, type EnvVar } from '@/lib/db';
import {
  RiArrowLeftLine, RiAddLine, RiDeleteBinLine, RiEyeLine, RiEyeOffLine,
  RiFileCopyLine, RiDownloadLine, RiCheckLine, RiKeyLine, RiLockLine,
} from 'react-icons/ri';

export default function VaultProjectPage() {
  const { project: projectId } = useParams<{ project: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ key: '', value: '', note: '', masked: true });
  const [copied, setCopied] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const p = await getProject(projectId);
    setProject(p);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  function toggleValue(key: string) {
    setShowValues(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  async function handleAdd() {
    if (!project || !form.key.trim() || !form.value) return;
    const existing = project.vars.filter(v => v.key !== form.key.trim().toUpperCase());
    const newVar: EnvVar = {
      key: form.key.trim().toUpperCase(),
      value: form.value,
      masked: form.masked,
      note: form.note || undefined,
    };
    await saveVars(projectId, [...existing, newVar]);
    setForm({ key: '', value: '', note: '', masked: true });
    setShowForm(false);
    await refresh();
  }

  async function handleDelete(key: string) {
    if (!project || !confirm(`Delete ${key}?`)) return;
    await saveVars(projectId, project.vars.filter(v => v.key !== key));
    await refresh();
  }

  function copyAll() {
    if (!project) return;
    navigator.clipboard.writeText(exportDotEnv(project));
    setCopied('__all__');
    setTimeout(() => setCopied(null), 2000);
  }

  function copyValue(key: string, value: string) {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function download() {
    if (!project) return;
    const blob = new Blob([exportDotEnv(project)], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '.env';
    a.click();
  }

  function handleFormKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.metaKey) handleAdd();
    if (e.key === 'Escape') setShowForm(false);
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="container-app py-20">
      <div className="flex items-center gap-3 text-sm text-[var(--color-text-dim)]">
        <span className="inline-block w-4 h-4 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-neon-lime)] animate-spin" />
        loading vault...
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!project) return (
    <div className="container-app py-20 text-center space-y-4">
      <div className="text-sm font-semibold" style={{ color: 'var(--color-neon-red)' }}>Vault not found</div>
      <Link href="/" className="text-xs text-[var(--color-neon-cyan)] hover:underline">← back to vault</Link>
    </div>
  );

  return (
    <div className="container-app py-10 max-w-3xl">

      {/* Breadcrumb */}
      <Link href="/"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-neon-lime)] transition-colors mb-8 group">
        <RiArrowLeftLine size={12} className="group-hover:-translate-x-0.5 transition-transform" />
        ~/vault
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-dim)] mb-2">
            <span style={{ color: 'var(--color-neon-green)' }}>$</span>
            <span>cat ~/.env/vault/{project.name}/.env</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight glow-lime" style={{ color: 'var(--color-neon-lime)' }}>
            {project.name}
          </h1>
          {project.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap justify-end">
          <button onClick={copyAll} className="btn btn-ghost">
            {copied === '__all__'
              ? <><RiCheckLine size={12} style={{ color: 'var(--color-neon-green)' }} /> copied!</>
              : <><RiFileCopyLine size={12} /> copy .env</>}
          </button>
          <button onClick={download} className="btn btn-ghost">
            <RiDownloadLine size={12} /> download
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-lime">
            <RiAddLine size={12} /> add var
          </button>
        </div>
      </div>

      {/* Add var form */}
      {showForm && (
        <div className="term-card mb-6 fade-up" style={{ borderColor: 'rgba(170,255,0,0.25)' }}>
          <div className="term-card-header" style={{ color: 'var(--color-neon-lime)' }}>
            <span>$ export <span className="opacity-70">{form.key || 'NEW_VAR'}</span>=...</span>
            <button onClick={() => setShowForm(false)}
              className="w-5 h-5 flex items-center justify-center rounded text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] hover:bg-[rgba(255,51,102,0.08)] transition-all text-sm">
              ✕
            </button>
          </div>
          <div className="term-card-body space-y-3" onKeyDown={handleFormKey}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[var(--color-text-dim)] mb-1.5 uppercase tracking-widest">Key</label>
                <input
                  className="uppercase"
                  placeholder="VARIABLE_NAME"
                  value={form.key}
                  onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--color-text-dim)] mb-1.5 uppercase tracking-widest">Value</label>
                <input
                  type={form.masked ? 'password' : 'text'}
                  placeholder="sk-... / postgres://..."
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-[var(--color-text-dim)] mb-1.5 uppercase tracking-widest">Note <span className="normal-case text-[var(--color-text-dim)]">(optional)</span></label>
              <input
                placeholder="e.g. prod DB, expires 2025-01..."
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer select-none">
                <input type="checkbox" checked={form.masked}
                  onChange={e => setForm(f => ({ ...f, masked: e.target.checked }))} />
                <RiLockLine size={11} /> mask value
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost px-4">cancel</button>
                <button onClick={handleAdd} disabled={!form.key.trim() || !form.value}
                  className="btn btn-lime">
                  <RiAddLine size={12} /> add var
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variables card */}
      <div className="term-card overflow-hidden">
        <div className="term-card-header">
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--color-neon-lime)' }}>variables</span>
            <span className="badge badge-lime">{project.vars.length}</span>
          </div>
          {project.vars.length > 0 && (
            <span className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider">key / value / actions</span>
          )}
        </div>

        {project.vars.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-6 text-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-2)] mb-4">
              <RiKeyLine size={18} style={{ color: 'var(--color-text-dim)' }} />
            </div>
            <div className="text-sm text-[var(--color-text-muted)] mb-1">No variables yet</div>
            <div className="text-xs text-[var(--color-text-dim)] mb-5">Add your first env var to get started.</div>
            <button onClick={() => setShowForm(true)} className="btn btn-lime">
              <RiAddLine size={13} /> add first var
            </button>
          </div>
        ) : (
          <div className="divide-border">
            {project.vars.map(v => (
              <div key={v.key}
                className="flex items-center gap-3 px-4 py-3 group hover:bg-[var(--color-surface-2)] transition-colors">

                {/* Key */}
                <div className="w-[38%] min-w-0 shrink-0">
                  <div className="text-xs font-semibold font-mono truncate" style={{ color: 'var(--color-neon-lime)' }}>
                    {v.key}
                  </div>
                  {v.note && (
                    <div className="text-[10px] text-[var(--color-text-dim)] mt-0.5 truncate">{v.note}</div>
                  )}
                </div>

                {/* Value */}
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono text-[var(--color-text-muted)] truncate block">
                    {showValues.has(v.key)
                      ? v.value
                      : (v.masked ? '•'.repeat(Math.min(v.value.length, 16)) : v.value)}
                  </span>
                </div>

                {/* Masked badge */}
                {v.masked && !showValues.has(v.key) && (
                  <RiLockLine size={11} className="shrink-0 text-[var(--color-text-dim)]" />
                )}

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleValue(v.key)}
                    title={showValues.has(v.key) ? 'Hide value' : 'Show value'}
                    className="p-1.5 rounded text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-all">
                    {showValues.has(v.key) ? <RiEyeOffLine size={13} /> : <RiEyeLine size={13} />}
                  </button>
                  <button
                    onClick={() => copyValue(v.key, v.value)}
                    title="Copy value"
                    className="p-1.5 rounded text-[var(--color-text-dim)] hover:text-[var(--color-neon-cyan)] hover:bg-[rgba(0,229,255,0.06)] transition-all">
                    {copied === v.key
                      ? <RiCheckLine size={13} style={{ color: 'var(--color-neon-green)' }} />
                      : <RiFileCopyLine size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(v.key)}
                    title="Delete variable"
                    className="p-1.5 rounded text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] hover:bg-[rgba(255,51,102,0.06)] transition-all">
                    <RiDeleteBinLine size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {project.vars.length > 0 && (
        <p className="text-[10px] text-[var(--color-text-dim)] mt-4 text-right">
          Hover a row to copy or delete · ⌘↵ to save new var
        </p>
      )}
    </div>
  );
}

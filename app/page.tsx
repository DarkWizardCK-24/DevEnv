'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  getProjects, createProject, deleteProject,
  saveVars, parseEnvFile, type Project,
} from '@/lib/db';
import {
  RiAddLine, RiDeleteBinLine, RiFolderOpenLine, RiArrowRightLine,
  RiShieldKeyholeLine, RiTimeLine, RiCodeLine, RiUploadLine,
  RiCloseLine, RiCheckLine, RiFileLine, RiDragDropLine,
  RiLockPasswordLine, RiDatabase2Line,
} from 'react-icons/ri';

/* ─────────────────── Quick Import Modal ─────────────────── */

function QuickImportModal({
  project,
  onClose,
  onImported,
}: {
  project: Project;
  onClose: () => void;
  onImported: () => void;
}) {
  const [raw, setRaw] = useState('');
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const preview = raw.trim() ? parseEnvFile(raw) : [];

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave() { setDragging(false); }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setRaw(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setRaw(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }

  async function handleImport() {
    const vars = parseEnvFile(raw);
    if (!vars.length) return;
    setImporting(true);
    const merged = [
      ...project.vars.filter(v => !vars.find(nv => nv.key === v.key)),
      ...vars,
    ];
    await saveVars(project.id, merged);
    setImporting(false);
    setDone(true);
    setTimeout(() => { onImported(); onClose(); }, 1200);
  }

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,7,15,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="term-card w-full max-w-lg fade-up" style={{ borderColor: 'rgba(170,255,0,0.2)' }}>
        {/* Header */}
        <div className="term-card-header" style={{ color: 'var(--color-neon-lime)' }}>
          <div className="flex items-center gap-2">
            <RiUploadLine size={12} />
            <span>import into <strong>{project.name}</strong></span>
          </div>
          <button onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,51,102,0.1)] text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-all">
            <RiCloseLine size={14} />
          </button>
        </div>

        <div className="term-card-body space-y-4">
          {done ? (
            <div className="flex flex-col items-center py-8 text-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center border border-[rgba(0,255,136,0.25)] bg-[rgba(0,255,136,0.06)]">
                <RiCheckLine size={22} style={{ color: 'var(--color-neon-green)' }} />
              </div>
              <p className="text-sm font-semibold glow-green" style={{ color: 'var(--color-neon-green)' }}>
                {preview.length} variable{preview.length !== 1 ? 's' : ''} imported
              </p>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                ref={dropRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative rounded-lg border-2 border-dashed transition-all"
                style={{
                  borderColor: dragging ? 'var(--color-neon-lime)' : 'var(--color-border)',
                  background: dragging ? 'rgba(170,255,0,0.04)' : 'var(--color-surface-2)',
                }}>
                <textarea
                  className="w-full h-40 text-[11px] resize-none bg-transparent border-0 focus:ring-0"
                  style={{ boxShadow: 'none' }}
                  placeholder={'Paste .env content here...\n\nDATABASE_URL=postgres://...\nNEXT_PUBLIC_KEY=pk_...\n\n— or drag & drop a .env file —'}
                  value={raw}
                  onChange={e => setRaw(e.target.value)}
                />
                {!raw && (
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <RiDragDropLine size={18} style={{ color: 'var(--color-text-dim)' }} />
                  </div>
                )}
              </div>

              {/* File picker */}
              <label className="flex items-center gap-2 text-[11px] text-[var(--color-text-dim)] cursor-pointer hover:text-[var(--color-neon-cyan)] transition-colors w-fit">
                <RiFileLine size={12} />
                choose file
                <input type="file" accept=".env,text/plain" className="sr-only" onChange={handleFileInput} />
              </label>

              {/* Preview */}
              {preview.length > 0 && (
                <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
                  <div className="px-3 py-2 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider">preview</span>
                    <span className="badge badge-lime">{preview.length} vars</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto divide-border">
                    {preview.map(v => (
                      <div key={v.key} className="flex items-center gap-3 px-3 py-1.5">
                        <span className="text-[11px] font-mono font-semibold w-1/2 truncate" style={{ color: 'var(--color-neon-lime)' }}>{v.key}</span>
                        <span className="text-[10px] font-mono text-[var(--color-text-dim)]">{'•'.repeat(8)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-2">
                <button onClick={onClose} className="btn btn-ghost px-4">cancel</button>
                <button
                  onClick={handleImport}
                  disabled={preview.length === 0 || importing}
                  className="btn btn-lime flex-1 justify-center">
                  {importing
                    ? <><span className="w-3 h-3 rounded-full border border-t-[var(--color-neon-lime)] border-[rgba(170,255,0,0.2)] animate-spin inline-block" /> importing...</>
                    : <><RiUploadLine size={12} /> import {preview.length > 0 ? `${preview.length} var${preview.length !== 1 ? 's' : ''}` : '.env'}</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Create card ─────────────────── */

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!form.name.trim()) return;
    setLoading(true);
    await createProject(form.name.trim(), form.description.trim() || undefined);
    setForm({ name: '', description: '' });
    setLoading(false);
    onCreated();
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCreate();
  }

  return (
    <div className="space-y-3" onKeyDown={onKey}>
      <div>
        <label className="block text-[10px] text-[var(--color-text-dim)] mb-1.5 uppercase tracking-widest">Project Name</label>
        <input placeholder="my-saas, api-service..." value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
      </div>
      <div>
        <label className="block text-[10px] text-[var(--color-text-dim)] mb-1.5 uppercase tracking-widest">Description <span className="normal-case">(optional)</span></label>
        <input placeholder="What is this vault for?" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <button onClick={handleCreate} disabled={!form.name.trim() || loading}
        className="btn btn-lime w-full justify-center py-2.5">
        {loading
          ? <span className="w-3 h-3 rounded-full border border-t-[var(--color-neon-lime)] border-[rgba(170,255,0,0.2)] animate-spin inline-block" />
          : <><RiAddLine size={13} /> create vault</>}
      </button>
    </div>
  );
}

/* ─────────────────── Project Card ─────────────────── */

function ProjectCard({
  project,
  onDelete,
  onImport,
  idx,
}: {
  project: Project;
  onDelete: (id: string) => void;
  onImport: (p: Project) => void;
  idx: number;
}) {
  const age = Math.floor((Date.now() - new Date(project.created_at).getTime()) / 86400000);
  const ageLabel = age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age}d ago`;

  return (
    <div
      className="term-card group flex flex-col hover:border-[rgba(170,255,0,0.18)] transition-all fade-up"
      style={{ animationDelay: `${idx * 50}ms` }}>

      {/* Top accent line */}
      <div className="h-[2px] w-full rounded-t-[9px]"
        style={{ background: 'linear-gradient(90deg, rgba(170,255,0,0.5) 0%, rgba(0,229,255,0.15) 60%, transparent 100%)' }} />

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Card header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center border border-[rgba(170,255,0,0.12)] bg-[rgba(170,255,0,0.04)] group-hover:border-[rgba(170,255,0,0.25)] group-hover:bg-[rgba(170,255,0,0.08)] transition-all mt-0.5">
            <RiFolderOpenLine size={16} style={{ color: 'var(--color-neon-lime)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm text-[var(--color-text)] truncate leading-tight">{project.name}</div>
            <div className="text-[11px] text-[var(--color-text-dim)] mt-1 line-clamp-2 leading-relaxed">
              {project.description || <span className="italic opacity-60">no description</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-lime">
            <RiLockPasswordLine size={9} className="mr-1" />{project.vars.length} var{project.vars.length !== 1 ? 's' : ''}
          </span>
          <span className="badge badge-dim">
            <RiTimeLine size={9} className="mr-1" />{ageLabel}
          </span>
          {project.vars.filter(v => v.masked).length > 0 && (
            <span className="badge badge-dim">
              {project.vars.filter(v => v.masked).length} masked
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={() => onImport(project)}
            title="Import .env into this vault"
            className="btn btn-ghost text-[11px] px-2.5 py-1.5">
            <RiUploadLine size={11} /> import
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onDelete(project.id)}
            title="Delete vault"
            className="btn btn-danger p-1.5 opacity-0 group-hover:opacity-100 transition-all">
            <RiDeleteBinLine size={13} />
          </button>
          <Link href={`/vault/${project.id}`} className="btn btn-lime text-[11px]">
            open <RiArrowRightLine size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Main Page ─────────────────── */

export default function VaultPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [importTarget, setImportTarget] = useState<Project | null>(null);

  const load = useCallback(() => getProjects().then(setProjects), []);
  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this project vault?')) return;
    await deleteProject(id);
    load();
  }

  const totalVars = projects.reduce((s, p) => s + p.vars.length, 0);

  return (
    <>
      {/* Quick import modal */}
      {importTarget && (
        <QuickImportModal
          project={importTarget}
          onClose={() => setImportTarget(null)}
          onImported={load}
        />
      )}

      <div className="container-app py-10 max-w-5xl">

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-dim)] mb-2">
              <span style={{ color: 'var(--color-neon-green)' }}>$</span>
              <span>ls ~/.env/vault/</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Env Vault<span className="caret" />
            </h1>
            <p className="text-xs text-[var(--color-text-dim)] mt-1.5">
              Manage .env variables per project.{' '}
              <span className="text-[var(--color-text-muted)]">Sign in to sync to cloud.</span>
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Link href="/import" className="btn btn-ghost">
              <RiUploadLine size={12} /> import .env
            </Link>
            <button onClick={() => setShowForm(v => !v)} className="btn btn-lime">
              <RiAddLine size={13} /> new project
            </button>
          </div>
        </div>

        {/* Stats bar */}
        {projects.length > 0 && (
          <div className="flex items-center gap-6 mb-7 px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center gap-2">
              <RiDatabase2Line size={13} style={{ color: 'var(--color-neon-lime)' }} />
              <span className="text-xs text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text)]">{projects.length}</strong> project{projects.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-px h-4 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <RiCodeLine size={13} style={{ color: 'var(--color-neon-cyan)' }} />
              <span className="text-xs text-[var(--color-text-muted)]">
                <strong className="text-[var(--color-text)]">{totalVars}</strong> total var{totalVars !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="w-px h-4 bg-[var(--color-border)]" />
            <div className="flex items-center gap-2">
              <RiShieldKeyholeLine size={13} style={{ color: 'var(--color-text-dim)' }} />
              <span className="text-xs text-[var(--color-text-dim)]">stored locally · sign in to sync</span>
            </div>
          </div>
        )}

        {/* Security notice (only when no projects) */}
        {projects.length === 0 && !showForm && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-lg border mb-6"
            style={{ borderColor: 'rgba(255,181,71,0.2)', background: 'rgba(255,181,71,0.04)' }}>
            <RiShieldKeyholeLine size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--color-neon-amber)' }} />
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,181,71,0.7)' }}>
              Stored locally when not signed in. Sign in with GitHub to encrypt and sync to cloud.{' '}
              <strong style={{ color: 'var(--color-neon-amber)' }}>Do not use for production secrets.</strong>
            </p>
          </div>
        )}

        {/* Create form (inline card) */}
        {showForm && (
          <div className="term-card mb-6 fade-up" style={{ borderColor: 'rgba(170,255,0,0.2)' }}>
            <div className="term-card-header" style={{ color: 'var(--color-neon-lime)' }}>
              <span>$ mkdir ~/.env/vault/new</span>
              <button onClick={() => setShowForm(false)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,51,102,0.1)] text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-all">
                <RiCloseLine size={14} />
              </button>
            </div>
            <div className="term-card-body">
              <CreateForm onCreated={() => { load(); setShowForm(false); }} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && !showForm && (
          <div className="term-card fade-up">
            <div className="flex flex-col items-center py-24 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface-2)] mb-6">
                <RiFolderOpenLine size={26} style={{ color: 'var(--color-text-dim)' }} />
              </div>
              <div className="text-sm font-semibold text-[var(--color-text-muted)] mb-1">No vaults yet</div>
              <div className="text-xs text-[var(--color-text-dim)] mb-8 max-w-xs leading-relaxed">
                Create your first project vault to start storing environment variables securely.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(true)} className="btn btn-lime">
                  <RiAddLine size={13} /> new project
                </button>
                <Link href="/import" className="btn btn-ghost">
                  <RiUploadLine size={12} /> import .env
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                idx={i}
                onDelete={handleDelete}
                onImport={setImportTarget}
              />
            ))}

            {/* "+ New Project" card */}
            <button
              onClick={() => setShowForm(true)}
              className="term-card group flex flex-col items-center justify-center gap-3 p-8 border-dashed hover:border-[rgba(170,255,0,0.2)] hover:bg-[rgba(170,255,0,0.02)] transition-all min-h-[180px] fade-up"
              style={{ animationDelay: `${projects.length * 50}ms` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-dashed border-[var(--color-border)] group-hover:border-[rgba(170,255,0,0.3)] group-hover:bg-[rgba(170,255,0,0.06)] transition-all">
                <RiAddLine size={18} style={{ color: 'var(--color-text-dim)' }} className="group-hover:text-[var(--color-neon-lime)]" />
              </div>
              <span className="text-xs text-[var(--color-text-dim)] group-hover:text-[var(--color-neon-lime)] transition-colors">
                new project
              </span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--color-border-subtle)]">
          <span className="text-[11px] text-[var(--color-text-dim)]">
            {projects.length} project{projects.length !== 1 ? 's' : ''} · {totalVars} variable{totalVars !== 1 ? 's' : ''}
          </span>
          <Link href="/import"
            className="text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-neon-cyan)] transition-colors flex items-center gap-1">
            import existing .env <RiArrowRightLine size={11} />
          </Link>
        </div>
      </div>
    </>
  );
}

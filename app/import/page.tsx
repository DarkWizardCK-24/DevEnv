'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { parseEnvFile, getProjects, saveVars, createProject, type Project } from '@/lib/db';
import {
  RiArrowLeftLine, RiUploadLine, RiCheckLine, RiKeyLine,
  RiCloseLine, RiDragDropLine, RiFileLine, RiAddLine,
} from 'react-icons/ri';

export default function ImportPage() {
  const [raw, setRaw] = useState('');
  const [projectId, setProjectId] = useState('');
  const [newName, setNewName] = useState('');
  const [done, setDone] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getProjects().then(setProjects); }, []);

  const preview = raw.trim() ? parseEnvFile(raw) : [];

  /* ── File handling ── */
  function loadFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setRaw(ev.target?.result as string ?? '');
    reader.readAsText(file);
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function handleDragLeave(e: React.DragEvent) {
    if (!dropRef.current?.contains(e.relatedTarget as Node)) setDragging(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  /* ── Import ── */
  async function handleImport() {
    if (!raw.trim()) return;
    const vars = parseEnvFile(raw);
    if (!vars.length) return;

    let targetId = projectId;
    if (!targetId && newName.trim()) {
      const p = await createProject(newName.trim());
      targetId = p.id;
    }
    if (!targetId) return;

    setImporting(true);
    await saveVars(targetId, vars);
    setImporting(false);
    setDone(true);
  }

  function reset() {
    setDone(false);
    setRaw('');
    setFileName('');
    setProjectId('');
    setNewName('');
  }

  const canImport = raw.trim() && (projectId || newName.trim()) && preview.length > 0;

  return (
    <div className="container-app py-10 max-w-2xl">

      {/* Breadcrumb */}
      <Link href="/"
        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-neon-lime)] transition-colors mb-8 group">
        <RiArrowLeftLine size={12} className="group-hover:-translate-x-0.5 transition-transform" />
        ~/vault
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-dim)] mb-2">
          <span style={{ color: 'var(--color-neon-green)' }}>$</span>
          <span>devenv import .env</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Import .env<span className="caret" />
        </h1>
        <p className="text-xs text-[var(--color-text-dim)] mt-1.5 leading-relaxed">
          Drag & drop, choose a file, or paste your .env contents to bulk-import variables.
        </p>
      </div>

      {/* Success */}
      {done ? (
        <div className="term-card fade-up" style={{ borderColor: 'rgba(0,255,136,0.2)' }}>
          <div className="flex flex-col items-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(0,255,136,0.25)] bg-[rgba(0,255,136,0.06)] mb-5"
              style={{ boxShadow: '0 0 28px rgba(0,255,136,0.12)' }}>
              <RiCheckLine size={28} style={{ color: 'var(--color-neon-green)' }} />
            </div>
            <div className="text-base font-bold mb-1.5 glow-green" style={{ color: 'var(--color-neon-green)' }}>
              Import successful
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mb-7">
              {preview.length} variable{preview.length !== 1 ? 's' : ''} imported{fileName ? ` from ${fileName}` : ''}.
            </div>
            <div className="flex gap-3">
              <Link href="/" className="btn btn-lime">← back to vault</Link>
              <button onClick={reset} className="btn btn-ghost">import another</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Drop zone */}
          <div className="term-card">
            <div className="term-card-header" style={{ color: 'var(--color-neon-lime)' }}>
              <div className="flex items-center gap-2">
                <RiDragDropLine size={12} />
                <span>.env file</span>
              </div>
              {fileName && (
                <div className="flex items-center gap-2">
                  <span className="badge badge-lime">
                    <RiFileLine size={9} className="mr-1" />{fileName}
                  </span>
                  <button onClick={() => { setRaw(''); setFileName(''); }}
                    className="text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors">
                    <RiCloseLine size={12} />
                  </button>
                </div>
              )}
              {preview.length > 0 && !fileName && (
                <span className="badge badge-lime">{preview.length} detected</span>
              )}
            </div>
            <div className="term-card-body space-y-3">
              {/* Drag-drop zone */}
              <div
                ref={dropRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative rounded-lg border-2 border-dashed transition-all cursor-text"
                style={{
                  borderColor: dragging ? 'var(--color-neon-lime)' : raw ? 'var(--color-border)' : 'var(--color-border)',
                  background: dragging ? 'rgba(170,255,0,0.04)' : 'var(--color-surface-2)',
                  boxShadow: dragging ? '0 0 0 4px rgba(170,255,0,0.06)' : 'none',
                }}>
                {!raw && !dragging && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none select-none">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-dashed border-[var(--color-border)]">
                      <RiDragDropLine size={22} style={{ color: 'var(--color-text-dim)' }} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[var(--color-text-dim)]">Drag & drop a .env file here</div>
                      <div className="text-[10px] text-[var(--color-text-dim)] mt-0.5 opacity-60">or paste below</div>
                    </div>
                  </div>
                )}
                {dragging && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none select-none">
                    <RiDragDropLine size={28} style={{ color: 'var(--color-neon-lime)' }} />
                    <div className="text-xs text-[var(--color-neon-lime)] font-semibold">Drop to import</div>
                  </div>
                )}
                <textarea
                  className="relative w-full h-52 text-[11px] resize-none bg-transparent border-0"
                  style={{ boxShadow: 'none', opacity: dragging ? 0 : 1 }}
                  placeholder={raw ? '' : '\n\n\n\n\nDATABASE_URL=postgres://user:pass@host/db\nNEXT_PUBLIC_API_KEY=pk_live_...\nSECRET_KEY=sk_...'}
                  value={raw}
                  onChange={e => { setRaw(e.target.value); setFileName(''); }}
                />
              </div>

              {/* File picker button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-ghost text-[11px]">
                  <RiFileLine size={11} /> choose file
                </button>
                <input ref={fileRef} type="file" accept=".env,.txt,text/plain" className="sr-only" onChange={handleFileInput} />
                {raw && (
                  <button onClick={() => { setRaw(''); setFileName(''); }}
                    className="text-[10px] text-[var(--color-text-dim)] hover:text-[var(--color-neon-red)] transition-colors flex items-center gap-1">
                    <RiCloseLine size={11} /> clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Target project */}
          <div className="term-card">
            <div className="term-card-header" style={{ color: 'var(--color-neon-lime)' }}>
              <span>// target project</span>
            </div>
            <div className="term-card-body space-y-3">
              {projects.length > 0 && (
                <div>
                  <label className="block text-[10px] text-[var(--color-text-dim)] mb-1.5 uppercase tracking-widest">Existing project</label>
                  <select value={projectId} onChange={e => setProjectId(e.target.value)}>
                    <option value="">— create new project —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {!projectId && (
                <div>
                  <label className="block text-[10px] text-[var(--color-text-dim)] mb-1.5 uppercase tracking-widest">
                    {projects.length > 0 ? 'New project name' : 'Project name'}
                  </label>
                  <input
                    placeholder="my-saas, api-service..."
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    autoFocus={projects.length === 0}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="term-card fade-up">
              <div className="term-card-header">
                <div className="flex items-center gap-2" style={{ color: 'var(--color-text-dim)' }}>
                  <RiKeyLine size={11} />
                  <span>preview</span>
                </div>
                <span className="badge badge-lime">{preview.length} variable{preview.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-border max-h-56 overflow-y-auto">
                {preview.map(v => (
                  <div key={v.key} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-2)] transition-colors">
                    <span className="text-xs font-mono font-semibold w-2/5 truncate" style={{ color: 'var(--color-neon-lime)' }}>
                      {v.key}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-text-dim)] flex-1 truncate">
                      {'•'.repeat(Math.min(v.value.length || 8, 12))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={!canImport || importing}
            className="btn btn-lime w-full justify-center py-3.5 text-sm">
            {importing
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-[rgba(170,255,0,0.3)] border-t-[var(--color-neon-lime)] animate-spin inline-block" /> importing...</>
              : preview.length > 0
                ? <><RiUploadLine size={14} /> import {preview.length} variable{preview.length !== 1 ? 's' : ''}</>
                : <><RiUploadLine size={14} /> import .env</>}
          </button>

          <p className="text-[10px] text-[var(--color-text-dim)] text-center">
            Comments and blank lines are ignored · duplicate keys will be overwritten
          </p>
        </div>
      )}
    </div>
  );
}

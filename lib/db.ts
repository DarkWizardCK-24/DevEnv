import { createClient } from './supabase';

export type EnvVar = { key: string; value: string; masked: boolean; note?: string };
export type Project = { id: string; name: string; description?: string; vars: EnvVar[]; created_at: string; updated_at?: string };

const LS_KEY = 'devenv_vault';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const lsGet = (): Project[] => { try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; } };
const lsSet = (p: Project[]) => localStorage.setItem(LS_KEY, JSON.stringify(p));

export async function getProjects(): Promise<Project[]> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return lsGet();
  const { data } = await sb.from('env_projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  return (data ?? []).map(r => ({ ...r, vars: r.vars ?? [] }));
}

export async function getProject(id: string): Promise<Project | null> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return lsGet().find(p => p.id === id) ?? null;
  const { data } = await sb.from('env_projects').select('*').eq('id', id).eq('user_id', user.id).single();
  return data ? { ...data, vars: data.vars ?? [] } : null;
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    const p: Project = { id: uid(), name, description, vars: [], created_at: new Date().toISOString() };
    lsSet([...lsGet(), p]);
    return p;
  }
  const { data, error } = await sb.from('env_projects').insert({ user_id: user.id, name, description, vars: [] }).select().single();
  if (error) throw error;
  return { ...data, vars: [] };
}

export async function deleteProject(id: string): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { lsSet(lsGet().filter(p => p.id !== id)); return; }
  await sb.from('env_projects').delete().eq('id', id).eq('user_id', user.id);
}

export async function saveVars(id: string, vars: EnvVar[]): Promise<void> {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) { lsSet(lsGet().map(p => p.id === id ? { ...p, vars } : p)); return; }
  await sb.from('env_projects').update({ vars }).eq('id', id).eq('user_id', user.id);
}

export function exportDotEnv(project: Project): string {
  return project.vars.map(v => `${v.key}=${v.value}${v.note ? ` # ${v.note}` : ''}`).join('\n');
}

export function parseEnvFile(content: string): EnvVar[] {
  return content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => {
    const [key, ...rest] = l.split('=');
    return { key: key.trim(), value: rest.join('=').replace(/^["']|["']$/g, ''), masked: false };
  }).filter(v => v.key);
}

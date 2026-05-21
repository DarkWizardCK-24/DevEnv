export type EnvVar = {
  key: string;
  value: string;
  masked: boolean;
  note?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  vars: EnvVar[];
};

const VAULT_KEY = 'devenv_vault';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function getProjects(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) ?? '[]');
  } catch { return []; }
}

export function getProject(id: string): Project | null {
  return getProjects().find(p => p.id === id) ?? null;
}

export function createProject(name: string, description?: string): Project {
  const project: Project = {
    id: uid(),
    name,
    description,
    createdAt: new Date().toISOString(),
    vars: [],
  };
  const all = getProjects();
  all.push(project);
  localStorage.setItem(VAULT_KEY, JSON.stringify(all));
  return project;
}

export function updateProject(id: string, patch: Partial<Omit<Project, 'id' | 'createdAt'>>): void {
  const all = getProjects().map(p => p.id === id ? { ...p, ...patch } : p);
  localStorage.setItem(VAULT_KEY, JSON.stringify(all));
}

export function deleteProject(id: string): void {
  const all = getProjects().filter(p => p.id !== id);
  localStorage.setItem(VAULT_KEY, JSON.stringify(all));
}

export function addVar(projectId: string, v: EnvVar): void {
  const all = getProjects().map(p => {
    if (p.id !== projectId) return p;
    const vars = p.vars.filter(x => x.key !== v.key);
    return { ...p, vars: [...vars, v] };
  });
  localStorage.setItem(VAULT_KEY, JSON.stringify(all));
}

export function deleteVar(projectId: string, key: string): void {
  const all = getProjects().map(p => {
    if (p.id !== projectId) return p;
    return { ...p, vars: p.vars.filter(v => v.key !== key) };
  });
  localStorage.setItem(VAULT_KEY, JSON.stringify(all));
}

export function exportDotEnv(project: Project): string {
  return project.vars.map(v => `${v.key}=${v.value}${v.note ? ` # ${v.note}` : ''}`).join('\n');
}

export function parseEnvFile(content: string): EnvVar[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...rest] = line.split('=');
      const value = rest.join('=').replace(/^["']|["']$/g, '');
      return { key: key.trim(), value, masked: false };
    })
    .filter(v => v.key);
}

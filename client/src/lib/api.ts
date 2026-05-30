import type { Project, Version } from '../types';

const API_BASE_URL = (import.meta.env.VITE_BASEURL as string | undefined)?.trim().replace(/^['"]|['"]$/g, '') || 'http://localhost:3000';

type ApiErrorBody = { error?: { message?: string; code?: string } };

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.error?.message ?? message;
    } catch {
      // Keep generic message when server did not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const projectsApi = {
  list: (search?: string) => request<{ projects: Project[] }>(`/api/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (data: { name: string; prompt: string }) => request<{ project: Project }>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  get: (projectId: string) => request<{ project: Project }>(`/api/projects/${projectId}`),
  update: (projectId: string, data: { name?: string; current_code?: string }) => request<{ project: Project }>(`/api/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (projectId: string) => request<void>(`/api/projects/${projectId}`, { method: 'DELETE' }),
  generate: (projectId: string, prompt: string) => request<{ project: Project }>(`/api/projects/${projectId}/generate`, { method: 'POST', body: JSON.stringify({ prompt }) }),
  restoreVersion: (projectId: string, versionId: string) => request<{ project: Project }>(`/api/projects/${projectId}/versions/${versionId}/restore`, { method: 'POST' }),
  publish: (projectId: string) => request<{ project: Project }>(`/api/projects/${projectId}/publish`, { method: 'POST' }),
  unpublish: (projectId: string) => request<{ project: Project }>(`/api/projects/${projectId}/unpublish`, { method: 'POST' }),
  duplicate: (projectId: string) => request<{ project: Project }>(`/api/projects/${projectId}/duplicate`, { method: 'POST' }),
};

export const publicApi = {
  list: () => request<{ projects: Project[] }>('/api/public/projects'),
  get: (projectId: string) => request<{ project: Project }>(`/api/public/projects/${projectId}`),
  getVersion: (projectId: string, versionId: string) => request<{ version: Version }>(`/api/public/projects/${projectId}/versions/${versionId}`),
};

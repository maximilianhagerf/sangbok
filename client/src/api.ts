import type { Collection, Section, Settings, Song } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (res.status === 204) return undefined as unknown as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

// Collections
export const getCollections = () => request<Collection[]>('/api/collections');
export const createCollection = (name: string) =>
  request<Collection>('/api/collections', { method: 'POST', body: JSON.stringify({ name }) });
export const updateCollection = (id: number, name: string) =>
  request<Collection>(`/api/collections/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
export const deleteCollection = (id: number) =>
  request<void>(`/api/collections/${id}`, { method: 'DELETE' });

// Songs
export const getSongs = (collectionId: number) => request<Song[]>(`/api/songs?c=${collectionId}`);
export const getSong = (id: number) => request<Song>(`/api/songs/${id}`);
export const createSong = (collectionId: number, body: Partial<Song>) =>
  request<Song>('/api/songs', { method: 'POST', body: JSON.stringify({ ...body, collection_id: collectionId }) });
export const updateSong = (id: number, body: Partial<Song>) =>
  request<Song>(`/api/songs/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteSong = (id: number) => request<void>(`/api/songs/${id}`, { method: 'DELETE' });
export const reorderSongs = (ids: number[]) =>
  request<void>('/api/songs/reorder', { method: 'PATCH', body: JSON.stringify({ ids }) });

// Settings
export const getSettings = (collectionId: number) => request<Settings>(`/api/settings?c=${collectionId}`);
export const updateSettings = (collectionId: number, body: Settings) =>
  request<Settings>(`/api/settings?c=${collectionId}`, { method: 'PUT', body: JSON.stringify(body) });

// Sections
export const createSection = (songId: number, body: Partial<Section>) =>
  request<Section>(`/api/songs/${songId}/sections`, { method: 'POST', body: JSON.stringify(body) });
export const updateSection = (id: number, body: Partial<Section>) =>
  request<Section>(`/api/sections/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteSection = (id: number) =>
  request<void>(`/api/sections/${id}`, { method: 'DELETE' });
export const reorderSections = (songId: number, ids: number[]) =>
  request<void>(`/api/songs/${songId}/sections/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });

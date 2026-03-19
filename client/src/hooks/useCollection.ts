import { useEffect, useState } from 'react';
import * as api from '../api';
import type { Collection, Settings, Song } from '../types';

export function useCollection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<number | null>(() => {
    const stored = localStorage.getItem('sangbok_collection');
    return stored ? Number(stored) : null;
  });
  const [songs, setSongs] = useState<Song[]>([]);
  const [settings, setSettings] = useState<Settings>({
    cover_title: '',
    cover_subtitle: '',
    cover_credit: '',
  });
  const [loading, setLoading] = useState(true);

  // Load collections on mount, then select appropriate one
  useEffect(() => {
    api.getCollections().then((cols) => {
      setCollections(cols);
      if (cols.length === 0) return;
      const stored = localStorage.getItem('sangbok_collection');
      const storedId = stored ? Number(stored) : null;
      const match = storedId ? cols.find((c) => c.id === storedId) : null;
      const id = match ? match.id : cols[0].id;
      setActiveCollectionId(id);
      localStorage.setItem('sangbok_collection', String(id));
    });
  }, []);

  // Reload songs and settings when activeCollectionId changes
  useEffect(() => {
    if (activeCollectionId === null) return;
    setLoading(true);
    Promise.all([api.getSongs(activeCollectionId), api.getSettings(activeCollectionId)])
      .then(([s, cfg]) => {
        setSongs(s);
        setSettings(cfg);
      })
      .finally(() => setLoading(false));
  }, [activeCollectionId]);

  function switchCollection(id: number) {
    setActiveCollectionId(id);
    localStorage.setItem('sangbok_collection', String(id));
  }

  async function renameCollection(id: number, name: string) {
    const updated = await api.updateCollection(id, name);
    setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }

  async function deleteCollection(id: number) {
    await api.deleteCollection(id);
    const remaining = collections.filter((c) => c.id !== id);
    setCollections(remaining);
    if (activeCollectionId === id && remaining.length > 0) {
      switchCollection(remaining[0].id);
      localStorage.setItem('sangbok_collection', String(remaining[0].id));
    }
  }

  async function createCollection(name: string) {
    const col = await api.createCollection(name);
    setCollections((prev) => [...prev, col]);
    switchCollection(col.id);
    localStorage.setItem('sangbok_collection', String(col.id));
  }

  return {
    collections,
    activeCollectionId,
    songs,
    settings,
    loading,
    switchCollection,
    createCollection,
    renameCollection,
    deleteCollection,
    setSongs,
    setSettings,
  };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFileSize } from "./fs";
import type { RecentPdf } from "./types";

const STORAGE_KEY = "image-to-pdf:recents";
const MAX_RECENTS = 20;

export async function loadRecents(): Promise<RecentPdf[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentPdf[];
    if (!Array.isArray(parsed)) return [];

    let changed = false;
    const refreshed = await Promise.all(
      parsed.map(async (item) => {
        if (item.sizeBytes > 0) return item;
        const sizeBytes = await getFileSize(item.path);
        if (sizeBytes !== item.sizeBytes) changed = true;
        return { ...item, sizeBytes };
      }),
    );
    const available = refreshed.filter((item) => item.sizeBytes > 0);
    if (available.length !== refreshed.length) changed = true;
    if (changed) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(available));
    return available;
  } catch {
    return [];
  }
}

export async function addRecent(entry: RecentPdf): Promise<RecentPdf[]> {
  const existing = await loadRecents();
  const withoutDup = existing.filter((item) => item.path !== entry.path);
  const next = [entry, ...withoutDup].slice(0, MAX_RECENTS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function renameRecent(
  oldPath: string,
  next: { path: string; name: string },
): Promise<RecentPdf[]> {
  const existing = await loadRecents();
  const renamed = existing.map((item) =>
    item.path === oldPath ? { ...item, id: next.name, name: next.name, path: next.path } : item,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(renamed));
  return renamed;
}

export function sortRecentsDesc(items: RecentPdf[]): RecentPdf[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function formatRecentDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString();
}

import { MAX_PAGES, WARN_PAGES, type PdfPage } from "./types";

export function createPageId(): string {
  return `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function canAddPage(currentCount: number): boolean {
  return currentCount < MAX_PAGES;
}

export function shouldWarnLargeDoc(pageCount: number): boolean {
  return pageCount >= WARN_PAGES;
}

export function reorderPages(pages: PdfPage[], fromIndex: number, toIndex: number): PdfPage[] {
  if (fromIndex === toIndex) return pages;
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= pages.length || toIndex >= pages.length) {
    return pages;
  }
  const next = [...pages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function movePage(pages: PdfPage[], index: number, direction: -1 | 1): PdfPage[] {
  const target = index + direction;
  if (target < 0 || target >= pages.length) return pages;
  return reorderPages(pages, index, target);
}

export function deletePage(pages: PdfPage[], index: number): PdfPage[] {
  if (index < 0 || index >= pages.length) return pages;
  return pages.filter((_, i) => i !== index);
}

export function rotatePage(page: PdfPage): PdfPage {
  const next = ((page.rotation + 90) % 360) as PdfPage["rotation"];
  return { ...page, rotation: next };
}

export function updatePage(pages: PdfPage[], index: number, patch: Partial<PdfPage>): PdfPage[] {
  return pages.map((page, i) => (i === index ? { ...page, ...patch } : page));
}

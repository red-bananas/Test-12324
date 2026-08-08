import type { PdfPage } from "./types";

let sessionPages: PdfPage[] = [];

export function getSessionPages(): PdfPage[] {
  return sessionPages;
}

export function setSessionPages(pages: PdfPage[]): void {
  sessionPages = pages;
}

export function clearSession(): void {
  sessionPages = [];
}

export function appendSessionPage(page: PdfPage): void {
  sessionPages = [...sessionPages, page];
}

export function replaceSessionPages(updater: (pages: PdfPage[]) => PdfPage[]): void {
  sessionPages = updater(sessionPages);
}

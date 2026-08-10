import { Image } from "react-native";
import type { PdfPage, RecentPdf } from "./types";

export function isScreenshotMode(value: string | string[] | undefined): boolean {
  return value === "1" || value === "true";
}

function assetUri(moduleId: number): { uri: string; width: number; height: number } {
  const source = Image.resolveAssetSource(moduleId);
  return {
    uri: source.uri,
    width: source.width,
    height: source.height,
  };
}

const page1 = assetUri(require("../assets/screenshots/demo-page-1.png"));
const page2 = assetUri(require("../assets/screenshots/demo-page-2.png"));
const page3 = assetUri(require("../assets/screenshots/demo-page-3.png"));

export const DEMO_PAGES: PdfPage[] = [
  {
    id: "demo-page-1",
    uri: page1.uri,
    width: page1.width,
    height: page1.height,
    rotation: 0,
  },
  {
    id: "demo-page-2",
    uri: page2.uri,
    width: page2.width,
    height: page2.height,
    rotation: 90,
  },
  {
    id: "demo-page-3",
    uri: page3.uri,
    width: page3.width,
    height: page3.height,
    rotation: 0,
  },
];

export const DEMO_RECENTS: RecentPdf[] = [
  {
    id: "demo-recent-1",
    name: "Invoice-Aug-2026.pdf",
    path: "file:///data/user/0/app.autoapp.imagetopdf/files/Invoice-Aug-2026.pdf",
    sizeBytes: 284_672,
    pageCount: 3,
    createdAt: new Date("2026-08-09T10:30:00.000Z").toISOString(),
  },
  {
    id: "demo-recent-2",
    name: "Meeting-notes.pdf",
    path: "file:///data/user/0/app.autoapp.imagetopdf/files/Meeting-notes.pdf",
    sizeBytes: 156_240,
    pageCount: 2,
    createdAt: new Date("2026-08-08T16:15:00.000Z").toISOString(),
  },
  {
    id: "demo-recent-3",
    name: "Receipt-scan.pdf",
    path: "file:///data/user/0/app.autoapp.imagetopdf/files/Receipt-scan.pdf",
    sizeBytes: 412_880,
    pageCount: 4,
    createdAt: new Date("2026-08-07T09:05:00.000Z").toISOString(),
  },
];

export const DEMO_SUCCESS = {
  name: "Invoice-Aug-2026.pdf",
  path: "file:///data/user/0/app.autoapp.imagetopdf/files/Invoice-Aug-2026.pdf",
  sizeBytes: "284672",
  pageCount: "3",
  saved: "1",
};

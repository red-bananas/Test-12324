import {
  canAddPage,
  deletePage,
  movePage,
  reorderPages,
  rotatePage,
  shouldWarnLargeDoc,
} from "../lib/pages";
import { exportPdf, estimatePdfSizeBytes, preparePageForExport } from "../lib/pdf";
import { displayExportPath, getUniquePdfName, isTemporaryExportPath, normalizePdfName, toFileUri } from "../lib/fs";
import { fitImageForExport, mapPaperSizeForNative, toPdfImageUri } from "../lib/exportImage";
import { applyRectCrop, cropRectToPixels, FULL_CROP, moveCrop, resizeCrop, rotateCrop } from "../lib/crop";
import { addRecent, formatRecentDate, formatRecentMeta, sortRecentsDesc } from "../lib/recents";
import type { PdfPage } from "../lib/types";

const page = (id: string): PdfPage => ({
  id,
  uri: `file://${id}.jpg`,
  width: 100,
  height: 100,
  rotation: 0,
});

describe("pages", () => {
  it("reorders pages", () => {
    const pages = [page("a"), page("b"), page("c")];
    expect(reorderPages(pages, 0, 2).map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("moves page left and right", () => {
    const pages = [page("a"), page("b"), page("c")];
    expect(movePage(pages, 1, -1).map((p) => p.id)).toEqual(["b", "a", "c"]);
    expect(movePage(pages, 1, 1).map((p) => p.id)).toEqual(["a", "c", "b"]);
  });

  it("deletes a page", () => {
    const pages = [page("a"), page("b")];
    expect(deletePage(pages, 0).map((p) => p.id)).toEqual(["b"]);
  });

  it("rotates page 90 degrees", () => {
    const rotated = rotatePage(page("a"));
    expect(rotated.rotation).toBe(90);
  });

  it("caps at 500 pages", () => {
    expect(canAddPage(500)).toBe(false);
    expect(canAddPage(499)).toBe(true);
  });

  it("warns at 50+ pages", () => {
    expect(shouldWarnLargeDoc(49)).toBe(false);
    expect(shouldWarnLargeDoc(50)).toBe(true);
  });
});

describe("pdf export", () => {
  it("exportPdf compresses pages and writes a temporary PDF", async () => {
    const createPdf = jest.fn().mockResolvedValue({ filePath: "/tmp/out.pdf" });
    const persistPdf = jest.fn().mockResolvedValue("file:///cache/ImageToPDF/temp/document.pdf");
    const manipulate = jest.fn(async (uri: string) => ({ uri: `file:///cache/${uri.split("/").pop()}` }));
    const pages = [page("a"), page("b")];
    const result = await exportPdf(
      pages,
      { paperSize: "A4", jpegQuality: 0.85 },
      {
        createPdf,
        manipulate,
        getTempExportDirectory: async () => "/cache/ImageToPDF/temp/",
        getFileSize: async () => 1024,
        persistPdf,
      },
    );
    expect(manipulate).toHaveBeenCalled();
    expect(createPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        imagePaths: ["file:///cache/a.jpg", "file:///cache/b.jpg"],
        paperSize: "A4",
      }),
    );
    expect(result.pageCount).toBe(2);
    expect(result.saved).toBe(false);
    expect(result.filePath).toBe("file:///cache/ImageToPDF/temp/document.pdf");
    expect(persistPdf).toHaveBeenCalledWith("/tmp/out.pdf", expect.stringMatching(/^\/cache\/ImageToPDF\/temp\/PDF-\d{8}-\d{6}\.pdf$/));
  });

  it("preparePageForExport re-encodes every page through the manipulator", async () => {
    const manipulate = jest.fn(async (uri: string, actions) => ({
      uri: "file:///cache/page.jpg",
      width: 800,
      height: 600,
    }));
    const prepared = await preparePageForExport(
      { ...page("a"), width: 4000, height: 3000 },
      { paperSize: "A4", jpegQuality: 0.7 },
      {
        createPdf: jest.fn(),
        manipulate,
        getFileSize: async () => 2048,
      },
    );
    expect(manipulate).toHaveBeenCalledWith(
      "file://a.jpg",
      expect.arrayContaining([expect.objectContaining({ resize: expect.any(Object) })]),
      0.7,
    );
    expect(prepared.imageUri).toBe("file:///cache/page.jpg");
  });

  it("estimates larger PDFs for more pages and higher quality", () => {
    const settings = { paperSize: "A4" as const, jpegQuality: 0.85 };
    const onePage = estimatePdfSizeBytes([{ ...page("a"), width: 3000, height: 4000 }], settings);
    const twoPages = estimatePdfSizeBytes(
      [
        { ...page("a"), width: 3000, height: 4000 },
        { ...page("b"), width: 3000, height: 4000 },
      ],
      settings,
    );
    const lowerQuality = estimatePdfSizeBytes(
      [{ ...page("a"), width: 3000, height: 4000 }],
      { paperSize: "A4", jpegQuality: 0.7 },
    );

    expect(twoPages).toBeGreaterThan(onePage);
    expect(lowerQuality).toBeLessThan(onePage);
  });

  it("rejects an empty generated PDF instead of showing success", async () => {
    await expect(
      exportPdf([page("a")], { paperSize: "A4", jpegQuality: 0.85 }, {
        createPdf: async () => ({ filePath: "/tmp/out.pdf" }),
        getTempExportDirectory: async () => "/cache/ImageToPDF/temp/",
        manipulate: async (uri) => ({ uri: `file:///cache/${uri.split("/").pop()}` }),
        persistPdf: async () => "file:///cache/ImageToPDF/temp/document.pdf",
        getFileSize: async (uri) => (uri.includes("document.pdf") ? 0 : 2048),
      }),
    ).rejects.toThrow("PDF file is empty");
  });
});

describe("export image sizing", () => {
  it("downscales very large photos while keeping aspect ratio", () => {
    expect(fitImageForExport(4000, 3000, 0)).toEqual({ width: 2048, height: 1536 });
    expect(fitImageForExport(1200, 900, 0)).toEqual({ width: 1200, height: 900 });
  });

  it("maps app paper sizes to native PDF paper names", () => {
    expect(mapPaperSizeForNative("LETTER")).toBe("Letter");
    expect(mapPaperSizeForNative("A4")).toBe("A4");
  });

  it("normalizes export image URIs for the PDF module", () => {
    expect(toPdfImageUri("/data/user/0/page.jpg")).toBe("file:///data/user/0/page.jpg");
    expect(toPdfImageUri("file:///data/user/0/page.jpg")).toBe("file:///data/user/0/page.jpg");
  });
});

describe("file paths", () => {
  it("normalizes native absolute paths for Expo file APIs", () => {
    expect(toFileUri("/storage/emulated/0/file.pdf")).toBe("file:///storage/emulated/0/file.pdf");
    expect(toFileUri("file:///data/file.pdf")).toBe("file:///data/file.pdf");
  });

  it("shows a human-readable durable app location", () => {
    expect(displayExportPath("file:///data/files/ImageToPDF/report.pdf"))
      .toBe("App storage/ImageToPDF/report.pdf");
    expect(displayExportPath("file:///cache/ImageToPDF/temp/report.pdf"))
      .toBe("Not saved yet");
  });

  it("detects temporary export paths", () => {
    expect(isTemporaryExportPath("file:///cache/ImageToPDF/temp/report.pdf")).toBe(true);
    expect(isTemporaryExportPath("file:///data/files/ImageToPDF/report.pdf")).toBe(false);
  });

  it("creates a short filename using local date and time", () => {
    const name = getUniquePdfName();
    expect(name).toMatch(/^PDF-\d{8}-\d{6}\.pdf$/);
    expect(name.length).toBeLessThanOrEqual(23);
  });

  it("normalizes a user-entered PDF name", () => {
    expect(normalizePdfName("  Tax / receipts.pdf  ")).toBe("Tax - receipts.pdf");
    expect(() => normalizePdfName("... ")).toThrow("Enter a file name");
  });
});

describe("crop geometry", () => {
  it("converts a normalized crop to source-image pixels", () => {
    expect(cropRectToPixels({ x: 0.1, y: 0.2, width: 0.5, height: 0.6 }, 1000, 500))
      .toEqual({ originX: 100, originY: 100, width: 500, height: 300 });
  });

  it("resizes corners while keeping a usable minimum area", () => {
    const resized = resizeCrop(FULL_CROP, "topLeft", 0.25, 0.2);
    expect(resized).toEqual({ x: 0.25, y: 0.2, width: 0.75, height: 0.8 });

    const clamped = resizeCrop(FULL_CROP, "topLeft", 0.99, 0.99);
    expect(clamped.width).toBeCloseTo(0.12);
    expect(clamped.height).toBeCloseTo(0.12);
  });

  it("moves and edge-resizes a crop rect", () => {
    const moved = moveCrop({ x: 0.1, y: 0.1, width: 0.5, height: 0.5 }, 0.05, 0.05);
    expect(moved.x).toBeCloseTo(0.15);
    expect(moved.y).toBeCloseTo(0.15);
    expect(moved.width).toBe(0.5);
    expect(moved.height).toBe(0.5);

    const edge = resizeCrop({ x: 0.1, y: 0.1, width: 0.5, height: 0.5 }, "right", 0.1, 0);
    expect(edge.width).toBeCloseTo(0.6);
  });

  it("applies a rectangular crop through the manipulator", async () => {
    const result = await applyRectCrop("file:///photo.jpg", 1000, 800, {
      x: 0.1,
      y: 0.2,
      width: 0.5,
      height: 0.6,
    });
    expect(result.uri).toBe("file:///photo.jpg");
    expect(result.width).toBe(1000);
    expect(result.height).toBe(1000);
  });

  it("rotates an existing crop so it stays editable after page rotation", () => {
    const original = { x: 0.1, y: 0.2, width: 0.5, height: 0.6 };
    expect(rotateCrop(original, 90)).toEqual({ x: 0.2, y: 0.1, width: 0.6, height: 0.5 });
    expect(rotateCrop(original, 180)).toEqual({ x: 0.4, y: 0.2, width: 0.5, height: 0.6 });
    expect(rotateCrop(original, 270)).toEqual({ x: 0.2, y: 0.4, width: 0.6, height: 0.5 });
  });
});

describe("recents", () => {
  it("sorts recents newest first", () => {
    const sorted = sortRecentsDesc([
      {
        id: "1",
        name: "old.pdf",
        path: "/a.pdf",
        sizeBytes: 1,
        pageCount: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "2",
        name: "new.pdf",
        path: "/b.pdf",
        sizeBytes: 2,
        pageCount: 2,
        createdAt: "2026-08-01T00:00:00.000Z",
      },
    ]);
    expect(sorted[0].name).toBe("new.pdf");
  });

  it("formats recent dates", () => {
    const today = new Date().toISOString();
    expect(formatRecentDate(today)).toMatch(/\d{1,2} \w{3} \d{4} · /);
  });

  it("formats recent metadata on one line", () => {
    const meta = formatRecentMeta({
      id: "1",
      name: "scan.pdf",
      path: "/scan.pdf",
      sizeBytes: 2048,
      pageCount: 3,
      createdAt: "2026-08-01T12:00:00.000Z",
    });
    expect(meta).toContain("2.0 KB");
    expect(meta).toContain("3 pages");
    expect(meta).toContain("·");
  });

  it("addRecent prepends and caps list", async () => {
    const entry = {
      id: "x",
      name: "x.pdf",
      path: "/x.pdf",
      sizeBytes: 10,
      pageCount: 1,
      createdAt: new Date().toISOString(),
    };
    const list = await addRecent(entry);
    expect(list[0].path).toBe("/x.pdf");
  });
});

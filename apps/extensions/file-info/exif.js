/**
 * Minimal EXIF reader for JPEG. Pure (no DOM). Idempotent global.
 * Returns { make, model, dateTime, orientation, gps:{lat,lng} } or null.
 */
var FileInfoExif = (typeof window !== 'undefined' && window.FileInfoExif) || (() => {
  const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };

  function toView(input) {
    if (!input) return null;
    const tag = Object.prototype.toString.call(input);
    if (tag === '[object DataView]') return input;
    if (tag === '[object ArrayBuffer]') return new DataView(input);
    if (ArrayBuffer.isView(input)) return new DataView(input.buffer, input.byteOffset, input.byteLength);
    return null;
  }

  /** Find the TIFF start offset inside the APP1 "Exif\0\0" segment, or -1. */
  function findExifStart(view) {
    if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return -1; // not JPEG
    let offset = 2;
    while (offset + 4 <= view.byteLength) {
      if (view.getUint8(offset) !== 0xff) return -1;
      const marker = view.getUint8(offset + 1);
      if (marker === 0xda || marker === 0xd9) return -1; // SOS / EOI — no more metadata
      const size = view.getUint16(offset + 2);
      if (marker === 0xe1) {
        const p = offset + 4;
        if (
          view.getUint8(p) === 0x45 && view.getUint8(p + 1) === 0x78 &&
          view.getUint8(p + 2) === 0x69 && view.getUint8(p + 3) === 0x66 &&
          view.getUint8(p + 4) === 0x00 && view.getUint8(p + 5) === 0x00
        ) {
          return p + 6; // TIFF header start
        }
      }
      offset += 2 + size;
    }
    return -1;
  }

  function readString(view, offset, count, le) {
    let s = '';
    for (let i = 0; i < count; i += 1) {
      const c = view.getUint8(offset + i);
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s.trim();
  }

  function entryValueOffset(view, entryOffset, tiff, le) {
    const type = view.getUint16(entryOffset + 2, le);
    const count = view.getUint32(entryOffset + 4, le);
    const bytes = (TYPE_SIZE[type] || 1) * count;
    const inline = entryOffset + 8;
    return { type, count, valueOffset: bytes <= 4 ? inline : tiff + view.getUint32(inline, le) };
  }

  function readRationalsToDecimal(view, offset, le, refNegative) {
    // 3 rationals: degrees, minutes, seconds
    const part = (o) => view.getUint32(o, le) / (view.getUint32(o + 4, le) || 1);
    const deg = part(offset);
    const min = part(offset + 8);
    const sec = part(offset + 16);
    const dec = deg + min / 60 + sec / 3600;
    return refNegative ? -dec : dec;
  }

  function parseIfd(view, ifdOffset, tiff, le, wanted) {
    const out = {};
    if (ifdOffset + 2 > view.byteLength) return out;
    const count = view.getUint16(ifdOffset, le);
    for (let i = 0; i < count; i += 1) {
      const entry = ifdOffset + 2 + i * 12;
      if (entry + 12 > view.byteLength) break;
      const tag = view.getUint16(entry, le);
      if (!wanted[tag]) continue;
      const { type, count: c, valueOffset } = entryValueOffset(view, entry, tiff, le);
      wanted[tag](out, { view, valueOffset, count: c, type, le });
    }
    return out;
  }

  function parse(input) {
    const view = toView(input);
    if (!view) return null;
    const tiff = findExifStart(view);
    if (tiff < 0 || tiff + 8 > view.byteLength) return null;

    const order = view.getUint16(tiff);
    const le = order === 0x4949; // II = little-endian
    if (!le && order !== 0x4d4d) return null;

    const ifd0Offset = tiff + view.getUint32(tiff + 4, le);
    const result = {};

    const ifd0 = parseIfd(view, ifd0Offset, tiff, le, {
      0x010f: (o, e) => { o.make = readString(e.view, e.valueOffset, e.count, le); },
      0x0110: (o, e) => { o.model = readString(e.view, e.valueOffset, e.count, le); },
      0x0112: (o, e) => { o.orientation = e.view.getUint16(e.valueOffset, le); },
      0x0132: (o, e) => { o.dateTime = readString(e.view, e.valueOffset, e.count, le); },
      0x8769: (o, e) => { o.exifPtr = e.view.getUint32(e.valueOffset, le); },
      0x8825: (o, e) => { o.gpsPtr = e.view.getUint32(e.valueOffset, le); }
    });

    if (ifd0.make) result.make = ifd0.make;
    if (ifd0.model) result.model = ifd0.model;
    if (ifd0.orientation) result.orientation = ifd0.orientation;
    if (ifd0.dateTime) result.dateTime = ifd0.dateTime;

    if (ifd0.exifPtr) {
      const exif = parseIfd(view, tiff + ifd0.exifPtr, tiff, le, {
        0x9003: (o, e) => { o.dateTimeOriginal = readString(e.view, e.valueOffset, e.count, le); }
      });
      if (exif.dateTimeOriginal) result.dateTime = exif.dateTimeOriginal;
    }

    if (ifd0.gpsPtr) {
      const gps = parseIfd(view, tiff + ifd0.gpsPtr, tiff, le, {
        0x0001: (o, e) => { o.latRef = readString(e.view, e.valueOffset, e.count, le); },
        0x0002: (o, e) => { o.latOffset = e.valueOffset; },
        0x0003: (o, e) => { o.lngRef = readString(e.view, e.valueOffset, e.count, le); },
        0x0004: (o, e) => { o.lngOffset = e.valueOffset; }
      });
      if (gps.latOffset != null && gps.lngOffset != null) {
        result.gps = {
          lat: readRationalsToDecimal(view, gps.latOffset, le, gps.latRef === 'S'),
          lng: readRationalsToDecimal(view, gps.lngOffset, le, gps.lngRef === 'W')
        };
      }
    }

    return Object.keys(result).length ? result : null;
  }

  return { parse };
})();

if (typeof window !== 'undefined') window.FileInfoExif = FileInfoExif;

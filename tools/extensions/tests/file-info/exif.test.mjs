import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { loadFileInfo } from '../helpers/load-file-info.mjs';

/** Build a minimal little-endian JPEG with an APP1 EXIF block (Make + Orientation). */
function buildJpegWithExif() {
  return new Uint8Array([
    0xff, 0xd8,             // SOI
    0xff, 0xe1, 0x00, 0x34, // APP1, length 52
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    // TIFF header (little-endian)
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    // IFD0: 2 entries
    0x02, 0x00,
    // Make (0x010F), ASCII, count 6, offset 38
    0x0f, 0x01, 0x02, 0x00, 0x06, 0x00, 0x00, 0x00, 0x26, 0x00, 0x00, 0x00,
    // Orientation (0x0112), SHORT, count 1, value 1
    0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    // next IFD offset = 0
    0x00, 0x00, 0x00, 0x00,
    // "Canon\0"
    0x43, 0x61, 0x6e, 0x6f, 0x6e, 0x00
  ]).buffer;
}

describe('FileInfoExif', () => {
  let exif;

  before(() => {
    ({ exif } = loadFileInfo());
  });

  it('parses make and orientation from a JPEG APP1 block', () => {
    const result = exif.parse(buildJpegWithExif());
    assert.ok(result, 'expected EXIF result');
    assert.equal(result.make, 'Canon');
    assert.equal(result.orientation, 1);
  });

  it('returns null for non-JPEG input', () => {
    assert.equal(exif.parse(new Uint8Array([0, 1, 2, 3]).buffer), null);
  });

  it('returns null for JPEG without EXIF', () => {
    assert.equal(exif.parse(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]).buffer), null);
  });
});

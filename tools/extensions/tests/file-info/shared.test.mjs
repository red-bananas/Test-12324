import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { loadFileInfo } from '../helpers/load-file-info.mjs';

describe('FileInfoShared', () => {
  let shared;

  before(() => {
    ({ shared } = loadFileInfo());
  });

  it('reduces aspect ratio', () => {
    assert.equal(shared.calculateAspectRatio(1920, 1080), '16:9');
    assert.equal(shared.calculateAspectRatio(800, 600), '4:3');
    assert.equal(shared.calculateAspectRatio(0, 600), 'Unknown');
  });

  it('formats dimensions', () => {
    assert.equal(shared.formatDimensions(1920, 1080), '1920 × 1080px');
    assert.equal(shared.formatDimensionsCompact(1920, 1080), '1920x1080');
    assert.equal(shared.formatDimensions('x', 1), null);
  });

  it('formats file size in human units', () => {
    assert.equal(shared.formatFileSize(1024), '1.00 KB');
    assert.equal(shared.formatFileSize(1048576), '1.00 MB');
    assert.equal(shared.formatFileSize(0), null);
  });

  it('flags restricted urls', () => {
    assert.equal(shared.isRestrictedUrl('chrome://settings'), true);
    assert.equal(shared.isRestrictedUrl('about:blank'), true);
    assert.equal(shared.isRestrictedUrl('https://example.com/a.png'), false);
  });

  it('detects local file urls', () => {
    assert.equal(shared.isLocalFileUrl('file:///C:/Users/photo.jpg'), true);
    assert.equal(shared.isLocalFileUrl('https://example.com/a.png'), false);
  });

  it('decides downloadable urls', () => {
    assert.equal(shared.canDownloadUrl('https://e.com/a.png', 'image'), true);
    assert.equal(shared.canDownloadUrl('file:///c/a.png', 'image'), false);
    assert.equal(shared.canDownloadUrl('https://e.com/', 'webpage'), false);
  });

  it('builds code snippets and escapes attributes', () => {
    const info = { url: 'https://e.com/a.png', width: 1920, height: 1080, fileName: 'a.png' };
    assert.equal(
      shared.buildImgTag(info),
      '<img src="https://e.com/a.png" width="1920" height="1080" alt="a.png">'
    );
    assert.equal(shared.buildMarkdownImage(info), '![a.png](https://e.com/a.png)');
    assert.equal(shared.buildCssBackground(info), 'background-image: url("https://e.com/a.png");');
    assert.equal(shared.buildImgTag({}), null);
    assert.match(shared.buildImgTag({ url: 'x"><script>' }), /&quot;&gt;&lt;script&gt;/);
  });
});

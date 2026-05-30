/** Shared helpers for content script and popup (no imports; load before other scripts). */
const FileInfoShared = {
  gcd(a, b) {
    const x = Math.abs(Math.floor(a));
    const y = Math.abs(Math.floor(b));
    return y === 0 ? x : this.gcd(y, x % y);
  },

  calculateAspectRatio(width, height) {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return 'Unknown';
    const divisor = this.gcd(w, h);
    return `${w / divisor}:${h / divisor}`;
  },

  formatDimensions(width, height) {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return null;
    return `${w} × ${h}px`;
  },

  formatDimensionsCompact(width, height) {
    const w = Number(width);
    const h = Number(height);
    if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return null;
    return `${w}x${h}`;
  },

  formatFileSize(bytes) {
    const n = Number(bytes);
    if (!n || Number.isNaN(n)) return null;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
    return `${(n / 1024 ** index).toFixed(2)} ${units[index]}`;
  },

  isRestrictedUrl(url) {
    if (!url) return true;
    const blocked = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'devtools:', 'view-source:'];
    return blocked.some((p) => url.startsWith(p));
  },

  canDownloadUrl(url, type) {
    if (!url) return false;
    if (url.startsWith('file://')) return false;
    if (type === 'webpage') return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  },

  suggestFilename(fileInfo) {
    if (fileInfo?.fileName && fileInfo.fileName !== 'Unknown') return fileInfo.fileName;
    try {
      const name = new URL(fileInfo.url).pathname.split('/').pop();
      if (name && name.includes('.')) return decodeURIComponent(name);
    } catch {
      /* ignore */
    }
    const ext = fileInfo?.fileExtension && fileInfo.fileExtension !== 'unknown' ? fileInfo.fileExtension : 'bin';
    return `download-${fileInfo?.type || 'file'}.${ext}`;
  }
};

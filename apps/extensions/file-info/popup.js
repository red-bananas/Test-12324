class PopupManager {
  constructor() {
    this.currentFileInfo = null;
    this.elements = new Map();
    this.init();
  }

  static ICONS = {
    image: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    video: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>',
    audio: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    pdf: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    webpage: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    document: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    archive: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
  };

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadFileInfo();
  }

  cacheElements() {
    document.querySelectorAll('[id]').forEach((el) => {
      if (el.id) this.elements.set(el.id, el);
    });
  }

  $(id) {
    return this.elements.get(id);
  }

  bindEvents() {
    this.$('refreshBtn')?.addEventListener('click', () => this.handleRefresh());
    this.$('retryBtn')?.addEventListener('click', () => this.loadFileInfo());
    this.$('enableFileAccessBtn')?.addEventListener('click', () => this.handleEnableFileAccess());
    this.$('copyBtn')?.addEventListener('click', () => this.copyAll());
    this.$('copyDimsBtn')?.addEventListener('click', () => this.copyDimensions());
    this.$('downloadBtn')?.addEventListener('click', () => this.downloadFile());
    this.$('exportBtn')?.addEventListener('click', () => this.exportInfo());
    this.$('copyUrlBtn')?.addEventListener('click', () => this.copySnippet('url'));
    this.$('copyImgBtn')?.addEventListener('click', () => this.copySnippet('img'));
    this.$('copyMdBtn')?.addEventListener('click', () => this.copySnippet('md'));
    this.$('copyCssBtn')?.addEventListener('click', () => this.copySnippet('css'));

    document.querySelectorAll('.info-row.copyable').forEach((row) => {
      const copy = () => {
        const key = row.dataset.copy;
        if (key) this.copyField(key);
      };
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      const label = row.querySelector('.label')?.textContent?.trim();
      if (label) row.setAttribute('aria-label', `Copy ${label}`);
      row.addEventListener('click', copy);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          copy();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        this.handleRefresh();
      }
      if (e.ctrlKey && e.key === 'c' && !window.getSelection()?.toString()) {
        e.preventDefault();
        this.copyAll();
      }
    });
  }

  handleRefresh() {
    this.$('refreshBtn')?.classList.add('spinning');
    setTimeout(() => this.$('refreshBtn')?.classList.remove('spinning'), 700);
    this.loadFileInfo();
  }

  async loadFileInfo() {
    this.showState('loading');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        this.showEmpty('No active tab', 'Switch to a tab with a file or page.');
        return;
      }

      if (FileInfoShared.isRestrictedUrl(tab.url)) {
        this.showEmpty(
          'This page cannot be analyzed',
          'Browser internal pages (chrome://, extensions, etc.) are not supported. Open an image, PDF, or file URL.'
        );
        return;
      }

      if (tab.url.startsWith('data:image/') && tab.url.includes('base64,')) {
        this.currentFileInfo = await this.analyzeBase64Image(tab.url);
        this.displayFileInfo(this.currentFileInfo);
        this.maybeLoadExif(this.currentFileInfo);
        return;
      }

      if (FileInfoShared.isLocalFileUrl(tab.url)) {
        const ready = await this.ensureLocalFileAccess();
        if (!ready) return;
      }

      const fileInfo = await this.detectViaInjection(tab);
      if (!fileInfo) {
        if (FileInfoShared.isLocalFileUrl(tab.url)) {
          this.showFileAccessNeeded(
            'Could not read this local file. Enable "Allow access to file URLs" for File Info, then try again.'
          );
          return;
        }
        this.showError(
          'Unable to analyze',
          'Open an image, PDF, video, or file URL — not a browser settings page.'
        );
        return;
      }

      this.currentFileInfo = fileInfo;
      this.displayFileInfo(fileInfo);
      this.maybeLoadExif(fileInfo);
    } catch (error) {
      this.logError('loadFileInfo', error);
      this.showError('Unable to analyze', 'Reload the page and try again.');
    }
  }

  async hasLocalFileAccess() {
    try {
      return await chrome.permissions.contains({ origins: [FileInfoShared.FILE_URL_ORIGIN] });
    } catch {
      return false;
    }
  }

  async requestLocalFileAccess() {
    try {
      return await chrome.permissions.request({ origins: [FileInfoShared.FILE_URL_ORIGIN] });
    } catch {
      return false;
    }
  }

  async ensureLocalFileAccess() {
    if (await this.hasLocalFileAccess()) return true;

    const granted = await this.requestLocalFileAccess();
    if (granted) return true;

    this.showFileAccessNeeded(
      'File Info needs permission to read local files opened in Chrome. Click below, or open Extensions and turn on "Allow access to file URLs".'
    );
    return false;
  }

  async handleEnableFileAccess() {
    const granted = await this.requestLocalFileAccess();
    if (granted) {
      this.setFileAccessPromptVisible(false);
      this.loadFileInfo();
      return;
    }
    this.showFileAccessNeeded(
      'Permission was not granted. Open chrome://extensions, find File Info, and enable "Allow access to file URLs".'
    );
  }

  showFileAccessNeeded(hint) {
    this.showError('Local file access needed', hint, { fileAccess: true });
  }

  setFileAccessPromptVisible(visible) {
    this.$('enableFileAccessBtn')?.classList.toggle('hidden', !visible);
  }

  async detectViaInjection(tab) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['shared.js', 'content.js']
      });
    } catch {
      return null;
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getFileInfo' });
        if (response?.fileInfo) return response.fileInfo;
      } catch {
        /* content script not ready yet — retry */
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    return null;
  }

  async analyzeBase64Image(url) {
    const [header, data] = url.split('base64,');
    const mimeType = header.split(':')[1].split(';')[0];
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }[mimeType] || 'png';
    const dims = await this.loadImageSize(url);
    const bytes = this.base64ByteSize(data);

    return {
      type: 'image',
      url,
      isLocal: false,
      isBase64: true,
      fileName: `base64-image.${extension}`,
      fileExtension: extension,
      fileSize: FileInfoShared.formatFileSize(bytes),
      mimeType,
      width: dims.width,
      height: dims.height,
      aspectRatio: FileInfoShared.calculateAspectRatio(dims.width, dims.height)
    };
  }

  loadImageSize(url) {
    return new Promise((resolve) => {
      const img = new Image();
      const t = setTimeout(() => resolve({ width: 'Unknown', height: 'Unknown' }), 5000);
      img.onload = () => {
        clearTimeout(t);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        clearTimeout(t);
        resolve({ width: 'Unknown', height: 'Unknown' });
      };
      img.src = url;
    });
  }

  base64ByteSize(data) {
    const padding = (data.match(/=/g) || []).length;
    return Math.floor((data.length * 3) / 4) - padding;
  }

  displayFileInfo(fileInfo) {
    this.currentFileInfo = fileInfo;
    this.showState('content');

    const container = this.$('container');
    container.className = `container type-${fileInfo.type || 'file'}`;
    if (fileInfo.isLocal) container.classList.add('local-file');
    if (fileInfo.isBase64) container.classList.add('base64-file');

    this.renderHero(fileInfo);
    this.renderDetails(fileInfo);
    this.updateActions(fileInfo);
    this.renderCodeSnippets(fileInfo);
    this.hideExif();
  }

  renderCodeSnippets(fileInfo) {
    const group = this.$('codeSnippets');
    if (!group) return;
    const hasUrl = !!fileInfo.url;
    const showUrl = hasUrl && !fileInfo.url.startsWith('data:');
    const isImage = fileInfo.type === 'image' && hasUrl;
    group.classList.toggle('hidden', !(isImage || showUrl));
    this.$('copyUrlBtn')?.classList.toggle('hidden', !showUrl);
    ['copyImgBtn', 'copyMdBtn', 'copyCssBtn'].forEach((id) => {
      this.$(id)?.classList.toggle('hidden', !isImage);
    });
  }

  async copySnippet(kind) {
    const info = this.currentFileInfo;
    if (!info) return;
    const builders = {
      url: () => info.url,
      img: () => FileInfoShared.buildImgTag(info),
      md: () => FileInfoShared.buildMarkdownImage(info),
      css: () => FileInfoShared.buildCssBackground(info)
    };
    const text = builders[kind]?.();
    if (!text) return;
    await this.writeClipboard(text);
    this.toast(kind === 'url' ? 'Copied URL' : 'Copied snippet');
  }

  async maybeLoadExif(info) {
    this.hideExif();
    if (!info?.url || info.type !== 'image') return;

    const isJpeg = /jpe?g/i.test(info.mimeType || '')
      || /jpe?g|jfif/i.test(info.fileExtension || '')
      || /\.jpe?g(\?|$)/i.test(info.url);
    if (!isJpeg) return;

    try {
      const buffer = await this.fetchBytes(info.url);
      if (!buffer) return;
      const exif = FileInfoExif.parse(buffer);
      if (exif) this.renderExif(exif);
    } catch {
      /* best effort — CORS or network blocked */
    }
  }

  async fetchBytes(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    const len = Number(res.headers.get('content-length'));
    if (len && len > 25 * 1024 * 1024) return null;
    return res.arrayBuffer();
  }

  renderExif(exif) {
    const section = this.$('exifSection');
    if (!section) return;

    const camera = [exif.make, exif.model].filter(Boolean).join(' ');
    this.setRow('exifCameraRow', 'exifCamera', camera || null);
    this.setRow('exifDateRow', 'exifDate', exif.dateTime || null);

    const gpsRow = this.$('exifGpsRow');
    const gpsWarn = this.$('exifGpsWarn');
    if (exif.gps && Number.isFinite(exif.gps.lat) && Number.isFinite(exif.gps.lng)) {
      const coords = `${exif.gps.lat.toFixed(6)}, ${exif.gps.lng.toFixed(6)}`;
      this.setRow('exifGpsRow', 'exifGps', coords);
      gpsWarn?.classList.remove('hidden');
    } else {
      gpsRow?.classList.add('hidden');
      gpsWarn?.classList.add('hidden');
    }

    const hasAny = camera || exif.dateTime || exif.gps;
    section.classList.toggle('hidden', !hasAny);
  }

  hideExif() {
    this.$('exifSection')?.classList.add('hidden');
    this.$('exifGpsWarn')?.classList.add('hidden');
  }

  renderHero(fileInfo) {
    const chipIcon = this.$('fileTypeChipIcon');
    const chipText = this.$('fileTypeText');
    const primary = this.$('heroPrimary');
    const secondary = this.$('heroSecondary');
    const thumbWrap = this.$('thumbWrap');
    const thumb = this.$('heroThumb');

    chipIcon.innerHTML = PopupManager.ICONS[fileInfo.type] || PopupManager.ICONS.file;
    chipText.textContent = (fileInfo.type || 'file').toUpperCase();

    if (fileInfo.type === 'webpage') {
      primary.textContent = fileInfo.title || fileInfo.domain || 'Web page';
      secondary.textContent = [fileInfo.domain, `${fileInfo.images ?? 0} images · ${fileInfo.links ?? 0} links`]
        .filter(Boolean)
        .join(' · ');
      thumbWrap.classList.add('hidden');
      return;
    }

    const dims = FileInfoShared.formatDimensions(fileInfo.width, fileInfo.height);
    if (dims) {
      primary.textContent = dims;
      secondary.textContent = [
        fileInfo.aspectRatio && fileInfo.aspectRatio !== 'Unknown' ? fileInfo.aspectRatio : null,
        fileInfo.fileSize,
        fileInfo.fileName
      ].filter(Boolean).join(' · ');
    } else {
      primary.textContent = fileInfo.fileName || fileInfo.title || 'File';
      secondary.textContent = [fileInfo.fileSize, fileInfo.mimeType].filter((v) => this.isValid(v)).join(' · ');
    }

    if (fileInfo.type === 'image' && fileInfo.url && !fileInfo.isBase64) {
      thumb.src = fileInfo.url;
      thumb.alt = fileInfo.fileName || 'Preview';
      thumbWrap.classList.remove('hidden');
    } else if (fileInfo.isBase64 && fileInfo.url?.startsWith('data:image/')) {
      thumb.src = fileInfo.url;
      thumbWrap.classList.remove('hidden');
    } else {
      thumbWrap.classList.add('hidden');
    }
  }

  renderDetails(fileInfo) {
    const isWebpage = fileInfo.type === 'webpage';

    this.setRow('fileNameRow', 'fileName', fileInfo.fileName || this.nameFromUrl(fileInfo.url));
    this.setRow('pageTitleRow', 'pageTitle', isWebpage ? fileInfo.title : null);
    this.setRow('domainRow', 'domain', isWebpage ? fileInfo.domain : null);
    this.setRow('imageCountRow', 'imageCount', isWebpage && fileInfo.images != null ? String(fileInfo.images) : null);
    this.setRow('linkCountRow', 'linkCount', isWebpage && fileInfo.links != null ? String(fileInfo.links) : null);

    const sizeEl = this.$('fileSize');
    const sizeVal = fileInfo.fileSize;
    if (this.isValid(sizeVal) && !isWebpage) {
      this.$('fileSizeRow')?.classList.remove('hidden');
      sizeEl.textContent = sizeVal;
      sizeEl.title = fileInfo.sizeNote || sizeVal;
    } else {
      this.$('fileSizeRow')?.classList.add('hidden');
    }

    const dims = FileInfoShared.formatDimensions(fileInfo.width, fileInfo.height);
    this.setRow('dimensionsRow', 'dimensions', !isWebpage ? dims : null);
    this.setRow('aspectRatioRow', 'aspectRatio', !isWebpage ? fileInfo.aspectRatio : null);
    this.setRow('durationRow', 'duration', fileInfo.duration);
    this.setRow('mimeTypeRow', 'mimeType', !isWebpage ? fileInfo.mimeType : null);

    const urlLabel = this.$('urlLabel');
    if (urlLabel) urlLabel.textContent = fileInfo.isLocal ? 'Path' : 'URL';

    const urlDisplay = this.formatUrlDisplay(fileInfo.url);
    if (urlDisplay) {
      this.$('urlRow')?.classList.remove('hidden');
      const urlEl = this.$('fileUrl');
      urlEl.textContent = urlDisplay;
      urlEl.title = fileInfo.url;
    } else {
      this.$('urlRow')?.classList.add('hidden');
    }
  }

  setRow(rowId, valueId, value) {
    const row = this.$(rowId);
    const el = this.$(valueId);
    if (!row || !el) return;

    if (this.isValid(value)) {
      row.classList.remove('hidden');
      el.textContent = value;
      el.title = typeof value === 'string' ? value : '';
    } else {
      row.classList.add('hidden');
    }
  }

  updateActions(fileInfo) {
    const hasDims = FileInfoShared.formatDimensionsCompact(fileInfo.width, fileInfo.height);
    const copyDims = this.$('copyDimsBtn');
    if (copyDims) {
      copyDims.disabled = !hasDims;
      copyDims.textContent = hasDims ? 'Copy dimensions' : 'No dimensions';
    }

    const canDownload = FileInfoShared.canDownloadUrl(fileInfo.url, fileInfo.type);
    const downloadBtn = this.$('downloadBtn');
    if (downloadBtn) {
      downloadBtn.disabled = !canDownload;
      downloadBtn.title = canDownload
        ? 'Download this file'
        : fileInfo.isLocal
          ? 'Use Ctrl+S for local files'
          : 'Not available for this page type';
    }
  }

  async copyDimensions() {
    const text = FileInfoShared.formatDimensionsCompact(
      this.currentFileInfo?.width,
      this.currentFileInfo?.height
    );
    if (!text) return;
    await this.writeClipboard(text);
    this.toast(`Copied ${text}`);
  }

  async copyAll() {
    if (!this.currentFileInfo) return;
    await this.writeClipboard(this.formatClipboard(this.currentFileInfo));
    this.toast('Copied all info');
  }

  async copyField(key) {
    const info = this.currentFileInfo;
    if (!info) return;

    const map = {
      fileName: info.fileName || this.nameFromUrl(info.url),
      pageTitle: info.title,
      domain: info.domain,
      images: info.images != null ? String(info.images) : null,
      links: info.links != null ? String(info.links) : null,
      fileSize: info.fileSize,
      dimensions: FileInfoShared.formatDimensions(info.width, info.height),
      aspectRatio: info.aspectRatio,
      duration: info.duration,
      mimeType: info.mimeType,
      url: info.url
    };

    const value = map[key];
    if (!this.isValid(value)) return;
    await this.writeClipboard(String(value));
    this.toast('Copied');
  }

  async downloadFile() {
    const info = this.currentFileInfo;
    if (!info?.url || !FileInfoShared.canDownloadUrl(info.url, info.type)) return;

    const response = await chrome.runtime.sendMessage({
      action: 'downloadFile',
      url: info.url,
      fileName: FileInfoShared.suggestFilename(info)
    });

    if (response?.ok) {
      this.toast('Download started');
    } else {
      this.toast(response?.error || 'Download failed', true);
    }
  }

  async exportInfo() {
    const info = this.currentFileInfo;
    if (!info) return;

    const base = (info.fileName || 'file-info').replace(/\.[^.]+$/, '');
    const response = await chrome.runtime.sendMessage({
      action: 'exportInfo',
      text: this.formatClipboard(info),
      fileName: `${base}-info.txt`
    });

    if (response?.ok) {
      this.toast('Details saved');
    } else {
      this.toast(response?.error || 'Export failed', true);
    }
  }

  formatClipboard(fileInfo) {
    const lines = ['File Information', '================', ''];

    const fields = [
      ['Name', fileInfo.fileName || this.nameFromUrl(fileInfo.url)],
      ['Type', fileInfo.type?.toUpperCase()],
      ['Title', fileInfo.title],
      ['Domain', fileInfo.domain],
      ['Images on page', fileInfo.images != null ? String(fileInfo.images) : null],
      ['Links on page', fileInfo.links != null ? String(fileInfo.links) : null],
      ['File size', fileInfo.fileSize],
      ['Dimensions', FileInfoShared.formatDimensions(fileInfo.width, fileInfo.height)],
      ['Dimensions (compact)', FileInfoShared.formatDimensionsCompact(fileInfo.width, fileInfo.height)],
      ['Aspect ratio', fileInfo.aspectRatio],
      ['Duration', fileInfo.duration],
      ['MIME', fileInfo.mimeType],
      [fileInfo.isLocal ? 'Path' : 'URL', fileInfo.url]
    ];

    fields.forEach(([label, value]) => {
      if (this.isValid(value)) lines.push(`${label}: ${value}`);
    });

    if (fileInfo.sizeNote) lines.push('', `Note: ${fileInfo.sizeNote}`);
    if (fileInfo.isLocal) lines.push('', 'Source: Local file');
    if (fileInfo.isBase64) lines.push('', 'Source: Base64 image');

    return lines.join('\n');
  }

  formatUrlDisplay(url) {
    if (!url) return null;
    if (url.startsWith('data:')) {
      const mime = url.split(';')[0].split(':')[1] || 'data';
      return `Base64 ${mime.split('/').pop()?.toUpperCase() || 'DATA'}`;
    }
    if (url.startsWith('file://')) {
      return decodeURIComponent(url.replace(/^file:\/\//, ''));
    }
    try {
      const u = new URL(url);
      if (url.length > 48) return `${u.hostname}…${u.pathname.slice(-18)}`;
    } catch {
      /* ignore */
    }
    return url.length > 48 ? `${url.slice(0, 45)}…` : url;
  }

  nameFromUrl(url) {
    try {
      return new URL(url).pathname.split('/').pop() || null;
    } catch {
      return null;
    }
  }

  isValid(value) {
    return value != null && value !== '' && value !== 'Unknown' && value !== 'Unavailable';
  }

  async writeClipboard(text) {
    await navigator.clipboard.writeText(text);
  }

  toast(message, isError = false) {
    document.querySelector('.copy-toast')?.remove();
    const el = document.createElement('div');
    el.className = 'copy-toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.textContent = message;
    if (isError) el.style.background = 'var(--error)';
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 200);
    }, 2000);
  }

  showState(state) {
    const map = {
      loading: ['loading'],
      content: ['content'],
      error: ['error'],
      empty: ['empty']
    };

    if (state !== 'error') this.setFileAccessPromptVisible(false);

    ['loading', 'content', 'error', 'empty'].forEach((id) => {
      const el = this.$(id);
      if (!el) return;
      if (map[state]?.includes(id)) {
        el.classList.remove('hidden');
        if (id === 'loading') el.style.display = 'flex';
        else el.style.display = '';
      } else {
        el.classList.add('hidden');
      }
    });
  }

  showEmpty(title, hint) {
    this.showState('empty');
    if (this.$('emptyTitle')) this.$('emptyTitle').textContent = title;
    if (this.$('emptyHint')) this.$('emptyHint').textContent = hint;
  }

  showError(title, hint, options = {}) {
    this.showState('error');
    if (this.$('errorTitle')) this.$('errorTitle').textContent = title;
    if (this.$('errorHint')) this.$('errorHint').textContent = hint;
    this.setFileAccessPromptVisible(Boolean(options.fileAccess));
  }

  logError(msg, err) {
    console.error(`PopupManager: ${msg}`, err);
  }
}

if (typeof window !== 'undefined') window.PopupManager = PopupManager;

document.addEventListener('DOMContentLoaded', () => new PopupManager());

class FileInfoDetector {
  constructor() {
    this.fileInfo = null;
    this.elementCache = new Map();
    this.ready = this.runDetection();
    this.setupMessageListener();
  }

  static CONSTANTS = {
    FILE_TYPES: {
      IMAGE: 'image',
      VIDEO: 'video',
      AUDIO: 'audio',
      PDF: 'pdf',
      DOCUMENT: 'document',
      ARCHIVE: 'archive',
      WEBPAGE: 'webpage',
      FILE: 'file'
    },

    EXTENSIONS: {
      IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif', '.avif', '.jfif'],
      VIDEO: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v', '.3gp'],
      AUDIO: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'],
      DOCUMENT: ['.doc', '.docx', '.txt', '.rtf', '.odt'],
      ARCHIVE: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2']
    },

    MIME_TYPES: {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', tiff: 'image/tiff',
      mp4: 'video/mp4', webm: 'video/webm',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
      pdf: 'application/pdf', txt: 'text/plain',
      zip: 'application/zip', rar: 'application/x-rar-compressed'
    },

    MIME_TO_EXT: {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
      'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/bmp': 'bmp',
      'image/tiff': 'tiff', 'image/avif': 'avif'
    }
  };

  async runDetection() {
    try {
      const context = this.getPageContext();
      const type = this.resolveFileType(context);
      await this.processFileType(type, context);
    } catch (error) {
      this.logError('Detection failed', error);
    }
  }

  resolveFileType(context) {
    const { FILE_TYPES, EXTENSIONS } = FileInfoDetector.CONSTANTS;

    const detectors = [
      { test: () => context.isBase64Image, type: FILE_TYPES.IMAGE },
      { test: () => this.hasExtension(context.pathname, EXTENSIONS.IMAGE), type: FILE_TYPES.IMAGE },
      { test: () => this.hasExtension(context.pathname, EXTENSIONS.AUDIO) || this.hasElement('audio'), type: FILE_TYPES.AUDIO },
      { test: () => this.hasExtension(context.pathname, EXTENSIONS.VIDEO) || this.hasElement('video'), type: FILE_TYPES.VIDEO },
      { test: () => context.pathname.endsWith('.pdf') || this.isPdfPage(), type: FILE_TYPES.PDF },
      { test: () => this.hasExtension(context.pathname, EXTENSIONS.DOCUMENT), type: FILE_TYPES.DOCUMENT },
      { test: () => this.hasExtension(context.pathname, EXTENSIONS.ARCHIVE), type: FILE_TYPES.ARCHIVE },
      { test: () => context.isLocal, type: FILE_TYPES.FILE },
      { test: () => true, type: FILE_TYPES.WEBPAGE }
    ];

    return detectors.find((d) => d.test())?.type ?? FILE_TYPES.WEBPAGE;
  }

  getPageContext() {
    const url = window.location.href;
    const pathname = window.location.pathname.toLowerCase();

    return {
      url,
      pathname,
      isLocal: url.startsWith('file://'),
      isBase64Image: url.startsWith('data:image/') && url.includes('base64,'),
      domain: window.location.hostname,
      protocol: window.location.protocol
    };
  }

  hasExtension(pathname, extensions) {
    return extensions.some((ext) => pathname.endsWith(ext));
  }

  hasElement(selector) {
    return this.getElement(selector) !== null;
  }

  getElement(selector) {
    if (!this.elementCache.has(selector)) {
      this.elementCache.set(selector, document.querySelector(selector));
    }
    return this.elementCache.get(selector);
  }

  async processFileType(type, context) {
    const baseInfo = this.createBaseInfo(type, context);

    switch (type) {
      case FileInfoDetector.CONSTANTS.FILE_TYPES.IMAGE:
        await this.processImage(baseInfo, context);
        break;
      case FileInfoDetector.CONSTANTS.FILE_TYPES.VIDEO:
        await this.processVideo(baseInfo, context);
        break;
      case FileInfoDetector.CONSTANTS.FILE_TYPES.AUDIO:
        await this.processAudio(baseInfo, context);
        break;
      case FileInfoDetector.CONSTANTS.FILE_TYPES.PDF:
        await this.processPdf(baseInfo, context);
        break;
      case FileInfoDetector.CONSTANTS.FILE_TYPES.DOCUMENT:
      case FileInfoDetector.CONSTANTS.FILE_TYPES.ARCHIVE:
      case FileInfoDetector.CONSTANTS.FILE_TYPES.FILE:
        await this.processGenericFile(baseInfo, context);
        break;
      case FileInfoDetector.CONSTANTS.FILE_TYPES.WEBPAGE:
        this.processWebpage(baseInfo, context);
        break;
    }
  }

  createBaseInfo(type, context) {
    return {
      type,
      url: context.url,
      timestamp: new Date().toISOString(),
      isLocal: context.isLocal,
      isBase64: context.isBase64Image
    };
  }

  async processImage(baseInfo, context) {
    const [dimensions, fileData] = await Promise.all([
      this.getImageDimensions(context),
      this.getFileData(context)
    ]);

    this.fileInfo = {
      ...baseInfo,
      ...fileData,
      ...dimensions,
      aspectRatio: FileInfoShared.calculateAspectRatio(dimensions.width, dimensions.height)
    };
  }

  async processVideo(baseInfo, context) {
    const video = this.getElement('video');
    const fileData = await this.getFileData(context);
    const width = video?.videoWidth;
    const height = video?.videoHeight;

    this.fileInfo = {
      ...baseInfo,
      ...fileData,
      width: width || 'Unknown',
      height: height || 'Unknown',
      duration: this.formatDuration(video?.duration),
      aspectRatio: FileInfoShared.calculateAspectRatio(width, height)
    };
  }

  async processAudio(baseInfo, context) {
    const audio = this.getElement('audio');
    const fileData = await this.getFileData(context);

    this.fileInfo = {
      ...baseInfo,
      ...fileData,
      duration: this.formatDuration(audio?.duration)
    };
  }

  async processPdf(baseInfo, context) {
    const fileData = await this.getFileData(context);

    this.fileInfo = {
      ...baseInfo,
      ...fileData,
      title: document.title
    };
  }

  processWebpage(baseInfo, context) {
    this.fileInfo = {
      ...baseInfo,
      title: document.title,
      domain: context.domain || '(local)',
      protocol: context.protocol,
      images: document.images.length,
      links: document.links.length
    };
  }

  async processGenericFile(baseInfo, context) {
    const fileData = await this.getFileData(context);
    this.fileInfo = { ...baseInfo, ...fileData };
  }

  async getImageDimensions(context) {
    const img = this.getElement('img') || this.getElement('body > img');

    if (img) {
      await this.waitForLoad(img);
      return {
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      };
    }

    if (context.isBase64Image || this.hasExtension(context.pathname, FileInfoDetector.CONSTANTS.EXTENSIONS.IMAGE)) {
      return this.getImageDimensionsFromUrl(context.url);
    }

    return { width: 'Unknown', height: 'Unknown' };
  }

  getImageDimensionsFromUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => resolve({ width: 'Unknown', height: 'Unknown' }), 5000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve({ width: 'Unknown', height: 'Unknown' });
      };

      img.src = url;
    });
  }

  async getFileData(context) {
    if (context.isBase64Image) return this.parseBase64Data(context.url);
    if (context.isLocal) return this.getLocalFileData(context);
    return this.getRemoteFileData(context.url);
  }

  parseBase64Data(url) {
    try {
      const [header, data] = url.split('base64,');
      const mimeType = header.split(':')[1].split(';')[0];
      const extension = FileInfoDetector.CONSTANTS.MIME_TO_EXT[mimeType] || 'unknown';

      return {
        fileName: `base64-image.${extension}`,
        fileExtension: extension,
        fileSize: FileInfoShared.formatFileSize(this.calculateBase64Size(data)),
        mimeType
      };
    } catch (error) {
      this.logError('Base64 parsing failed', error);
      return this.getDefaultFileData();
    }
  }

  getLocalFileData(context) {
    const fileName = this.extractFileName(context.url);
    const extension = this.getFileExtension(context.url);

    return {
      fileName,
      fileExtension: extension,
      fileSize: this.getLocalFileSize(),
      mimeType: FileInfoDetector.CONSTANTS.MIME_TYPES[extension] || 'application/octet-stream'
    };
  }

  async getRemoteFileData(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const extension = this.getFileExtension(url);
      const length = response.headers.get('content-length');
      const size = FileInfoShared.formatFileSize(length);

      return {
        fileName: this.extractFileName(url),
        fileExtension: extension,
        fileSize: size || 'Unavailable',
        sizeNote: size ? null : 'Size not provided by server',
        mimeType: response.headers.get('content-type')?.split(';')[0]
          || FileInfoDetector.CONSTANTS.MIME_TYPES[extension]
          || 'Unknown'
      };
    } catch (error) {
      this.logError('Remote file data fetch failed', error);
      const extension = this.getFileExtension(url);
      return {
        fileName: this.extractFileName(url) || 'Unknown',
        fileExtension: extension,
        fileSize: 'Unavailable',
        sizeNote: 'Blocked by site (CORS). Use Download to save the file.',
        mimeType: FileInfoDetector.CONSTANTS.MIME_TYPES[extension] || 'Unknown'
      };
    }
  }

  getDefaultFileData(url = '') {
    const extension = this.getFileExtension(url);
    return {
      fileName: this.extractFileName(url) || 'Unknown',
      fileExtension: extension,
      fileSize: 'Unavailable',
      mimeType: FileInfoDetector.CONSTANTS.MIME_TYPES[extension] || 'Unknown'
    };
  }

  extractFileName(url) {
    if (url.startsWith('file://')) {
      return decodeURIComponent(url.replace('file:///', '')).split(/[\\/]/).pop();
    }

    try {
      return new URL(url).pathname.split('/').pop() || null;
    } catch {
      return null;
    }
  }

  getFileExtension(url) {
    try {
      return new URL(url).pathname.split('.').pop()?.toLowerCase() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  getLocalFileSize() {
    try {
      const input = this.getElement('input[type="file"]');
      if (input?.files?.[0]) {
        return FileInfoShared.formatFileSize(input.files[0].size);
      }
      return 'Unavailable';
    } catch {
      return 'Unavailable';
    }
  }

  calculateBase64Size(base64String) {
    if (!base64String) return 0;
    const padding = (base64String.match(/=/g) || []).length;
    return Math.floor((base64String.length * 3) / 4) - padding;
  }

  formatDuration(seconds) {
    if (!seconds || Number.isNaN(seconds)) return null;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  }

  async waitForLoad(element) {
    if (element.complete) return;

    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, 3000);
      element.onload = element.onerror = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }

  isPdfPage() {
    return !!(
      this.getElement('embed[type="application/pdf"]')
      || this.getElement('object[type="application/pdf"]')
      || document.title.toLowerCase().includes('pdf')
      || window.location.href.includes('pdf')
    );
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.action === 'getFileInfo') {
        this.ready
          .then(() => sendResponse({ fileInfo: this.fileInfo }))
          .catch(() => sendResponse({ fileInfo: null }));
        return true;
      }

      if (request.action === 'getImageDimensions' && request.srcUrl) {
        this.getImageDimensionsFromUrl(request.srcUrl)
          .then((dims) => {
            const text = FileInfoShared.formatDimensionsCompact(dims.width, dims.height)
              || `${dims.width}x${dims.height}`;
            sendResponse({ text, width: dims.width, height: dims.height });
          })
          .catch(() => sendResponse(null));
        return true;
      }

      return false;
    });
  }

  logError(message, error) {
    console.error(`FileInfoDetector: ${message}`, error);
  }
}

new FileInfoDetector();

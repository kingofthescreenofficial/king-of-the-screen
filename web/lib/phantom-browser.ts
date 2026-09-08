export const PHANTOM_DOWNLOAD_URL = "https://phantom.app/download";

export function isMobileUserAgent(userAgent: string): boolean {
  return /Android|iPhone|iPad|iPod/i.test(userAgent);
}

export function buildPhantomBrowseUrl(targetUrl: string, refUrl: string): string {
  return `https://phantom.app/ul/browse/${encodeURIComponent(targetUrl)}?ref=${encodeURIComponent(refUrl)}`;
}

export function getAssetUrl(url) {
  if (!url) return '';

  if (url.startsWith('/uploads/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname;
    }
    return url;
  } catch {
    return url;
  }
}

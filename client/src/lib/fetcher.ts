import type { FetchedAppData, AppSource } from './types';

/**
 * Detect the source from a URL
 */
export function detectSource(url: string): AppSource | null {
  const lower = url.toLowerCase().trim();
  if (lower.includes('github.com')) return 'github';
  if (lower.includes('play.google.com')) return 'playstore';
  if (lower.includes('f-droid.org')) return 'fdroid';
  return null;
}

/**
 * Extract GitHub owner/repo from URL
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }
  return null;
}

/**
 * Extract Google Play package name from URL
 */
function parsePlayStoreUrl(url: string): string | null {
  const match = url.match(/[?&]id=([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

/**
 * Extract F-Droid package name from URL
 */
function parseFDroidUrl(url: string): string | null {
  const match = url.match(/f-droid\.org(?:\/[a-z]{2})?\/packages\/([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch HTML through multiple CORS proxies with fallback
 */
async function fetchWithProxy(targetUrl: string, timeoutMs = 10000): Promise<string | null> {
  const proxies = [
    (u: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];

  for (const makeUrl of proxies) {
    try {
      const proxyUrl = makeUrl(targetUrl);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) {
        const html = await res.text();
        // Verify we got actual content (not an error page)
        if (html.length > 1000) {
          return html;
        }
      }
    } catch {
      // Try next proxy
    }
  }
  return null;
}

/**
 * Fetch GitHub repo data
 */
async function fetchGitHubData(url: string): Promise<FetchedAppData> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) throw new Error('رابط GitHub غير صالح');

  const { owner, repo } = parsed;

  // Fetch repo info
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoRes.ok) throw new Error('لم يتم العثور على المستودع');
  const repoData = await repoRes.json();

  // Try to fetch latest release
  let version = '';
  let releasesUrl = `https://github.com/${owner}/${repo}/releases`;
  try {
    const relRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
    if (relRes.ok) {
      const relData = await relRes.json();
      version = relData.tag_name || '';
      releasesUrl = relData.html_url || releasesUrl;
    }
  } catch {
    // No releases, that's ok
  }

  // Use owner avatar as icon fallback
  const iconUrl = repoData.owner?.avatar_url || '';

  return {
    name: repoData.name || repo,
    description: repoData.description || '',
    iconUrl,
    version,
    downloadPageUrl: releasesUrl,
    source: 'github',
  };
}

/**
 * Parse JSON-LD structured data from Google Play HTML
 */
function parseJsonLd(html: string): {
  name?: string;
  description?: string;
  image?: string;
  version?: string;
} {
  try {
    const match = html.match(/application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (match) {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'SoftwareApplication') {
        return {
          name: data.name,
          description: data.description,
          image: data.image,
          version: data.softwareVersion,
        };
      }
    }
  } catch {
    // JSON parse failed
  }
  return {};
}

/**
 * Parse OpenGraph meta tags from HTML
 */
function parseOgMeta(html: string): {
  title?: string;
  description?: string;
  image?: string;
} {
  const result: { title?: string; description?: string; image?: string } = {};

  const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
  if (titleMatch) result.title = titleMatch[1];

  const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) ||
                    html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
  if (descMatch) result.description = descMatch[1];

  const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (imgMatch) result.image = imgMatch[1];

  return result;
}

/**
 * Try to extract version from Google Play HTML data
 */
function extractPlayStoreVersion(html: string): string {
  // Google Play embeds version numbers in their data arrays
  // Look for version-like patterns near known markers
  const versionPatterns = [
    // softwareVersion in structured data
    /"softwareVersion"\s*:\s*"([^"]+)"/i,
    // Version in data arrays - look for the first version-like string
    /\[\[\["(\d+\.\d+\.\d+[^"]*?)"\]\]/,
  ];

  for (const pattern of versionPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  // Try to find version from all version-like strings in the page
  // Google Play often has multiple version strings; pick the first one that looks like a real version
  const allVersions = html.match(/"(\d+\.\d+\.\d+\.\d+)"/g);
  if (allVersions && allVersions.length > 0) {
    // Return the first (usually latest) version found
    return allVersions[0].replace(/"/g, '');
  }

  return '';
}

/**
 * Fetch Google Play data using CORS proxy + JSON-LD + OG meta
 */
async function fetchPlayStoreData(url: string): Promise<FetchedAppData> {
  const packageName = parsePlayStoreUrl(url);
  if (!packageName) throw new Error('رابط Google Play غير صالح');

  // Default fallback name from package
  let name = packageName.split('.').pop() || packageName;
  name = name.charAt(0).toUpperCase() + name.slice(1);
  let description = '';
  let iconUrl = '';
  let version = '';

  // Fetch the page through CORS proxy
  const html = await fetchWithProxy(
    `https://play.google.com/store/apps/details?id=${packageName}&hl=en`
  );

  if (html) {
    // 1. Try JSON-LD (most reliable, structured data)
    const jsonLd = parseJsonLd(html);
    if (jsonLd.name) name = jsonLd.name;
    if (jsonLd.description) description = jsonLd.description;
    if (jsonLd.image) iconUrl = jsonLd.image;
    if (jsonLd.version) version = jsonLd.version;

    // 2. Fallback to OG meta tags
    const og = parseOgMeta(html);
    if (!name || name === (packageName.split('.').pop() || '').charAt(0).toUpperCase() + (packageName.split('.').pop() || '').slice(1)) {
      if (og.title) {
        name = og.title
          .replace(/ - Apps on Google Play$/i, '')
          .replace(/ - التطبيقات على Google Play$/i, '')
          .trim();
      }
    }
    if (!description && og.description) description = og.description;
    if (!iconUrl && og.image) iconUrl = og.image;

    // 3. Try to extract version if not found yet
    if (!version) {
      version = extractPlayStoreVersion(html);
    }

    // Make icon URL use higher resolution
    if (iconUrl && iconUrl.includes('play-lh.googleusercontent.com')) {
      // Append size parameter for better quality
      if (!iconUrl.includes('=')) {
        iconUrl += '=s256-rw';
      }
    }
  }

  return {
    name,
    description: description || `تطبيق من Google Play`,
    iconUrl,
    version,
    downloadPageUrl: `https://play.google.com/store/apps/details?id=${packageName}`,
    source: 'playstore',
  };
}

/**
 * Fetch F-Droid data
 */
async function fetchFDroidData(url: string): Promise<FetchedAppData> {
  const packageName = parseFDroidUrl(url);
  if (!packageName) throw new Error('رابط F-Droid غير صالح');

  let name = packageName.split('.').pop() || packageName;
  name = name.charAt(0).toUpperCase() + name.slice(1);
  let description = '';
  let iconUrl = '';
  let version = '';

  // Try F-Droid API
  try {
    const apiUrl = `https://f-droid.org/api/v1/packages/${packageName}`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      name = data.name || name;
      description = data.summary || data.description?.substring(0, 200) || '';
      version = data.suggestedVersionName || '';
      if (data.icon) {
        iconUrl = `https://f-droid.org/repo/icons-640/${data.icon}`;
      }
    }
  } catch {
    // API failed, try scraping via proxy
    const html = await fetchWithProxy(url);
    if (html) {
      const og = parseOgMeta(html);
      if (og.title) name = og.title.replace(/\s*\|.*$/, '').replace(/\s*[-–].*F-Droid.*$/i, '').trim();
      if (og.description) description = og.description;
      if (og.image) iconUrl = og.image;

      const titleMatch = html.match(/<h3[^>]*class="package-name"[^>]*>([^<]+)/i) ||
                         html.match(/<title>([^|<]+)/i);
      if (titleMatch && !og.title) name = titleMatch[1].trim();

      const versionMatch = html.match(/Latest Version[^<]*<[^>]*>([^<]+)/i) ||
                           html.match(/<b[^>]*class="package-version"[^>]*>([^<]+)/i);
      if (versionMatch) version = versionMatch[1].trim();
    }
  }

  return {
    name,
    description: description || `تطبيق من F-Droid`,
    iconUrl,
    version,
    downloadPageUrl: url,
    source: 'fdroid',
  };
}

/**
 * Main fetch function
 */
export async function fetchAppData(url: string): Promise<FetchedAppData> {
  const source = detectSource(url);
  if (!source) throw new Error('الرابط غير مدعوم. يرجى استخدام رابط من GitHub أو Google Play أو F-Droid');

  switch (source) {
    case 'github':
      return fetchGitHubData(url);
    case 'playstore':
      return fetchPlayStoreData(url);
    case 'fdroid':
      return fetchFDroidData(url);
    default:
      throw new Error('مصدر غير مدعوم');
  }
}

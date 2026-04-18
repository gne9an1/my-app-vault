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
  // https://f-droid.org/packages/com.example.app/
  // https://f-droid.org/en/packages/com.example.app/
  const match = url.match(/f-droid\.org(?:\/[a-z]{2})?\/packages\/([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
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
 * Fetch Google Play data using a CORS proxy approach
 * Since we can't directly scrape Google Play from the browser,
 * we'll use available metadata from the URL
 */
async function fetchPlayStoreData(url: string): Promise<FetchedAppData> {
  const packageName = parsePlayStoreUrl(url);
  if (!packageName) throw new Error('رابط Google Play غير صالح');

  // Try fetching through a public API or proxy
  // Using a simple approach: extract what we can from the package name
  // and provide the Play Store page as download link
  let name = packageName.split('.').pop() || packageName;
  // Capitalize first letter
  name = name.charAt(0).toUpperCase() + name.slice(1);

  let description = '';
  let iconUrl = '';
  let version = '';

  // Try to get data from Google Play web page through a CORS proxy
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const html = await res.text();

      // Extract app name
      const titleMatch = html.match(/<h1[^>]*itemprop="name"[^>]*>([^<]+)<\/h1>/i) ||
                         html.match(/<h1[^>]*>\s*<span[^>]*>([^<]+)<\/span>/i) ||
                         html.match(/<title>([^-<]+)/i);
      if (titleMatch) {
        name = titleMatch[1].trim().replace(/ - Apps on Google Play$/, '').replace(/ - التطبيقات على Google Play$/, '');
      }

      // Extract icon
      const iconMatch = html.match(/itemprop="image"[^>]*content="([^"]+)"/i) ||
                        html.match(/class="[^"]*T75of[^"]*"[^>]*src="([^"]+)"/i);
      if (iconMatch) {
        iconUrl = iconMatch[1];
      }

      // Extract description snippet
      const descMatch = html.match(/itemprop="description"[^>]*content="([^"]+)"/i) ||
                        html.match(/<meta name="description" content="([^"]+)"/i);
      if (descMatch) {
        description = descMatch[1].substring(0, 200);
      }

      // Extract version
      const versionMatch = html.match(/Current Version[^<]*<[^>]*>([^<]+)/i) ||
                           html.match(/\[\["([[\d.]+)"\]\]/);
      if (versionMatch) {
        version = versionMatch[1].trim();
      }
    }
  } catch {
    // CORS proxy failed, use basic info
  }

  return {
    name,
    description: description || `تطبيق من Google Play (${packageName})`,
    iconUrl,
    version,
    downloadPageUrl: url,
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
    // API failed, try scraping
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<h3[^>]*class="package-name"[^>]*>([^<]+)/i) ||
                           html.match(/<title>([^|<]+)/i);
        if (titleMatch) name = titleMatch[1].trim();

        const descMatch = html.match(/<div[^>]*class="package-summary"[^>]*>([^<]+)/i);
        if (descMatch) description = descMatch[1].trim();

        const iconMatch = html.match(/<img[^>]*class="package-icon"[^>]*src="([^"]+)"/i);
        if (iconMatch) iconUrl = iconMatch[1].startsWith('http') ? iconMatch[1] : `https://f-droid.org${iconMatch[1]}`;

        const versionMatch = html.match(/Latest Version[^<]*<[^>]*>([^<]+)/i) ||
                             html.match(/<b[^>]*class="package-version"[^>]*>([^<]+)/i);
        if (versionMatch) version = versionMatch[1].trim();
      }
    } catch {
      // All failed
    }
  }

  return {
    name,
    description: description || `تطبيق من F-Droid (${packageName})`,
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

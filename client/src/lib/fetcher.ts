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
 * Extract GitHub owner/repo and optional tag from URL
 */
function parseGitHubUrl(url: string): { owner: string; repo: string; tag?: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) return null;

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  // Check if URL points to a specific release tag
  const tagMatch = url.match(/releases\/tag\/([^\/\?#]+)/);
  const tag = tagMatch ? decodeURIComponent(tagMatch[1]) : undefined;

  return { owner, repo, tag };
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
 * Check if a URL is a badge/shield image (not an actual app icon)
 */
function isBadgeUrl(url: string): boolean {
  const badgePatterns = [
    'shields.io', 'badge', 'img.shields', 'github.com/workflows',
    'travis-ci', 'circleci', 'codecov', 'coveralls', 'david-dm',
    'snyk.io', 'codacy', 'codeclimate', 'sonarcloud',
    'github-readme-stats', 'forthebadge', 'heroku',
    'actions/workflows', 'github.com/actions',
    'avatars.githubusercontent.com', // Developer profile photos - not app icons
    'contributors-img', 'contrib.rocks', // Contributor grid images
    'opencollective.com', // Sponsor/backer images
    'buymeacoffee.com', // Donation badges
    'ko-fi.com', // Donation badges
    'paypal.com', // Payment badges
    'patreon.com', // Patron badges
    'liberapay.com', // Donation badges
    'user-images.githubusercontent.com', // User uploaded images (often screenshots)
  ];
  const lower = url.toLowerCase();
  return badgePatterns.some(p => lower.includes(p));
}

/**
 * Check if URL points to a real image (not a badge, not too small)
 */
function isLikelyAppIcon(url: string, alt: string): boolean {
  if (isBadgeUrl(url)) return false;
  // Check if alt text or URL suggests it's a logo/icon
  const combined = (url + ' ' + alt).toLowerCase();
  const iconKeywords = ['logo', 'icon', 'banner', 'app', 'screenshot', 'preview'];
  return iconKeywords.some(k => combined.includes(k));
}

/**
 * Try to find app icon from GitHub README with smarter detection
 * Strategy: 1) Look for images with logo/icon keywords 2) Look for first non-badge image
 * 3) Search common icon paths in repo 4) Search repo tree for icon files
 * 5) Fallback to empty (letter icon in UI)
 */
async function fetchGitHubAppIcon(owner: string, repo: string): Promise<string> {
  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!readmeRes.ok) return '';

    const readmeData = await readmeRes.json();
    const content = atob(readmeData.content.replace(/\n/g, ''));

    // Collect ALL images from README (markdown + html)
    const allImages: { url: string; alt: string }[] = [];

    // Markdown images: ![alt](url)
    const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = mdRegex.exec(content)) !== null) {
      allImages.push({ alt: m[1], url: m[2] });
    }

    // HTML images: <img src="..." alt="...">
    const htmlRegex = /<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
    while ((m = htmlRegex.exec(content)) !== null) {
      allImages.push({ url: m[1], alt: m[2] || '' });
    }

    // Also check reverse order for HTML: alt before src
    const htmlRegex2 = /<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["']/gi;
    while ((m = htmlRegex2.exec(content)) !== null) {
      allImages.push({ url: m[2], alt: m[1] });
    }

    // Strategy 1: Find image with logo/icon keyword in alt or URL
    for (const img of allImages) {
      if (isBadgeUrl(img.url)) continue;
      if (isLikelyAppIcon(img.url, img.alt)) {
        let imgUrl = img.url;
        if (!imgUrl.startsWith('http')) {
          imgUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${imgUrl}`;
        }
        return imgUrl;
      }
    }

    // Strategy 2: Find first non-badge image (often the logo at top of README)
    for (const img of allImages) {
      if (isBadgeUrl(img.url)) continue;
      let imgUrl = img.url;
      if (!imgUrl.startsWith('http')) {
        imgUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${imgUrl}`;
      }
      return imgUrl;
    }
  } catch {
    // README fetch failed
  }

  // Strategy 3: Check common icon paths in the repository
  const commonPaths = [
    'app/src/main/ic_launcher-playstore.png',
    'app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
    'app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp',
    'app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
    'assets/icon.png',
    'assets/logo.png',
    'images/icon.png',
    'images/logo.png',
    'docs/images/logo.png',
    'art/icon.png',
    'art/logo.png',
    '.github/icon.png',
    'fastlane/metadata/android/en-US/images/icon.png',
  ];

  for (const path of commonPaths) {
    try {
      const checkUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`;
      const res = await fetch(checkUrl, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return checkUrl;
      }
    } catch {
      // Continue to next path
    }
  }

  // Strategy 4: Search repo tree for icon/logo image files
  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
      const iconKeywords = ['icon', 'logo', 'launcher', 'ic_launcher'];
      const tree = treeData.tree || [];

      // First pass: look for files with icon/logo keywords
      for (const item of tree) {
        if (item.type !== 'blob') continue;
        const pathLower = item.path.toLowerCase();
        const ext = pathLower.split('.').pop() || '';
        if (!imageExts.includes(ext)) continue;
        if (iconKeywords.some(k => pathLower.includes(k))) {
          return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${item.path}`;
        }
      }
    }
  } catch {
    // Tree fetch failed
  }

  // No icon found - return empty string (UI will show letter-based icon)
  return '';
}

/**
 * Fetch GitHub repo data - supports specific release tag URLs
 */
async function fetchGitHubData(url: string): Promise<FetchedAppData> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) throw new Error('رابط GitHub غير صالح');

  const { owner, repo, tag } = parsed;

  // Fetch repo info
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoRes.ok) throw new Error('لم يتم العثور على المستودع');
  const repoData = await repoRes.json();

  let version = '';
  let releasesUrl = `https://github.com/${owner}/${repo}/releases`;
  const developer = repoData.owner?.login || owner;

  if (tag) {
    // User provided a specific release tag URL - use that exact version
    version = tag;
    releasesUrl = `https://github.com/${owner}/${repo}/releases/tag/${encodeURIComponent(tag)}`;

    // Verify the tag exists via API
    try {
      const tagRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (tagRes.ok) {
        const tagData = await tagRes.json();
        version = tagData.tag_name || tag;
        releasesUrl = tagData.html_url || releasesUrl;
      }
    } catch {
      // Tag API failed, use the tag from URL as-is
    }
  } else {
    // No specific tag - check if URL points to /releases page, fetch latest
    try {
      const relRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        signal: AbortSignal.timeout(5000),
      });
      if (relRes.ok) {
        const relData = await relRes.json();
        version = relData.tag_name || '';
        releasesUrl = relData.html_url || releasesUrl;
      }
    } catch {
      // No releases
    }
  }

  // Try to get app icon from README/repo - NO fallback to owner avatar
  // (owner avatar is misleading - shows person's face instead of app icon)
  const iconUrl = await fetchGitHubAppIcon(owner, repo);

  return {
    name: repoData.name || repo,
    description: repoData.description || '',
    iconUrl,
    version,
    downloadPageUrl: releasesUrl,
    developer,
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
  developer?: string;
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
          developer: data.author?.name,
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
  const versionPatterns = [
    /"softwareVersion"\s*:\s*"([^"]+)"/i,
    /\[\[\["(\d+\.\d+\.\d+[^"]*?)"\]\]/,
  ];

  for (const pattern of versionPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  const allVersions = html.match(/"(\d+\.\d+\.\d+\.\d+)"/g);
  if (allVersions && allVersions.length > 0) {
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

  let name = packageName.split('.').pop() || packageName;
  name = name.charAt(0).toUpperCase() + name.slice(1);
  let description = '';
  let iconUrl = '';
  let version = '';
  let developer = '';

  const html = await fetchWithProxy(
    `https://play.google.com/store/apps/details?id=${packageName}&hl=en`
  );

  if (html) {
    const jsonLd = parseJsonLd(html);
    if (jsonLd.name) name = jsonLd.name;
    if (jsonLd.description) description = jsonLd.description;
    if (jsonLd.image) iconUrl = jsonLd.image;
    if (jsonLd.version) version = jsonLd.version;
    if (jsonLd.developer) developer = jsonLd.developer;

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

    if (!version) {
      version = extractPlayStoreVersion(html);
    }

    if (iconUrl && iconUrl.includes('play-lh.googleusercontent.com')) {
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
    developer,
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
  let developer = '';

  try {
    const apiUrl = `https://f-droid.org/api/v1/packages/${packageName}`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      name = data.name || name;
      description = data.summary || data.description?.substring(0, 200) || '';
      version = data.suggestedVersionName || '';
      developer = data.authorName || '';
      if (data.icon) {
        iconUrl = `https://f-droid.org/repo/icons-640/${data.icon}`;
      }
    }
  } catch {
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
    developer,
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

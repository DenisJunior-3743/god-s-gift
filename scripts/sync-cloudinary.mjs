import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets');
const OUTPUT_PATH = path.join(ROOT, 'js', 'cloudinary-media.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.jfif', '.gif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.mkv']);

const PARKS = [
  { localFolder: 'bwindi', attractionId: 'bwindi' },
  { localFolder: 'queen_elizabeth', attractionId: 'queen-elizabeth' },
  { localFolder: 'murchison_falls', attractionId: 'murchison-falls' },
  { localFolder: 'kidepoWild', attractionId: 'kidepo' },
  { localFolder: 'lake_bunyonyi', attractionId: 'lake-bunyonyi' },
  { localFolder: 'rwenzori', attractionId: 'rwenzori' },
  { localFolder: 'lake_mburo', attractionId: 'lake-mburo' },
];

const HERO_VIDEO = path.join(ASSETS_DIR, 'videos', 'uganda-safari-hero.mp4');

function parseEnvText(content) {
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['\"]|['\"]$/g, '');
    env[key] = value;
  }
  return env;
}

async function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  try {
    const content = await fs.readFile(envPath, 'utf8');
    const parsed = parseEnvText(content);
    for (const [k, v] of Object.entries(parsed)) {
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    // .env is optional when values are already in process env.
  }
}

function getCredentials() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
}

function getMediaType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  return null;
}

async function walkFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const all = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      all.push(...(await walkFiles(fullPath)));
    } else {
      all.push(fullPath);
    }
  }

  return all;
}

function cloudinarySignature(params, apiSecret) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${payload}${apiSecret}`)
    .digest('hex');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uploadToCloudinary(filePath, { cloudName, apiKey, apiSecret, folder, publicId, tags = '' }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = {
    folder,
    invalidate: 'true',
    overwrite: 'true',
    public_id: publicId,
    timestamp,
  };

  if (tags) {
    signaturePayload.tags = tags;
  }

  const signature = cloudinarySignature(signaturePayload, apiSecret);
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const bytes = await fs.readFile(filePath);
  const fileName = path.basename(filePath);
  const blob = new Blob([bytes]);

  const form = new FormData();
  form.set('file', blob, fileName);
  form.set('api_key', apiKey);
  form.set('timestamp', String(timestamp));
  form.set('folder', folder);
  form.set('public_id', publicId);
  form.set('overwrite', 'true');
  form.set('invalidate', 'true');
  form.set('signature', signature);
  if (tags) form.set('tags', tags);

  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}) for ${fileName}: ${errBody}`);
  }

  return res.json();
}

async function uploadParkMedia(park, credentials) {
  const parkRoot = path.join(ASSETS_DIR, park.localFolder);
  const files = await walkFiles(parkRoot);

  const mediaFiles = files
    .map((filePath) => ({ filePath, mediaType: getMediaType(filePath) }))
    .filter((entry) => entry.mediaType)
    .sort((a, b) => a.filePath.localeCompare(b.filePath));

  const result = { images: [], videos: [], coverImage: null };

  for (const media of mediaFiles) {
    const baseName = path.parse(media.filePath).name;
    const relative = path.relative(parkRoot, media.filePath).replace(/\\/g, '/');
    const scope = media.mediaType === 'image' ? 'images' : 'videos';

    const folder = `godsgift/${park.attractionId}/${scope}`;
    const publicId = slugify(baseName);
    const tags = ['godsgift', park.attractionId, scope, slugify(relative)].join(',');

    const uploaded = await uploadToCloudinary(media.filePath, {
      ...credentials,
      folder,
      publicId,
      tags,
    });

    if (media.mediaType === 'image') {
      result.images.push(uploaded.secure_url);
    } else {
      result.videos.push(uploaded.secure_url);
    }

    console.log(`Uploaded ${park.attractionId}: ${relative}`);
  }

  result.coverImage = result.images[0] || null;
  return result;
}

async function uploadHeroVideo(credentials) {
  try {
    await fs.access(HERO_VIDEO);
  } catch {
    return null;
  }

  const uploaded = await uploadToCloudinary(HERO_VIDEO, {
    ...credentials,
    folder: 'godsgift/site/hero',
    publicId: 'uganda-safari-hero',
    tags: 'godsgift,hero,homepage,video',
  });

  console.log('Uploaded hero video.');
  return uploaded.secure_url;
}

async function main() {
  await loadEnv();
  const credentials = getCredentials();

  if (!credentials.cloudName || !credentials.apiKey || !credentials.apiSecret) {
    throw new Error(
      'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env or your shell.'
    );
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    cloudinaryCloudName: credentials.cloudName,
    heroVideo: null,
    parks: {},
  };

  manifest.heroVideo = await uploadHeroVideo(credentials);

  for (const park of PARKS) {
    const parkPath = path.join(ASSETS_DIR, park.localFolder);
    try {
      await fs.access(parkPath);
    } catch {
      console.warn(`Skipping missing park folder: ${park.localFolder}`);
      continue;
    }

    manifest.parks[park.attractionId] = await uploadParkMedia(park, credentials);
  }

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log('Cloudinary media manifest updated: js/cloudinary-media.json');
  console.log(`Parks synced: ${Object.keys(manifest.parks).length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

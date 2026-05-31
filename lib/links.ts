import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type LinkRecord = {
  slug: string;
  target_url: string;
  clicks: number;
  created_at: string;
};

const DATA_FILE = path.join(process.cwd(), "data.json");
let storageQueue: Promise<void> = Promise.resolve();

let upstashClient: any = null;

function hasUpstash() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getUpstash() {
  if (!hasUpstash()) return null;
  if (upstashClient) return upstashClient;

  // lazy require to avoid bundling on client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Redis } = require('@upstash/redis');
  upstashClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return upstashClient;
}

async function upstashGetLinks(): Promise<LinkRecord[]> {
  const client = getUpstash();
  if (!client) return [];
  const raw = await client.get('dinamik-qr-links');
  if (raw == null) return [];

  // Upstash may return the stored value as a string, an array, or an object.
  // Handle common shapes robustly.
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as LinkRecord[];
    } catch {
      return [];
    }
  }

  if (Array.isArray(raw)) {
    return raw as LinkRecord[];
  }

  // Some clients may return an object wrapper; attempt to extract a value.
  try {
    // stringify + parse normalizes objects to arrays when possible
    return JSON.parse(JSON.stringify(raw)) as LinkRecord[];
  } catch {
    return [];
  }
}

async function upstashSetLinks(links: LinkRecord[]) {
  const client = getUpstash();
  if (!client) return;
  // Ensure no duplicate slugs are stored
  const deduped = dedupeLinks(links);
  await client.set('dinamik-qr-links', JSON.stringify(deduped));
}

function dedupeLinks(links: LinkRecord[]) {
  const map = new Map<string, LinkRecord>();
  // keep the first occurrence (assumed to be newest if list is unshifted)
  for (const l of links) {
    if (!map.has(l.slug)) {
      map.set(l.slug, l);
    }
  }
  return Array.from(map.values());
}

async function withStorageLock<T>(task: () => Promise<T>) {
  const run = storageQueue.then(task, task);
  storageQueue = run.then(() => undefined, () => undefined);
  return run;
}

async function readFileLinks(): Promise<LinkRecord[]> {
  try {
    const fileText = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(fileText);
    return Array.isArray(parsed) ? (parsed as LinkRecord[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeFile(DATA_FILE, "[]", "utf8");
      return [];
    }

    throw error;
  }
}

async function writeFileLinks(links: LinkRecord[]) {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  const deduped = dedupeLinks(links);
  await writeFile(DATA_FILE, JSON.stringify(deduped, null, 2), "utf8");
}

export async function ensureLinksTable() {
  // In production, require Upstash to be configured for persistence.
  if (process.env.NODE_ENV === 'production' && !hasUpstash()) {
    throw new Error('Upstash not configured in production environment');
  }

  if (hasUpstash()) {
    // ensure key exists
    const links = await upstashGetLinks();
    if (!links) await upstashSetLinks([]);
    return;
  }

  await withStorageLock(async () => {
    await readFileLinks();
  });
}

export async function getLinks(): Promise<LinkRecord[]> {
  if (hasUpstash()) {
    const links = await upstashGetLinks();
    return [...links].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  return withStorageLock(async () => {
    const links = await readFileLinks();
    return [...links].sort((left, right) => right.created_at.localeCompare(left.created_at));
  });
}

export async function upsertLink(slug: string, targetUrl: string) {
  if (hasUpstash()) {
    const links = await upstashGetLinks();
    const existingIndex = links.findIndex((item) => item.slug === slug);
    const createdAt = existingIndex >= 0 ? links[existingIndex].created_at : new Date().toISOString();
    const clicks = existingIndex >= 0 ? links[existingIndex].clicks : 0;
    const nextLink: LinkRecord = { slug, target_url: targetUrl, clicks, created_at: createdAt };

    if (existingIndex >= 0) {
      links[existingIndex] = nextLink;
    } else {
      links.unshift(nextLink);
    }

    await upstashSetLinks(links);
    return;
  }

  await withStorageLock(async () => {
    const links = await readFileLinks();
    const existingIndex = links.findIndex((item) => item.slug === slug);
    const createdAt = existingIndex >= 0 ? links[existingIndex].created_at : new Date().toISOString();
    const clicks = existingIndex >= 0 ? links[existingIndex].clicks : 0;
    const nextLink: LinkRecord = { slug, target_url: targetUrl, clicks, created_at: createdAt };

    if (existingIndex >= 0) {
      links[existingIndex] = nextLink;
    } else {
      links.unshift(nextLink);
    }

    await writeFileLinks(links);
  });
}

export async function deleteLink(slug: string) {
  if (hasUpstash()) {
    const links = await upstashGetLinks();
    const filtered = links.filter((item) => item.slug !== slug);
    await upstashSetLinks(filtered);
    return;
  }

  await withStorageLock(async () => {
    const links = await readFileLinks();
    await writeFileLinks(links.filter((item) => item.slug !== slug));
  });
}

export async function getLinkBySlug(slug: string) {
  if (hasUpstash()) {
    const links = await upstashGetLinks();
    return links.find((item) => item.slug === slug) ?? null;
  }

  return withStorageLock(async () => {
    const links = await readFileLinks();
    return links.find((item) => item.slug === slug) ?? null;
  });
}

export async function incrementClicks(slug: string) {
  if (hasUpstash()) {
    const links = await upstashGetLinks();
    const index = links.findIndex((item) => item.slug === slug);
    if (index >= 0) {
      links[index] = { ...links[index], clicks: links[index].clicks + 1 };
      await upstashSetLinks(links);
    }
    return;
  }

  await withStorageLock(async () => {
    const links = await readFileLinks();
    const index = links.findIndex((item) => item.slug === slug);

    if (index >= 0) {
      links[index] = {
        ...links[index],
        clicks: links[index].clicks + 1,
      };
      await writeFileLinks(links);
    }
  });
}
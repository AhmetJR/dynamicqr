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
  await writeFile(DATA_FILE, JSON.stringify(links, null, 2), "utf8");
}

export async function ensureLinksTable() {
  await withStorageLock(async () => {
    await readFileLinks();
  });
}

export async function getLinks(): Promise<LinkRecord[]> {
  return withStorageLock(async () => {
    const links = await readFileLinks();
    return [...links].sort((left, right) => right.created_at.localeCompare(left.created_at));
  });
}

export async function upsertLink(slug: string, targetUrl: string) {
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
  await withStorageLock(async () => {
    const links = await readFileLinks();
    await writeFileLinks(links.filter((item) => item.slug !== slug));
  });
}

export async function getLinkBySlug(slug: string) {
  return withStorageLock(async () => {
    const links = await readFileLinks();
    return links.find((item) => item.slug === slug) ?? null;
  });
}

export async function incrementClicks(slug: string) {
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
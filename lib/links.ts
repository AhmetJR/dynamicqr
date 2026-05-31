import { sql } from "@vercel/postgres";

let linksTableReady: Promise<void> | null = null;

export function ensureLinksTable() {
  if (!linksTableReady) {
    linksTableReady = sql`
      CREATE TABLE IF NOT EXISTS links (
        slug VARCHAR(255) PRIMARY KEY,
        target_url TEXT NOT NULL,
        clicks INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
      .then(() => undefined)
      .catch((error) => {
        linksTableReady = null;
        throw error;
      });
  }

  return linksTableReady;
}
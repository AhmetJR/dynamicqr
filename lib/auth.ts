export const ADMIN_COOKIE_NAME = "dinamik-qr-admin";

export const DEFAULT_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "qr-admin-2026";

export function isValidAdminPassword(password: string) {
  return password === DEFAULT_ADMIN_PASSWORD;
}
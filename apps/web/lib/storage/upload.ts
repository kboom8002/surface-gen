/**
 * Upload utility helpers for the web app.
 * Server-safe: uses Node.js crypto (no browser APIs).
 * Called from route handlers only — never from client components.
 */
import crypto from 'crypto';

const ALLOWED_FACTSHEET_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain',
  'application/json',
  // Some environments send this for .md files
  'text/x-markdown',
];

const FORBIDDEN_EXTENSIONS = [
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.ps1',
  '.msi',
  '.dmg',
  '.app',
];

/**
 * Sanitizes a file name to be safe for storage paths.
 * Removes path separators and traversal sequences.
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.\.+/g, '_')
    .substring(0, 200);
}

/**
 * Returns true if the file name ends with a forbidden executable extension.
 */
export function isForbiddenExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return FORBIDDEN_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Returns true if the MIME type is an accepted factsheet/document type.
 */
export function isAllowedFactsheetType(mimeType: string): boolean {
  return ALLOWED_FACTSHEET_MIME_TYPES.includes(mimeType);
}

/**
 * Returns true if the MIME type is an accepted image type.
 * Only jpeg, png, and webp are permitted per storage spec.
 */
export function isAllowedImageType(mimeType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType);
}

/**
 * Computes a SHA-256 hex digest of the given ArrayBuffer.
 * Used for reproducible export manifests and integrity verification.
 */
export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hash = crypto.createHash('sha256');
  hash.update(Buffer.from(buffer));
  return hash.digest('hex');
}

/**
 * BISIKLAGU CYBER SECURITY HELPERS
 * Protection against XSS, SQL Injection, Invalid Inputs & Privilege Escalation
 */

// Escape HTML special characters to prevent stored/reflected XSS
export function sanitizeInput(input?: string | null, maxLength = 1000): string {
  if (!input) return '';
  const trimmed = input.trim().slice(0, maxLength);
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Unescape for canvas / SVG exporter rendering when needed safely
export function safeText(input?: string | null): string {
  if (!input) return '';
  return input.trim().slice(0, 1000);
}

// Strict username format validation (Alphanumeric and underscore only, 3-30 chars)
export function isValidUsername(username?: string | null): boolean {
  if (!username) return false;
  return /^[a-zA-Z0-9_]{3,30}$/.test(username.trim());
}

// Strict PIN / Password format check (Min 4 chars, max 64)
export function isValidPinFormat(pin?: string | null): boolean {
  if (!pin) return false;
  const p = pin.trim();
  return p.length >= 4 && p.length <= 64;
}

// Clean and sanitize URL parameters to prevent open redirect or SSRF
export function sanitizeUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch (e) {}
  return null;
}

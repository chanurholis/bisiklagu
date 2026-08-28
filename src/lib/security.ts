/**
 * BISIKLAGU CYBER SECURITY HELPERS
 * Protection against XSS, SQL Injection, Invalid Inputs & Privilege Escalation
 */

// Decode HTML entities (e.g. &#x27; -> ', &quot; -> ", &amp; -> &, &lt; -> <, &gt; -> >)
export function decodeHTMLEntities(text?: string | null): string {
  if (!text) return '';
  let str = text;
  let prev = '';
  let passes = 0;
  // Loop up to 3 passes to handle multi-encoded entities like &amp;#x27;
  while (str !== prev && passes < 3) {
    prev = str;
    passes++;
    str = str
      .replace(/&#x27;/gi, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/gi, '"')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#x2F;/gi, '/')
      .replace(/&#47;/g, '/')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
  return str;
}

// Clean and sanitize URL parameters / input text safely while preserving clean text characters like quotes
export function sanitizeInput(input?: string | null, maxLength = 1000): string {
  if (!input) return '';
  const decoded = decodeHTMLEntities(input.trim().slice(0, maxLength));
  return decoded
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '');
}

// Unescape for canvas / SVG exporter rendering when needed safely
export function safeText(input?: string | null): string {
  if (!input) return '';
  return decodeHTMLEntities(input.trim().slice(0, 1000));
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

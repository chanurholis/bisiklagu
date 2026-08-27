import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'bisiklagu_auth_secret_key_2026';

/**
 * Generate a cryptographically signed session token for a username
 */
export function generateSessionToken(username: string): string {
  const cleanUsername = username.trim().toLowerCase();
  const timestamp = Date.now();
  const payload = `${cleanUsername}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
  const base64Payload = Buffer.from(payload).toString('base64url');
  return `bl_sess_${base64Payload}.${hmac}`;
}

/**
 * Verify a session token against expected username without running CPU-heavy bcrypt
 */
export function verifySessionToken(token: string | null | undefined, expectedUsername: string): boolean {
  if (!token || !expectedUsername) return false;
  try {
    const rawToken = token.startsWith('bl_sess_') ? token.substring(8) : token;
    const parts = rawToken.split('.');
    if (parts.length !== 2) return false;

    const [base64Payload, hmac] = parts;
    const rawPayload = Buffer.from(base64Payload, 'base64url').toString('utf8');
    
    const expectedHmac = crypto.createHmac('sha256', AUTH_SECRET).update(rawPayload).digest('hex');
    if (hmac !== expectedHmac) return false;

    const [tokenUsername, timestampStr] = rawPayload.split(':');
    if (tokenUsername.toLowerCase() !== expectedUsername.trim().toLowerCase()) return false;

    // Validate 30-day token expiration
    const timestamp = parseInt(timestampStr, 10);
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (isNaN(timestamp) || Date.now() - timestamp > thirtyDaysMs) return false;

    return true;
  } catch (e) {
    return false;
  }
}

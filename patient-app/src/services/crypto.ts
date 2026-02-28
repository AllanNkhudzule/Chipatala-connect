const KEY_STORAGE = 'chipatala-device-key';

function bufToBase64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64: string) {
  const str = atob(b64);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
  return buf.buffer;
}

async function generateAndStoreKey() {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', key);
  localStorage.setItem(KEY_STORAGE, bufToBase64(raw));
  return key;
}

async function importKeyFromStorage() {
  const rawB64 = localStorage.getItem(KEY_STORAGE);
  if (!rawB64) return null;
  const raw = base64ToBuf(rawB64);
  try {
    return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
  } catch {
    return null;
  }
}

export async function getDeviceKey(): Promise<CryptoKey> {
  let key = await importKeyFromStorage();
  if (!key) key = await generateAndStoreKey();
  return key;
}

export async function encryptObject(obj: unknown) {
  const key = await getDeviceKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(obj));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return JSON.stringify({ iv: bufToBase64(iv.buffer), ct: bufToBase64(ct) });
}

export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DECRYPTION_FAILED';
  }
}

export async function decryptToObject(payload: string) {
  try {
    const parsed = JSON.parse(payload) as { iv?: string; ct?: string };
    if (!parsed.iv || !parsed.ct) {
      throw new DecryptionError('Missing IV or ciphertext');
    }
    const iv = new Uint8Array(base64ToBuf(parsed.iv));
    const ct = base64ToBuf(parsed.ct);
    const key = await getDeviceKey();
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(plain));
  } catch (err) {
    if (err instanceof DecryptionError) throw err;
    throw new DecryptionError('Decryption processing failed');
  }
}

export function clearDeviceKey() {
  localStorage.removeItem(KEY_STORAGE);
}

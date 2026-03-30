/**
 * steganography.ts
 * Pure-function client-side steganography library.
 * Uses LSB (Least Significant Bit) embedding + AES-256-GCM encryption.
 * All processing is in-browser — no data ever leaves the device.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const MAGIC = "STEG"; // 4-byte magic header
const MAGIC_BYTES = new TextEncoder().encode(MAGIC); // [83, 84, 69, 71]
const ENCRYPTED_PREFIX = "ENC:";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BitsPerChannel = 1 | 2 | 4;
export type EntropyLevel = "low" | "medium" | "high";

export interface EntropyResult {
  score: number;        // 0-100 normalised
  chiSquare: number;    // raw chi-square value
  level: EntropyLevel;
  probability: string;  // human-readable
  byteCapacity: number; // max bytes the image can hold at 1bpc
  details: string;
}

export interface EncodeResult {
  imageData: ImageData;
  bytesUsed: number;
  bytesCapacity: number;
}

// ─── Bit Helpers ──────────────────────────────────────────────────────────────

/** Convert a Uint8Array payload to an array of individual bits */
function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

/** Read `count` bits starting at `offset` in `bits` array. Returns a byte. */
function bitsToNumber(bits: number[], offset: number, count: number): number {
  let value = 0;
  for (let i = 0; i < count; i++) {
    value = (value << 1) | (bits[offset + i] ?? 0);
  }
  return value;
}

// ─── Core LSB Encode ─────────────────────────────────────────────────────────

/**
 * Embed a message string into ImageData using LSB steganography.
 * Format: MAGIC(4) + length(4 bytes, big-endian) + payload bytes
 *
 * @param imageData  Source ImageData (will NOT be mutated — a copy is returned)
 * @param message    The string to hide
 * @param bpc        Bits per channel: 1 (low), 2 (medium), 4 (high)
 */
export function encodeMessage(
  imageData: ImageData,
  message: string,
  bpc: BitsPerChannel = 1
): EncodeResult {
  const data = new Uint8ClampedArray(imageData.data); // mutable copy
  const encoder = new TextEncoder();
  const msgBytes = encoder.encode(message);

  // Build full payload: MAGIC + 4-byte length + message bytes
  const lengthBytes = new Uint8Array(4);
  new DataView(lengthBytes.buffer).setUint32(0, msgBytes.length, false);
  const payload = new Uint8Array([
    ...MAGIC_BYTES,
    ...lengthBytes,
    ...msgBytes,
  ]);

  // Capacity check (only R, G, B channels — skip alpha at index 3)
  const pixelCount = data.length / 4;
  const channelsAvailable = pixelCount * 3; // RGB only
  const bitsAvailable = channelsAvailable * bpc;
  const bytesCapacity = Math.floor(bitsAvailable / 8);
  const bytesUsed = payload.length;

  if (bytesUsed > bytesCapacity) {
    throw new Error(
      `Message too large. Maximum ${bytesCapacity} bytes, message needs ${bytesUsed} bytes. ` +
        "Try a higher encoding strength or a larger image."
    );
  }

  // Convert payload to bit stream
  const bits = bytesToBits(payload);
  const mask = ~((1 << bpc) - 1) & 0xff; // e.g., bpc=2 → 0xFC
  const bitMask = (1 << bpc) - 1;        // e.g., bpc=2 → 0x03

  let bitIndex = 0;

  for (let pixelIdx = 0; pixelIdx < pixelCount && bitIndex < bits.length; pixelIdx++) {
    const base = pixelIdx * 4;
    // Embed into R, G, B (but not A)
    for (let channel = 0; channel < 3 && bitIndex < bits.length; channel++) {
      // Collect `bpc` bits
      let chunk = 0;
      for (let b = 0; b < bpc; b++) {
        chunk = (chunk << 1) | (bits[bitIndex++] ?? 0);
      }
      // Clear LSB(s) then set them
      data[base + channel] = (data[base + channel] & mask) | (chunk & bitMask);
    }
  }

  return {
    imageData: new ImageData(data, imageData.width, imageData.height),
    bytesUsed,
    bytesCapacity,
  };
}

// ─── Core LSB Decode ─────────────────────────────────────────────────────────

/**
 * Extract a hidden message from ImageData.
 * Tries bitsPerChannel values in order: 1, 2, 4 — or use a specific value
 * if you know what was used during encoding.
 *
 * @throws Error if no valid STEG header found
 */
export function decodeMessage(
  imageData: ImageData,
  bpc: BitsPerChannel = 1
): string {
  const data = imageData.data;
  const pixelCount = data.length / 4;

  // We need at minimum (4+4) bytes = 64 bits for header+length
  const headerBitCount = (MAGIC_BYTES.length + 4) * 8; // 64 bits
  if (pixelCount * 3 * bpc < headerBitCount) {
    throw new Error("Image too small to contain a hidden message.");
  }

  const bitMask = (1 << bpc) - 1;

  /** Read `byteCount` bytes worth of bits starting at pixel `startPixel` and channel `startChannel` */
  function readBytes(byteCount: number, startBitIndex: number): Uint8Array {
    const result = new Uint8Array(byteCount);
    let bitIndex = startBitIndex;
    for (let i = 0; i < byteCount; i++) {
      let byte = 0;
      let bitsRead = 0;
      while (bitsRead < 8) {
        const pixelIdx = Math.floor(bitIndex / (3 * bpc));
        if (pixelIdx >= pixelCount) break;
        const channelIdx = Math.floor((bitIndex % (3 * bpc)) / bpc);
        const bitOffset = (8 - bitsRead - bpc);

        const channelBits = data[pixelIdx * 4 + channelIdx] & bitMask;

        if (bitOffset >= 0) {
          byte |= channelBits << bitOffset;
        } else {
          byte |= channelBits >> (-bitOffset);
        }

        bitsRead += bpc;
        bitIndex += bpc;
      }
      result[i] = byte & 0xff;
    }
    return result;
  }

  // Read possible magic header
  const magic = readBytes(4, 0);
  const magicStr = new TextDecoder().decode(magic);
  if (magicStr !== MAGIC) {
    throw new Error(
      "No hidden message found in this image. " +
        "Make sure the image was encoded with this tool and try different encoding strengths."
    );
  }

  // Read message length (4 bytes big-endian)
  const lengthBytes = readBytes(4, 4 * 8);
  const messageLength = new DataView(lengthBytes.buffer).getUint32(0, false);

  // Sanity check
  const maxCapacity = Math.floor((pixelCount * 3 * bpc) / 8);
  if (messageLength > maxCapacity || messageLength > 50_000_000) {
    throw new Error(
      "Invalid message length found. Wrong encoding strength? Try a different strength setting."
    );
  }

  // Read message bytes
  const msgBytes = readBytes(messageLength, (4 + 4) * 8);
  return new TextDecoder().decode(msgBytes);
}

/**
 * Try all bitsPerChannel values (1, 2, 4) to auto-detect encoding strength.
 * Returns { message, bpc } on success.
 */
export function decodeMessageAuto(
  imageData: ImageData
): { message: string; bpc: BitsPerChannel } {
  const bpcValues: BitsPerChannel[] = [1, 2, 4];
  const errors: string[] = [];

  for (const bpc of bpcValues) {
    try {
      const message = decodeMessage(imageData, bpc);
      return { message, bpc };
    } catch (err) {
      errors.push(`bpc=${bpc}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(
    "No hidden message found. " +
      "Ensure the image was encoded with this tool at any strength level."
  );
}

// ─── Encryption (AES-256-GCM via Web Crypto) ──────────────────────────────────

/** Ensure a proper ArrayBuffer (not SharedArrayBuffer) for Web Crypto API compatibility */
function toFixedBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const pwBytes = new TextEncoder().encode(password);
  const importedKey = await crypto.subtle.importKey(
    "raw",
    toFixedBuffer(pwBytes),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toFixedBuffer(salt),
      iterations: 100_000,
      hash: "SHA-256",
    },
    importedKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Encrypt a plaintext message with a password.
 * Returns a base64 string prefixed with "ENC:" for detection.
 */
export async function encryptMessage(message: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const msgBytes = new TextEncoder().encode(message);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toFixedBuffer(iv) },
    key,
    toFixedBuffer(msgBytes)
  );

  // Pack: salt(16) + iv(12) + ciphertext
  const packed = new Uint8Array(16 + 12 + ciphertext.byteLength);
  packed.set(salt, 0);
  packed.set(iv, 16);
  packed.set(new Uint8Array(ciphertext), 28);

  return ENCRYPTED_PREFIX + toBase64(packed);
}

/**
 * Decrypt a previously encrypted message.
 * @throws if password is wrong or data is corrupt
 */
export async function decryptMessage(ciphertext: string, password: string): Promise<string> {
  if (!ciphertext.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error("This message is not encrypted.");
  }

  const packed = fromBase64(ciphertext.slice(ENCRYPTED_PREFIX.length));
  const salt = packed.slice(0, 16);
  const iv = packed.slice(16, 28);
  const encrypted = packed.slice(28);

  const key = await deriveKey(password, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toFixedBuffer(iv) },
      key,
      toFixedBuffer(encrypted)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error(
      "Decryption failed. Incorrect password or corrupted data."
    );
  }
}

/** Check if a decoded message string is encrypted */
export function isEncrypted(message: string): boolean {
  return message.startsWith(ENCRYPTED_PREFIX);
}

// ─── Smart Detection / Entropy Analysis ──────────────────────────────────────

/**
 * Analyse LSB distribution of RGB channels to detect potential steganography.
 * Uses chi-square test: a heavily flat LSB distribution indicates embedded data.
 *
 * @param imageData  The image to analyse
 * @param sampleSize  Max pixels to sample (default 50k for performance)
 */
export function analyzeEntropy(
  imageData: ImageData,
  sampleSize = 50_000
): EntropyResult {
  const data = imageData.data;
  const pixelCount = Math.min(data.length / 4, sampleSize);

  // Count 0s and 1s in LSBs across R, G, B
  const channelCounts = [
    { zeros: 0, ones: 0 }, // R
    { zeros: 0, ones: 0 }, // G
    { zeros: 0, ones: 0 }, // B
  ];

  for (let i = 0; i < pixelCount; i++) {
    const base = i * 4;
    for (let c = 0; c < 3; c++) {
      const lsb = data[base + c] & 1;
      if (lsb === 0) channelCounts[c].zeros++;
      else channelCounts[c].ones++;
    }
  }

  // Chi-square statistic per channel: expected = N/2 for each
  let totalChi = 0;
  for (const ch of channelCounts) {
    const n = ch.zeros + ch.ones;
    if (n === 0) continue;
    const expected = n / 2;
    totalChi +=
      Math.pow(ch.zeros - expected, 2) / expected +
      Math.pow(ch.ones - expected, 2) / expected;
  }
  const avgChi = totalChi / 3;

  // Natural images have high chi-square (non-uniform LSBs)
  // Steganography images have low chi-square (near-uniform / 50-50 split)
  // Threshold tuned empirically:
  // avgChi > 50  → natural (low probability)
  // avgChi 10-50 → uncertain (medium)
  // avgChi < 10  → likely steganography (high)

  let score: number;
  let level: EntropyLevel;
  let probability: string;

  if (avgChi > 50) {
    score = Math.min(20, Math.max(0, 20 - (avgChi - 50) / 10));
    level = "low";
    probability = "Low — LSB distribution looks natural";
  } else if (avgChi > 10) {
    score = 20 + ((50 - avgChi) / 40) * 40;
    level = "medium";
    probability = "Medium — LSB distribution is slightly uniform";
  } else {
    score = 60 + Math.min(40, (10 - avgChi) * 4);
    level = "high";
    probability = "High — LSB pattern strongly suggests hidden data";
  }

  const byteCapacity = Math.floor(pixelCount * 3 * 1 / 8);

  const details =
    `Chi-square: ${avgChi.toFixed(2)} | ` +
    `Pixels sampled: ${pixelCount.toLocaleString()} | ` +
    `R: ${channelCounts[0].zeros}:${channelCounts[0].ones} | ` +
    `G: ${channelCounts[1].zeros}:${channelCounts[1].ones} | ` +
    `B: ${channelCounts[2].zeros}:${channelCounts[2].ones}`;

  return {
    score: Math.round(score),
    chiSquare: parseFloat(avgChi.toFixed(2)),
    level,
    probability,
    byteCapacity,
    details,
  };
}

// ─── Capacity Utility ─────────────────────────────────────────────────────────

/** Return the maximum message bytes that fit in an image at a given BPC */
export function getCapacity(width: number, height: number, bpc: BitsPerChannel): number {
  const channelsAvailable = width * height * 3;
  const bitsAvailable = channelsAvailable * bpc;
  const headerBytes = MAGIC_BYTES.length + 4; // magic + length field
  return Math.max(0, Math.floor(bitsAvailable / 8) - headerBytes);
}

/** Return a human-readable capacity string */
export function formatCapacity(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

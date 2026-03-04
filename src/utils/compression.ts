import { unzip } from "zlib";
import { promisify } from "util";

const unzipAsync = promisify(unzip);

/**
 * Decode URL-safe Base64 string to standard Base64
 */
const base64UrlToBase64 = (str: string): string => {
  // Replace URL-safe chars
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding back if missing
  base64 += "=".repeat((4 - (base64.length % 4)) % 4);
  return base64;
};

/**
 * Decompress a URL-safe base64 string back into an object (Node.js async with zlib)
 */
export const decompressBase64UrlToObject = async <T = any>(
  base64Url: string
): Promise<T | null> => {
  try {
    // URL-safe Base64 → standard Base64 → Buffer
    const compressed = Buffer.from(base64UrlToBase64(base64Url), "base64");

    // async unzip
    const decompressed = await unzipAsync(compressed);

    // buffer → string → JSON
    return JSON.parse(decompressed.toString("utf-8")) as T;
  } catch (err) {
    console.warn("Failed to decompress query param:", err);
    return null;
  }
};

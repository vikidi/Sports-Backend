import { createHmac } from "crypto";

/**
 * Calculates the HMAC (Hash-based Message Authentication Code) for the given data.
 * Utilizes the SHA-256 hashing algorithm.
 *
 * @param {any} data - The data to be hashed, which will be stringified.
 * @param {string} key - The secret key used for HMAC generation.
 * @returns {string} - The resulting HMAC as a hexadecimal string.
 */
export const calculateHmac = (data: any, key: string): string => {
  return createHmac("sha256", key).update(JSON.stringify(data)).digest("hex");
};

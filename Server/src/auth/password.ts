import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export function generateSalt(): string {
  return randomBytes(SALT_BYTES).toString("hex");
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return derived.toString("hex");
}

export async function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  const computedBuffer = Buffer.from(computed, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (computedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedBuffer, storedBuffer);
}

import { signAccessToken, verifyAccessToken } from "./jwt.js";
import { generateSalt, hashPassword, verifyPassword } from "./password.js";

const salt = generateSalt();
const hash = await hashPassword("secret123", salt);
const ok = await verifyPassword("secret123", salt, hash);
const bad = await verifyPassword("wrong", salt, hash);
const token = signAccessToken({ sub: "user-1", email: "a@b.com", username: "alex" });
const payload = verifyAccessToken(token);

console.log(
  JSON.stringify(
    {
      saltLen: salt.length,
      hashLen: hash.length,
      ok,
      bad,
      payload,
    },
    null,
    2,
  ),
);

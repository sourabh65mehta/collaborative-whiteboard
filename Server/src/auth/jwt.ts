import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../env.js";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  username: string;
};

export function signAccessToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>,
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === "string" || !decoded.sub || !decoded.email || !decoded.username) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    email: String(decoded.email),
    username: String(decoded.username),
  };
}

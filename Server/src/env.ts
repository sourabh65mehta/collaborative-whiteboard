import "dotenv/config";

function read(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: read("JWT_SECRET", "dev-only-change-this-secret"),
  jwtExpiresIn: read("JWT_EXPIRES_IN", "7d"),
  clientOrigin: read("CLIENT_ORIGIN", "http://localhost:5173"),
};

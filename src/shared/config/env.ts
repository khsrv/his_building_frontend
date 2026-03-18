import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080"),
});

const serverSchema = z.object({
  BACKEND_API_URL: z.string().url().default("http://localhost:8080"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Only validate server schema on server side
const isServer = typeof window === "undefined";

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
if (!clientParsed.success) {
  throw new Error(`Invalid client env: ${clientParsed.error.message}`);
}

export const clientEnv = clientParsed.data;

// Server env - only parsed on server
let serverEnv: z.infer<typeof serverSchema> | null = null;
if (isServer) {
  const serverParsed = serverSchema.safeParse({
    BACKEND_API_URL: process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
  if (!serverParsed.success) {
    throw new Error(`Invalid server env: ${serverParsed.error.message}`);
  }
  serverEnv = serverParsed.data;
}

export const env = {
  ...clientParsed.data,
  ...(serverEnv ?? {}),
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as z.infer<typeof clientSchema> & z.infer<typeof serverSchema>;

import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  // Silence monorepo root inference warning in CI by pinning the root.
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
};

export default nextConfig;

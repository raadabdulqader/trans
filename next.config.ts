import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

// Clean stale production build artifacts if starting Next.js in development mode
// This prevents Next.js Webpack runtime chunk mismatch ("Cannot find module './xxx.js'")
const isDev = process.env.NODE_ENV !== 'production' || process.argv.includes('dev');
if (isDev) {
  try {
    const nextDir = path.join(process.cwd(), '.next');
    if (
      fs.existsSync(path.join(nextDir, 'BUILD_ID')) ||
      fs.existsSync(path.join(nextDir, 'prerender-manifest.json'))
    ) {
      fs.rmSync(nextDir, { recursive: true, force: true });
    }
  } catch (_) {}
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  // Treat pdfjs-dist as an external package for server bundles
  serverExternalPackages: ['pdfjs-dist'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent client bundle from attempting to resolve Node.js native canvas and modules
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;

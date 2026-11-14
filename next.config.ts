import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

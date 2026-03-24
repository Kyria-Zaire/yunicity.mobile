import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.STANDALONE === '1' ? { output: 'standalone' as const } : {}),
  transpilePackages: ['@yunicity/ui'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'api.mapbox.com' }],
  },
  experimental: {
    optimizePackageImports: ['@yunicity/ui'],
  },
};

export default nextConfig;

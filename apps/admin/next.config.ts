import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  ...(process.env.STANDALONE === '1' ? { output: 'standalone' as const } : {}),
  transpilePackages: ['@yunicity/ui'],
  experimental: {
    optimizePackageImports: ['@yunicity/ui'],
  },
};

export default nextConfig;

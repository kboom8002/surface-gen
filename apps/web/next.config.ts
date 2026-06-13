import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@surface-gen/schemas',
    '@surface-gen/shared',
    '@surface-gen/ui',
  ],
};

export default nextConfig;

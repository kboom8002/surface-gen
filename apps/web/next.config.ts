import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@surface-gen/schemas',
    '@surface-gen/shared',
    '@surface-gen/ui',
    '@surface-gen/worker',
    '@surface-gen/prompts',
    '@surface-gen/validators',
  ],
};

export default nextConfig;

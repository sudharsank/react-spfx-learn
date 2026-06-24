import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/react-spfx-learn/spfx',
  assetPrefix: '/react-spfx-learn/spfx/',
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
};

export default withMDX(nextConfig);

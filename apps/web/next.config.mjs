/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared workspace package is consumed as TypeScript source — let Next transpile it.
  transpilePackages: ['@daily-tracker/shared'],
};

export default nextConfig;

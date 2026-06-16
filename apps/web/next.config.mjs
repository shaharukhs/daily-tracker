/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared workspace package is consumed as TypeScript source — let Next transpile it.
  transpilePackages: ['@daily-tracker/shared'],
  // In the cloud the API runs on a different host (e.g. Render). Proxying /api/* to it
  // keeps the browser same-origin, so the httpOnly refresh cookie + CORS just work.
  // Set API_ORIGIN to the API base URL (no trailing slash) on the host (e.g. Vercel).
  async rewrites() {
    const api = process.env.API_ORIGIN;
    return api ? [{ source: '/api/:path*', destination: `${api}/api/:path*` }] : [];
  },
};

export default nextConfig;

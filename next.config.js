/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true, // ✅ Habilita Server Actions
  },
};

module.exports = nextConfig;

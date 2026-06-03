/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',     // Dimatikan sementara agar API routes aktif di dev
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

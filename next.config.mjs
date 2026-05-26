/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // Static HTML untuk Cloudflare Pages
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

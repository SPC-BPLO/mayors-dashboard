/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.9.191", "192.168.13.68"],
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;

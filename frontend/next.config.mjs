import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://backend:3001";

    return [
      {
        source: "/report/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/report/:path*`,
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    return [
      {
        source: "/report/:path*",
        destination: `${apiUrl.replace(/\/$/, "")}/report/:path*`,
      },
    ];
  },
};

export default nextConfig;

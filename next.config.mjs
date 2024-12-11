/** @type {import('next').NextConfig} */

const nextConfig = {
  async headers() {
    return [
      {
        // Apply headers to any route starting with /api/, it is necessary to avoid error in admin-react package as it expects a content range header
        // Note we do not require a cors as the origin is same
        source: "/api/(.*)",
        headers: [
          {
            key: "Content-Range",
            value: "bytes : 0-9/*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
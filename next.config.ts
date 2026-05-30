/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript hatalarını derleme sırasında yoksayar
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint hatalarını derleme sırasında yoksayar
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript hatalarını derleme sırasında yoksayar
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
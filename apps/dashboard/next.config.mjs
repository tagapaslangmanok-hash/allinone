/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@manok/shared", "@manok/database"],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;

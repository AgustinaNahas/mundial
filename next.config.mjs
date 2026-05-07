/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  assetPrefix: "/mundial",
  images: {
    unoptimized: true,
  },
  basePath: "/mundial",
}

export default nextConfig

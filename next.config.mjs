/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    domains: ['www.gorillatix.com','firebasestorage.googleapis.com','lh3.googleusercontent.com'],
  },
}

export default nextConfig

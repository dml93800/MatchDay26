/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    domains: ['flagcdn.com', 'images.pexels.com'],
  },
}
module.exports = nextConfig
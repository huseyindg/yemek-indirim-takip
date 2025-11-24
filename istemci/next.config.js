/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'getir.com',
      'yemeksepeti.com',
      'trendyol.com',
      'migros.com.tr',
    ],
  },
  reactStrictMode: true,
  output: 'standalone',
}

module.exports = nextConfig

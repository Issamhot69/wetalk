/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:9000',
    NEXT_PUBLIC_AI_URL: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000',
  },
}

export default nextConfig

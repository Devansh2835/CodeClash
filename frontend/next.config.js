/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config) => {
    // Handle .ttf files for Monaco Editor
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    });
    
    return config;
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  
  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  },
};

module.exports = nextConfig;
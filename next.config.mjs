/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
  cacheComponents: true,
  webpack: (config, { isServer }) => {
    // Exclude problematic modules from server-side bundling
    if (isServer) {
      config.externals.push({
        '@xenova/transformers': 'commonjs @xenova/transformers',
      })
    }

    // Ensure proper resolution for transformers.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    }

    return config
  },
}

export default nextConfig

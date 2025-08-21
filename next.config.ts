import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['@e2b/code-interpreter']
  },
  // Handle unhandled promise rejections
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add global error handler for unhandled rejections
      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Don't exit the process, just log the error
      });
    }
    return config;
  }
};

export default nextConfig;

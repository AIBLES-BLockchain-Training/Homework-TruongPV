/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignore optional dependencies and connectors that are not used
    config.externals.push(
      'pino-pretty', 
      'lokijs', 
      'encoding',
      'porto/internal',
      '@base-org/account',
      '@gemini-wallet/core',
    )
    
    // Fallback for optional modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'porto/internal': false,
      '@base-org/account': false,
      '@gemini-wallet/core': false,
    }
    
    return config
  },
  // Suppress hydration warnings in development (optional)
  reactStrictMode: true,
}

module.exports = nextConfig

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude 'couchbase' from the Webpack bundle
      config.externals = [...(config.externals || []), "couchbase"];
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:4000/:path*', // Proxy requests to the auth server
      },
    ];
  },
};

export default nextConfig;

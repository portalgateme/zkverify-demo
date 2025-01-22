import CopyPlugin from "copy-webpack-plugin";


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: { appDir: true },
  webpack(config) {
    config.resolve.fallback = { 
      fs: false,
      path: false,
      crypto: false
    };

    config.resolve.mainFields = ['browser', 'module', 'main'];

    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: 'static/wasm/[name][ext]'
      }
    });
    config.experiments = { ...config.experiments, topLevelAwait: true, asyncWebAssembly: true, syncWebAssembly: true,layers: true }
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: "node_modules/@aztec/bb.js/dest/node/barretenberg_wasm/barretenberg-threads.wasm",
            to: ".",
          },
        ],
      }),
    );
    return config
  },
  images: {
    domains: ['assets.coingecko.com'],
  },
  transpilePackages: ['@mui/x-charts'],
}

export default nextConfig

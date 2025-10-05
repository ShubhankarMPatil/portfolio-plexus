import glsl from "vite-plugin-glsl";

const nextConfig = {
  experimental: { appDir: true },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      use: ["raw-loader"],
    });
    return config;
  },
};

export default nextConfig;

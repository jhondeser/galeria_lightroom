import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/image/**',
      },
    ],
    unoptimized: false,
  },
  
  // 📌 AÑADE ESTA LÍNEA para Turbopack
  turbopack: {},
  
  // 📌 COMENTA o ELIMINA la configuración de webpack
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       fs: false,
  //       path: false,
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;
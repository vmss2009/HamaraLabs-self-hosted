import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        // Disables ESLint during the build process
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "ojsrvhlznablyjctmvmq.supabase.co",
            },
        ],
    },
};

export default nextConfig;

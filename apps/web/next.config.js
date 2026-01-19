// PWA Support currently disabled for Next.js 16 compatibility
/** @type {import('next').NextConfig} */
// Force Railway Build Trigger: Update to Latest Stack
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    typescript: {
        ignoreBuildErrors: true,
    },
};

// module.exports = withPWA(nextConfig);
module.exports = nextConfig;

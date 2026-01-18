// PWA Support currently disabled for Next.js 16 compatibility

const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    typescript: {
        ignoreBuildErrors: true,
    },
};

// module.exports = withPWA(nextConfig);
module.exports = nextConfig;

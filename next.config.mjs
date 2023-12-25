/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
    images: {
        domains: ["lh3.googleusercontent.com"],
    },
    async headers() {
        return [
          {
            // Apply these headers to all routes in your application.
            source: '/:path*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-cache, no-store, must-revalidate',
              },
            ],
          },
        ];
      },
};

export default config;

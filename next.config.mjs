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
    // set serverless functions timeout to 1 minute
    // https://vercel.com/docs/platform/limits#serverless-function-timeout
    serverRuntimeConfig:{
        setTimeout: 60
    }
};

export default config;

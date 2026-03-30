/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    JWT_SECRET:   process.env.JWT_SECRET,
  },
};
module.exports = nextConfig;

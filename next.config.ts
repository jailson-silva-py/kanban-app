import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images:{

    remotePatterns:[new URL('https://lh3.googleusercontent.com/**'), new URL("https://res.cloudinary.com/**")]

  },
};

export default nextConfig;

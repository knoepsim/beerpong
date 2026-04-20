import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@mikro-orm/core",
    "@mikro-orm/postgresql",
    "@mikro-orm/knex",
  ],
  transpilePackages: ["@beerpong/db"],
};

export default nextConfig;

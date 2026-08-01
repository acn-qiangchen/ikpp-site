import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_EXPORT=true is set by the GitHub Actions workflow for S3/CloudFront.
  // Vercel runs Next.js natively so this stays unset there.
  ...(process.env.NEXT_EXPORT === "true" && { output: "export" }),
};

export default nextConfig;

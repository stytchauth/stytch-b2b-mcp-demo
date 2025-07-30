/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper external packages handling
  serverExternalPackages: ['pg'],
};

export default nextConfig;

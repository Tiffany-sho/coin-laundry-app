export default {
  experimental: {
    optimizePackageImports: [
      "@chakra-ui/react",
      "react-icons",
      "react",
      "next",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hhdipgftsrsmmuqyifgt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images:{
    remotePatterns:[
      {
        protocol:'https',
        hostname:"res.cloudinary.com",        
      }
    ]
  }
};

export default nextConfig;

//When you gonna neeed request body up to more 10mb
//https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 청첩장 캔버스는 최대 460px입니다. 원본도 1066px이라
    // 기본값(최대 3840w)까지 후보를 늘어놓을 이유가 없습니다.
    // 3배 해상도 폰까지 충분히 덮으면서 preload srcset을 짧게 유지합니다.
    deviceSizes: [640, 750, 828, 1080, 1440],
    imageSizes: [128, 256, 384],
    formats: ["image/webp"],
  },
};

export default nextConfig;

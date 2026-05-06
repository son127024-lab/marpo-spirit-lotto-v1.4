/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // 🚩 이 줄이 들어가야 빌드 시 'out' 폴더가 생성됩니다!
  images: {
    unoptimized: true,   // 정적 익스포트 시 익스포트 에러를 방지하기 위해 필수입니다.
  },
};

module.exports = nextConfig;
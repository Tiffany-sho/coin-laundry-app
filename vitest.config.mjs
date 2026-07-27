import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    // jsconfig.json の paths と揃える
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,jsx,mjs}"],
    // アプリのロジックは JST (UTC+9) 前提で書かれているため、
    // 実行マシンのタイムゾーンに関係なくテストが決定的になるよう固定する。
    env: {
      TZ: "Asia/Tokyo",
    },
  },
});

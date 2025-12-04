import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: 'esm',
  target: 'es2022',
  platform: 'neutral',
  dts: true,
  fixedExtension: false,
});

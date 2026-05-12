import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".mjs",
    };
  },
  external: [
    "react",
    "react-native",
    "react-native-get-random-values",
    "base-64",
    "@quonfig/react",
    "@quonfig/javascript",
  ],
  minify: false,
  sourcemap: true,
  treeshake: true,
  splitting: false,
});

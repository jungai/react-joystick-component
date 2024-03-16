import { defineConfig } from "tsup";

export default defineConfig({
  name: "react-joystick",
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  outDir: "dist",
  clean: true,
  sourcemap: true,
  treeshake: true,
  dts: true,
  minify: true,
  external: ["react", "react-dom"],
});

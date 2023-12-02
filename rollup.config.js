import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "./packages/cdn.js",
    treeshake: "smallest",
    output: [
      {
        file: "./dist/cdn.bundle.min.js",
        format: "iife",
        name: "nui",
      },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs({
        include: /node_modules/,
        requireReturnsDefault: "auto", // <---- this solves default issue
      }),
      terser(),
    ],
  },
  {
    input: "./packages/cdn.js",
    treeshake: "smallest",
    external: ["@popperjs/core"],
    output: [
      {
        file: "./dist/cdn.min.js",
        format: "iife",
        name: "nui",
        globals: {
          "@popperjs/core": "Popper",
        },
      },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: false }),
      commonjs({
        include: /node_modules/,
        requireReturnsDefault: "auto", // <---- this solves default issue
      }),
      terser(),
    ],
  },
];

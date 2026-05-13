import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(rootDirectory, "dist");
const distAssetsDirectory = path.join(distDirectory, "assets");

function ignoreCssImports() {
  return {
    name: "ignore-css-imports",
    resolveId(source, importer) {
      if (!source.endsWith(".css") || !importer) return null;
      return path.resolve(path.dirname(importer), source);
    },
    load(id) {
      if (!id.endsWith(".css")) return null;
      return "";
    }
  };
}

function copyStaticAssets() {
  return {
    name: "copy-static-assets",
    async buildStart() {
      await rm(distDirectory, { recursive: true, force: true });
      await mkdir(distAssetsDirectory, { recursive: true });
    },
    async closeBundle() {
      await cp(path.join(rootDirectory, "public", "assets"), distAssetsDirectory, {
        force: true,
        recursive: true
      });
      await cp(path.join(rootDirectory, "src", "styles.css"), path.join(distAssetsDirectory, "app.css"), {
        force: true
      });

      const sourceHtml = await readFile(path.join(rootDirectory, "index.html"), "utf8");
      const productionHtml = sourceHtml
        .replace(
          '    <script type="module" src="/src/main.tsx"></script>',
          '    <script type="module" src="/assets/app.js"></script>'
        )
        .replace("  </head>", '    <link rel="stylesheet" href="/assets/app.css" />\n  </head>');

      await writeFile(path.join(distDirectory, "index.html"), productionHtml);
    }
  };
}

export default {
  input: "src/main.tsx",
  output: {
    dir: "dist/assets",
    format: "esm",
    entryFileNames: "app.js",
    chunkFileNames: "[name].js",
    assetFileNames: "[name][extname]",
    sourcemap: false
  },
  plugins: [
    copyStaticAssets(),
    ignoreCssImports(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    nodeResolve({ browser: true }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      noEmit: false,
      sourceMap: false
    }),
    terser({
      compress: {
        passes: 2
      },
      format: {
        comments: false
      }
    })
  ]
};

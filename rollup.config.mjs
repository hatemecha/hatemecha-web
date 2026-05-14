import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
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

function replaceRequired(source, pattern, replacement, description) {
  const replaced = source.replace(pattern, replacement);

  if (replaced === source) {
    throw new Error(`Could not update production HTML: missing ${description}.`);
  }

  return replaced;
}

function buildProductionHtml(sourceHtml) {
  const htmlWithEntryScript = replaceRequired(
    sourceHtml,
    /<script\b(?=[^>]*\btype=(["'])module\1)(?=[^>]*\bsrc=(["'])\/src\/main\.tsx\2)[^>]*>\s*<\/script>/,
    '    <script type="module" src="/assets/app.js"></script>',
    "source entry script"
  );

  return replaceRequired(
    htmlWithEntryScript,
    /<\/head>/i,
    '    <link rel="stylesheet" href="/assets/app.css" />\n  </head>',
    "closing head tag"
  );
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

      const galleryDirectory = path.join(rootDirectory, "public", "galeria");
      const galleryExists = await stat(galleryDirectory)
        .then((stats) => stats.isDirectory())
        .catch(() => false);

      if (galleryExists) {
        await cp(galleryDirectory, path.join(distDirectory, "galeria"), {
          force: true,
          recursive: true
        });
      }

      await cp(path.join(rootDirectory, "src", "styles.css"), path.join(distAssetsDirectory, "app.css"), {
        force: true
      });

      const sourceHtml = await readFile(path.join(rootDirectory, "index.html"), "utf8");
      const productionHtml = buildProductionHtml(sourceHtml);

      await writeFile(path.join(distDirectory, "index.html"), productionHtml);
    }
  };
}

export default {
  input: "src/main.tsx",
  onwarn(warning, warn) {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.id?.includes("node_modules")) {
      return;
    }

    warn(warning);
  },
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

import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const rootRealPath = await realpath(rootDirectory);
const host = process.env.HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".png", "image/png"]
]);

function getContentType(filePath) {
  return contentTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

function assertPathInsideRoot(filePath) {
  const relativePath = path.relative(rootRealPath, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Requested path is outside the preview directory.");
  }
}

function getSafePath(url) {
  const requestedPath = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const normalizedPath = requestedPath === "/" ? "/index.html" : requestedPath;
  const filePath = path.resolve(rootRealPath, `.${normalizedPath}`);

  assertPathInsideRoot(filePath);
  return filePath;
}

const server = createServer(async (request, response) => {
  try {
    const filePath = getSafePath(request.url ?? "/");
    const fileStat = await stat(filePath);
    const finalPath = fileStat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const finalRealPath = await realpath(finalPath);
    assertPathInsideRoot(finalRealPath);

    const body = await readFile(finalRealPath);

    response.writeHead(200, { "Content-Type": getContentType(finalPath) });
    response.end(body);
  } catch {
    try {
      const fallbackPath = path.join(rootRealPath, "404.html");
      assertPathInsideRoot(await realpath(fallbackPath));
      const body = await readFile(fallbackPath);
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  }
});

server.listen(port, host, () => {
  console.log(`Preview ready at http://${host}:${port}`);
});

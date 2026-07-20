import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = "127.0.0.1";
const port = 4173;
const base = `http://${host}:${port}/`;

function waitForPreview(child, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Preview server timed out")), timeoutMs);
    const onData = (chunk) => {
      const text = String(chunk);
      process.stdout.write(text);
      if (text.includes("Preview ready")) {
        clearTimeout(timer);
        child.stdout?.off("data", onData);
        child.stderr?.off("data", onData);
        resolve(undefined);
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Preview exited early with code ${code}`));
    });
  });
}

const preview = spawn(process.execPath, [path.join(rootDirectory, "scripts", "preview.mjs")], {
  cwd: rootDirectory,
  env: { ...process.env, HOST: host, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  await waitForPreview(preview);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(base, { waitUntil: "networkidle" });
  const homeTitle = await page.title();
  if (!homeTitle.toLowerCase().includes("hatemecha")) {
    throw new Error(`Unexpected home title: ${homeTitle}`);
  }

  await page.getByRole("button", { name: "Abrir menú" }).first().click();
  await page.waitForTimeout(500);
  if (!page.url().includes("#/menu")) {
    throw new Error(`Menu did not update hash. URL: ${page.url()}`);
  }

  await page.goto(`${base}#/galeria`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const gallery = await page.evaluate(() => ({
    view: document.querySelector("[data-view]")?.getAttribute("data-view"),
    title: document.title,
    tiles: document.querySelectorAll("[data-gallery-tile]").length
  }));

  if (gallery.view !== "gallery" || gallery.tiles < 1) {
    throw new Error(`Gallery smoke failed: ${JSON.stringify(gallery)}`);
  }

  await browser.close();
  console.log("smoke: ok");
} finally {
  preview.kill("SIGTERM");
}

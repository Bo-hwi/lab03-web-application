import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const port = 5176;
const baseURL = `http://127.0.0.1:${port}`;
const vitePath = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const playwrightPath = fileURLToPath(new URL("../node_modules/playwright/cli.js", import.meta.url));
const server = spawn(process.execPath, [vitePath, "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  stdio: ["ignore", "ignore", "inherit"],
  windowsHide: true,
});

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Vite exited with code ${server.exitCode}`);
    try {
      const response = await fetch(`${baseURL}/`);
      if (response.ok) return;
    } catch {
      // Vite has not bound the local port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Vite did not start within 30 seconds");
}

try {
  await waitForServer();
  const exitCode = await new Promise((resolve, reject) => {
    const runner = spawn(process.execPath, [playwrightPath, "test", ...process.argv.slice(2)], {
      stdio: "inherit",
      env: { ...process.env, E2E_BASE_URL: baseURL },
      windowsHide: true,
    });
    runner.once("error", reject);
    runner.once("exit", (code) => resolve(code ?? 1));
  });
  process.exitCode = exitCode;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server.exitCode === null) {
    const stopped = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await Promise.race([stopped, new Promise((resolve) => setTimeout(resolve, 5_000))]);
  }
}

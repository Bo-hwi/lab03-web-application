import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function captureLayoutEvidence(page, browser, directory, name) {
  const measurements = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerHeight: window.innerHeight,
  }));
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: join(directory, `${name}.png`), fullPage: true });
  const evidence = {
    observedAt: new Date().toISOString(),
    browser: `Chromium ${browser.version()}`,
    page: page.url(),
    measurements,
    screenshot: `${name}.png`,
    method: "Playwright Chromium browser measurement and full-page screenshot",
  };
  await writeFile(join(directory, `${name}.json`), `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  return evidence;
}

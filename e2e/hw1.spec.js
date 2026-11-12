import { expect, test } from "@playwright/test";
import { captureLayoutEvidence } from "./evidence.js";

test("HW1 physical keys, repeat guard, editable isolation and pad feedback", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const studio = page.getByRole("region", { name: "Drum Kit" });
  const pads = studio.getByRole("button");
  await expect(pads).toHaveCount(7);
  for (const key of ["W", "A", "S", "D", "J", "K", "L"]) {
    await expect(studio.getByRole("button", { name: new RegExp(`key ${key}$`) })).toBeVisible();
  }

  const kick = studio.getByRole("button", { name: "Kick, key W" });
  await page.keyboard.down("w");
  await expect(kick).toHaveAttribute("aria-pressed", "true");
  await expect(studio.getByText("Last hit: Kick (W). 1 recent hits shown.")).toBeVisible();
  await page.keyboard.down("w");
  await expect(studio.locator("ol li")).toHaveCount(1);
  await page.keyboard.up("w");
  await expect(kick).toHaveAttribute("aria-pressed", "false");

  await page.getByLabel("Find a squad").focus();
  await page.keyboard.press("w");
  await expect(studio.locator("ol li")).toHaveCount(1);
  await expect(page.getByLabel("Find a squad")).toHaveValue("w");

  await kick.focus();
  await page.keyboard.press("Enter");
  await expect(studio.locator("ol li")).toHaveCount(2);
  await expect(studio.getByRole("meter", { name: "Hit level" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("HW1 layout and screenshot are measured at 375px", async ({ page, browser }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const studio = page.getByRole("region", { name: "Drum Kit" });
  await expect(studio.getByRole("button")).toHaveCount(7);
  const evidence = await captureLayoutEvidence(page, browser, "docs/hw1/evidence", "hw1-375");
  expect(evidence.measurements.innerWidth).toBe(375);
  expect(evidence.measurements.documentScrollWidth).toBeLessThanOrEqual(375);
  expect(errors).toEqual([]);
});

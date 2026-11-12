import { expect, test } from "@playwright/test";
import { captureLayoutEvidence } from "./evidence.js";

test("HW3 layout is measured and captured at 375px", async ({ page, browser }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /PVS Finals/ })).toBeVisible();

  const evidence = await captureLayoutEvidence(page, browser, "docs/hw3/evidence", "hw3-375");
  expect(evidence.measurements.innerWidth).toBe(375);
  expect(evidence.measurements.documentScrollWidth).toBeLessThanOrEqual(375);
  expect(errors).toEqual([]);
});

test("HW3 claims roll back a conflict and filters update", async ({ page }) => {
  await page.goto("/");
  const ticket = page.getByRole("article", { name: "PVS Grand Finals VIP Ticket" });
  const stock = ticket.locator("dd").nth(1);
  const button = ticket.getByRole("button", { name: "Claim PVS Grand Finals VIP Ticket" });
  await expect(stock).toHaveText("2");
  await button.click();
  await expect(stock).toHaveText("1");
  await expect(ticket.getByText("Claim confirmed.")).toBeVisible();
  await button.click();
  await expect(ticket.getByText("Server stock was sold out. Local stock restored.")).toBeVisible();
  await expect(stock).toHaveText("1");

  await page.getByLabel("Find a squad").fill("Cerberus");
  await expect(page.getByText("1 squads shown")).toBeVisible();
  await page.getByLabel("Show squad").selectOption("ces");
  await expect(page.locator("section[aria-labelledby='pvs-feed-title'] li")).toHaveCount(1);
});

test("HW3 crate opens after its real 20-second countdown", async ({ page }) => {
  await page.goto("/");
  const crate = page.getByRole("article", { name: "5,000 G-Coin Contraband Crate" });
  await expect(crate.locator("output[data-phase]")).toHaveAttribute("data-phase", "WARMUP");
  await expect(crate.locator("output[data-phase]")).toHaveAttribute("data-phase", "AIRDROP_LIVE", { timeout: 24_000 });
  await expect(crate.getByRole("button", { name: "Claim 5,000 G-Coin Contraband Crate" })).toBeEnabled();
});

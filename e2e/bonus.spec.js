import { expect, test } from "@playwright/test";
import { captureLayoutEvidence } from "./evidence.js";

test("bonus layout is measured and captured at 375px", async ({ page, browser }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/bonus.html");
  await expect(page.getByRole("heading", { name: "Hẹn Hò Nhưng Không Yêu" })).toBeVisible();

  const evidence = await captureLayoutEvidence(page, browser, "docs/bonus/evidence", "bonus-375");
  expect(evidence.measurements.innerWidth).toBe(375);
  expect(evidence.measurements.documentScrollWidth).toBeLessThanOrEqual(375);
  expect(errors).toEqual([]);
});

test("bonus ghost timeout, early reply and effort controls work in Chromium", async ({ page }) => {
  await page.goto("/bonus.html");
  await page.getByRole("button", { name: "Gửi tin nhắn" }).click();
  await expect(page.getByText("Seen không rep. Đã thoát và hủy chờ.")).toBeVisible({ timeout: 7_000 });
  await expect(page.getByRole("button", { name: "Bắt đầu lại" })).toBeVisible();

  await page.getByRole("button", { name: "Bắt đầu lại" }).click();
  await page.getByRole("button", { name: "Bắt đầu hẹn hò" }).click();
  await page.getByRole("button", { name: "Gửi tin nhắn" }).click();
  await page.getByRole("button", { name: "Đã nhận hồi âm" }).click();
  await page.waitForTimeout(5_200);
  await expect(page.getByRole("button", { name: "Cùng cam kết" })).toBeEnabled();
  await page.getByRole("button", { name: "Cùng cam kết" }).click();
  await expect(page.getByText("Cùng cam kết", { exact: true })).toBeVisible();

  await page.getByLabel("Số bước").fill("10");
  await page.getByRole("button", { name: "Ghi tín hiệu" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "10 bước × 0.1" })).toBeVisible();
  await page.getByRole("button", { name: "Dừng lại" }).click();
  await expect(page.getByRole("button", { name: "Bắt đầu lại" })).toBeVisible();
});

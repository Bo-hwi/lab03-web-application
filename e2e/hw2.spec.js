import { expect, test } from "@playwright/test";

test("HW2 integrated keyboard records and replays a note in Chromium", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const piano = page.getByRole("region", { name: /88-Key Polyphonic Piano/ });
  const keys = piano.locator("button[data-midi]");
  await expect(keys).toHaveCount(88);
  await expect(piano.getByRole("button", { name: "Play A0" })).toHaveAttribute("data-midi", "21");
  await expect(piano.getByRole("button", { name: "Play C8" })).toHaveAttribute("data-midi", "108");

  await piano.getByRole("button", { name: "Record", exact: true }).click();
  const a4 = piano.getByRole("button", { name: "Play A4" });
  await a4.focus();
  await page.keyboard.down("Enter");
  await expect(a4).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(100);
  await page.keyboard.up("Enter");
  await expect(a4).toHaveAttribute("aria-pressed", "false");
  await piano.getByRole("button", { name: "Stop recording" }).click();
  await expect(piano.getByText("Recorded 1 notes.")).toBeVisible();
  await piano.getByLabel("Replay speed").selectOption("2");
  await piano.getByRole("button", { name: "Play", exact: true }).click();
  await expect(piano.getByText(/Playback finished at/)).toBeVisible();
  expect(errors).toEqual([]);
});

import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const version = readFileSync("../pyproject.toml", "utf8").match(/^version = "([^"]+)"/m)[1];

test("opens examples.ipynb by default and runs it with the Pyodide kernel", async ({
  page,
}, testInfo) => {
  const wheels = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().includes("/pypi/ipyregulartable-") && response.status() === 200)
      wheels.push(response.url());
  });
  await page.goto("/lite/");
  await expect(page.getByRole("tab", { name: /examples.ipynb/ })).toBeVisible({ timeout: 120_000 });
  const notebook = page.locator(".jp-NotebookPanel:visible .jp-Notebook");
  await expect(notebook).toBeVisible({ timeout: 120_000 });
  await expect(
    page.getByRole("button", { name: "Python (Pyodide) | Idle", exact: true }),
  ).toBeVisible({ timeout: 120_000 });
  if (testInfo.project.name === "firefox-no-jspi") {
    const worker = page.workers().find((worker) => worker.url().includes("comlink.worker"));
    expect(await worker.evaluate(() => typeof WebAssembly.Suspending)).toBe("undefined");
  }
  await notebook.locator(".jp-Cell").first().click();
  await page.getByRole("menuitem", { name: "Run", exact: true }).click();
  await page.getByRole("menuitem", { name: "Run All Cells", exact: true }).click();
  await expect(notebook.getByText(`ipyregulartable ${version}`, { exact: true })).toBeVisible({
    timeout: 240_000,
  });

  const clickTable = notebook
    .locator(".jp-CodeCell")
    .filter({ hasText: "click_table = rt.RegularTableWidget" })
    .locator("spaday-regular-table");
  await expect(clickTable.locator("regular-table td").first()).toBeVisible({ timeout: 60_000 });
  const styled = notebook
    .locator(".jp-CodeCell")
    .filter({ hasText: "styled_table = rt.RegularTableWidget" })
    .locator("spaday-regular-table");
  await expect(styled).toHaveCSS("height", "500px");
  await expect(styled.locator("regular-table th").first()).toHaveCSS("color", "rgb(255, 255, 255)");
  const frame = notebook
    .locator(".jp-CodeCell")
    .filter({ hasText: "frame_table = rt.RegularTableWidget" })
    .locator("regular-table td");
  await expect(frame.filter({ hasText: "AAPL" })).toBeVisible();
  const series = notebook
    .locator(".jp-CodeCell")
    .filter({ hasText: "series_table = rt.RegularTableWidget" })
    .locator("regular-table td");
  await expect(series.filter({ hasText: "MSFT" })).toBeVisible();
  await clickTable.locator("regular-table td").first().click();
  await expect(notebook.getByText("clicked: (0,0)", { exact: true })).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Python (Pyodide) | Idle", exact: true }),
  ).toBeVisible();
  await expect(notebook.locator(".jp-OutputArea-error")).toHaveCount(0);
  const stderr = await notebook
    .locator('[data-mime-type="application/vnd.jupyter.stderr"]')
    .allTextContents();
  expect(stderr.filter((text) => /Error|Traceback/.test(text))).toEqual([]);
  expect(errors).toEqual([]);
  expect(wheels.some((url) => url.includes(`ipyregulartable-${version}-`))).toBe(true);
});

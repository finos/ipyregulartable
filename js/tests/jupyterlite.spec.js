import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const version = readFileSync("../pyproject.toml", "utf8").match(/^version = "([^"]+)"/m)[1];

for (const example of ["click_events", "styling"]) {
  test(`${example} runs in JupyterLite with the freshly built wheel`, async ({ page }) => {
    const wheels = [];
    page.on("response", (response) => {
      if (response.url().includes("/pypi/ipyregulartable-") && response.status() === 200)
        wheels.push(response.url());
    });
    await page.goto(`/lite/lab/index.html?path=${example}.ipynb`);
    const notebook = page.locator(".jp-NotebookPanel:visible .jp-Notebook");
    await expect(notebook).toBeVisible({ timeout: 180_000 });
    await notebook.locator(".jp-Cell").first().click();
    const count = await notebook.locator(".jp-Cell").count();
    for (let i = 0; i < count; i++) await page.keyboard.press("Shift+Enter");
    await expect(notebook.getByText(`ipyregulartable ${version}`, { exact: true })).toBeVisible({
      timeout: 240_000,
    });
    const table = notebook.locator("spaday-regular-table");
    await expect(table.locator("regular-table td").first()).toBeVisible({ timeout: 60_000 });
    if (example === "click_events") {
      await table.locator("regular-table td").first().click();
      await expect(notebook.getByText("clicked: (0,0)", { exact: true })).toBeVisible();
      const cell = notebook.locator(".jp-CodeCell .cm-content").last();
      await cell.fill(
        [
          "from IPython.display import display",
          "import pandas as pd",
          "display(rt.RegularTableWidget(pd.DataFrame({'symbol': ['Pandas frame'], 'price': [12.5]})))",
          "display(rt.RegularTableWidget(pd.Series(['Pandas series'], name='symbol')))",
        ].join("\n"),
      );
      await page.keyboard.press("Shift+Enter");
      await expect(
        notebook.locator("regular-table td").filter({ hasText: "Pandas frame" }),
      ).toBeVisible();
      await expect(
        notebook.locator("regular-table td").filter({ hasText: "Pandas series" }),
      ).toBeVisible();
    } else {
      await expect(table).toHaveCSS("height", "500px");
      await expect(table.locator("regular-table th").first()).toHaveCSS(
        "color",
        "rgb(255, 255, 255)",
      );
    }
    await expect(
      page.getByRole("button", { name: "Python (Pyodide) | Idle", exact: true }),
    ).toBeVisible();
    await expect(notebook.locator(".jp-OutputArea-error")).toHaveCount(0);
    const stderr = await notebook
      .locator('[data-mime-type="application/vnd.jupyter.stderr"]')
      .allTextContents();
    expect(stderr.filter((text) => /Error|Traceback/.test(text))).toEqual([]);
    expect(wheels.some((url) => url.includes(`ipyregulartable-${version}-`))).toBe(true);
  });
}

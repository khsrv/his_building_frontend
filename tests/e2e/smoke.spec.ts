import { expect, test } from "@playwright/test";

test("public home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Frontend Starter")).toBeVisible();
});

test("dashboard route redirects unauthenticated user to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

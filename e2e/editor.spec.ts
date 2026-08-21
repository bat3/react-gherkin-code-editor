import { expect, test } from "@playwright/test";

// Helper to normalize Monaco non-breaking spaces (\u00a0) to regular spaces
function normalizeSpaces(text: string): string {
	return text.replace(/\u00a0/g, " ");
}

test.describe("Gherkin Code Editor E2E Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector(".monaco-editor");
	});

	test("should render page heading and editor component", async ({ page }) => {
		await expect(page.locator("h3")).toHaveText("Give me a Gherkin");
		await expect(page.locator(".monaco-editor")).toBeVisible();

		// Check initial editor content contains expected keywords and feature title
		const rawText = await page.locator(".monaco-editor").innerText();
		const editorText = normalizeSpaces(rawText);

		expect(editorText).toContain("Feature: Calculator");
		expect(editorText).toContain("Scenario: Add two numbers");
		expect(editorText).toContain("Scenario Outline: Add two numbers");
	});

	test("should apply syntax highlighting token classes and styles", async ({
		page,
	}) => {
		// Keywords like "Feature:" are styled with bold class mtkb and theme color (#7dd956 / rgb(125, 217, 86))
		const keywordSpan = page
			.locator(".monaco-editor .view-line .mtkb", { hasText: "Feature:" })
			.first();
		await expect(keywordSpan).toBeVisible();

		const color = await keywordSpan.evaluate(
			(el) => window.getComputedStyle(el).color,
		);
		expect(color).toBe("rgb(125, 217, 86)");
	});

	test('should format Gherkin text when clicking "Format my Gherkin !"', async ({
		page,
	}) => {
		const formatBtn = page.getByRole("button", { name: "Format my Gherkin !" });
		await expect(formatBtn).toBeVisible();

		// Click format button
		await formatBtn.click();
		await page.waitForTimeout(500);

		// Verify editor content table lines are aligned with proper padding
		const rawText = await page.locator(".monaco-editor").innerText();
		const editorText = normalizeSpaces(rawText);

		expect(editorText).toContain("| First | Second | Result |");
		expect(editorText).toContain("| 50    | 70     | 120    |");
	});

	test('should toggle dark theme when clicking "Dark"', async ({ page }) => {
		const darkBtn = page.getByRole("button", { name: "Dark" });
		await expect(darkBtn).toBeVisible();

		// Before clicking, theme is light (vs)
		await expect(page.locator(".monaco-editor")).toHaveClass(/vs(?!\-dark)/);

		// Click "Dark"
		await darkBtn.click();

		// After clicking, theme changes to vs-dark
		await expect(page.locator(".monaco-editor")).toHaveClass(/vs-dark/);
	});

	test("should copy editor content to clipboard", async ({ page, context }) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		const copyBtn = page.getByRole("button", { name: "copy to clipboard" });
		await expect(copyBtn).toBeVisible();

		await copyBtn.click();

		const clipboardContent = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(clipboardContent).toContain("Feature: Calculator");
		expect(clipboardContent).toContain("Scenario: Add two numbers");
	});

	test("should toggle editor container size", async ({ page }) => {
		const toggleBtn = page.getByRole("button", { name: "Toggle size" });
		await expect(toggleBtn).toBeVisible();

		const container = page.locator(".monaco-editor").locator("..");
		const initialBox = await container.boundingBox();
		expect(initialBox).not.toBeNull();

		// Click "Toggle size" to shrink
		await toggleBtn.click();
		await page.waitForTimeout(300);

		const shrunkBox = await container.boundingBox();
		expect(shrunkBox).not.toBeNull();
		if (initialBox && shrunkBox) {
			expect(shrunkBox.width).toBeLessThan(initialBox.width);
		}

		// Click "Toggle size" again to restore
		await toggleBtn.click();
		await page.waitForTimeout(300);

		const restoredBox = await container.boundingBox();
		expect(restoredBox).not.toBeNull();
		if (initialBox && restoredBox) {
			expect(restoredBox.width).toBeCloseTo(initialBox.width, -1);
		}
	});

	test("should allow typing new Gherkin steps in editor", async ({ page }) => {
		// Focus monaco editor textarea
		const textarea = page.locator(".monaco-editor textarea");
		await textarea.focus();

		// Select all and delete initial text
		await page.keyboard.press("ControlOrMeta+A");
		await page.keyboard.press("Backspace");

		// Type new content with delay
		await page.keyboard.type(
			"Feature: New E2E Feature\n\nScenario: Test Typing\nGiven I type step",
			{ delay: 20 },
		);
		await page.keyboard.press("Escape");

		const rawText = await page.locator(".monaco-editor").innerText();
		const editorText = normalizeSpaces(rawText);

		expect(editorText).toContain("Feature: New E2E Feature");
		expect(editorText).toContain("Given I type step");
	});
});

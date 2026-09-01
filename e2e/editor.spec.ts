import { expect, test } from "@playwright/test";

// Helper to normalize Monaco non-breaking spaces (\u00a0) to regular spaces
function normalizeSpaces(text: string): string {
	return text.replace(/\u00a0/g, " ");
}

test.describe("Gherkin Code Editor E2E Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector('[data-testid="gherkin-editor"] .monaco-editor');
	});

	test("should render page heading and editor component", async ({ page }) => {
		await expect(page.locator("h3")).toHaveText("Give me a Gherkin");
		const editor = page.getByTestId("gherkin-editor");
		await expect(editor).toBeVisible();

		// Check initial editor content contains expected keywords and feature title
		const rawText = await editor.innerText();
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
			.getByTestId("gherkin-editor")
			.locator(".view-line .mtkb", { hasText: "Feature:" })
			.first();
		await expect(keywordSpan).toBeVisible();

		const color = await keywordSpan.evaluate(
			(el) => window.getComputedStyle(el).color,
		);
		expect(color).toBe("rgb(125, 217, 86)");
	});

	test("should format Gherkin text when clicking format button", async ({
		page,
	}) => {
		const formatBtn = page.getByTestId("format-button");
		await expect(formatBtn).toBeVisible();

		// Click format button
		await formatBtn.click();
		await page.waitForTimeout(500);

		// Verify editor content table lines are aligned with proper padding
		const rawText = await page.getByTestId("gherkin-editor").innerText();
		const editorText = normalizeSpaces(rawText);

		expect(editorText).toContain("| First | Second | Result |");
		expect(editorText).toContain("| 50    | 70     | 120    |");
	});

	test("should toggle dark and light themes dynamically via theme prop", async ({
		page,
	}) => {
		const darkBtn = page.getByTestId("dark-theme-button");
		const lightBtn = page.getByTestId("light-theme-button");
		await expect(darkBtn).toBeVisible();
		await expect(lightBtn).toBeVisible();

		const monaco = page.getByTestId("gherkin-editor").locator(".monaco-editor");

		// Initially theme is light (vs)
		await expect(monaco).toHaveClass(/vs(?!\-dark)/);

		// Click "Dark"
		await darkBtn.click();
		await expect(monaco).toHaveClass(/vs-dark/);

		// Click "Light" to switch back dynamically
		await lightBtn.click();
		await expect(monaco).toHaveClass(/vs(?!\-dark)/);
	});

	test("should trigger onChange callback and update state when typing in editor", async ({
		page,
	}) => {
		const preview = page.getByTestId("content-preview");
		await expect(preview).toBeVisible();

		const initialPreviewText = await preview.innerText();

		const textarea = page
			.getByTestId("gherkin-editor")
			.locator(".monaco-editor textarea");
		await textarea.focus();

		// Type new text
		await page.keyboard.type("\n# additional comment");
		await page.waitForTimeout(200);

		const updatedPreviewText = await preview.innerText();
		expect(updatedPreviewText).not.toBe(initialPreviewText);
	});

	test("should respect readOnly prop toggle", async ({ page }) => {
		const readOnlyBtn = page.getByTestId("toggle-readonly-button");
		await expect(readOnlyBtn).toBeVisible();

		// Toggle readOnly on
		await readOnlyBtn.click();

		const preview = page.getByTestId("content-preview");
		const textBeforeTyping = await preview.innerText();

		const textarea = page
			.getByTestId("gherkin-editor")
			.locator(".monaco-editor textarea");
		await textarea.focus();

		// Attempt typing while readOnly
		await page.keyboard.type("Attempted edit when readOnly");
		await page.waitForTimeout(200);

		const textAfterTyping = await preview.innerText();
		// Content should remain unchanged because editor is readOnly
		expect(textAfterTyping).toBe(textBeforeTyping);
	});

	test("should copy editor content to clipboard", async ({ page, context }) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		const copyBtn = page.getByTestId("copy-button");
		await expect(copyBtn).toBeVisible();

		await copyBtn.click();

		const clipboardContent = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(clipboardContent).toContain("Feature: Calculator");
		expect(clipboardContent).toContain("Scenario: Add two numbers");
	});

	test("should toggle editor container size", async ({ page }) => {
		const toggleBtn = page.getByTestId("toggle-size-button");
		await expect(toggleBtn).toBeVisible();

		const container = page.getByTestId("gherkin-editor");
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
		const textarea = page
			.getByTestId("gherkin-editor")
			.locator(".monaco-editor textarea");
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

		const rawText = await page.getByTestId("gherkin-editor").innerText();
		const editorText = normalizeSpaces(rawText);

		expect(editorText).toContain("Feature: New E2E Feature");
		expect(editorText).toContain("Given I type step");
	});
});

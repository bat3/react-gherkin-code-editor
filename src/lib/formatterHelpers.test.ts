import {
	formatGherkinLines,
	formatGherkinString,
	removeMultipleSpaces,
} from "./formatterHelpers";
import { GherkinMonacoTokenAdapter } from "./GherkinMonacoTokenAdapter";

describe("formatGherkinLines", () => {
	const gherkinMonacoTokenAdapter = new GherkinMonacoTokenAdapter();
	test("should format Examples table correctly", () => {
		const input = [
			"Examples:",
			"|username|password|",
			"|john|pass123|",
			"|mary|pass456|",
		];

		const expected = [
			"\t\tExamples:",
			"\t\t\t| username | password |",
			"\t\t\t| john     | pass123  |",
			"\t\t\t| mary     | pass456  |",
		];

		expect(
			formatGherkinLines(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("should handle mixed content with tables", () => {
		const input = [
			"Scenario Outline: Login test",
			"    Given I am on login page",
			"Examples:",
			"|username|password|status|",
			"|john|pass123|success|",
			"|mary|pass456|failure|",
			"Scenario: Another test",
		];

		const expected = [
			"\tScenario Outline: Login test",
			"\t\tGiven I am on login page",
			"\t\tExamples:",
			"\t\t\t| username | password | status  |",
			"\t\t\t| john     | pass123  | success |",
			"\t\t\t| mary     | pass456  | failure |",
			"\tScenario: Another test",
		];

		expect(
			formatGherkinLines(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("should handle tags and comments level according to position", () => {
		const input = [
			"  @FeatureTag1 @FeatureTag2",
			"Feature: My first feature",
			"My feature description",
			"# The first example has two steps",
			"@mytag",
			"	Scenario: Add two numbers",
			"		Given I have entered 50 into the calculator",
			"# My comment",
			"	And I have entered 70 into the calculator",
			"	When I press add",
			"		Then the result should be 120 on the screen",
		];

		const expected = [
			"@FeatureTag1 @FeatureTag2",
			"Feature: My first feature",
			"\tMy feature description",
			"\t# The first example has two steps",
			"\t@mytag",
			"\tScenario: Add two numbers",
			"\t\tGiven I have entered 50 into the calculator",
			"\t\t# My comment",
			"\t\tAnd I have entered 70 into the calculator",
			"\t\tWhen I press add",
			"\t\tThen the result should be 120 on the screen",
		];

		expect(
			formatGherkinLines(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("should handle empty lines", () => {
		const input = ["Feature: Test feature", "", "Scenario: Test scenario"];

		const expected = ["Feature: Test feature", "", "\tScenario: Test scenario"];

		expect(
			formatGherkinLines(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("Test full scenario en", () => {
		const input = [
			"# The first example has two steps",
			"@mytag",
			"	Scenario: Add two numbers",
			"		Given I have entered 50 into the calculator",
			"# My comment",
			"	And I have entered 70 into the calculator",
			"	When I press add",
			"		Then the result should be 120 on the screen",
		];

		const expected = [
			"\t# The first example has two steps",
			"\t@mytag",
			"\tScenario: Add two numbers",
			"\t\tGiven I have entered 50 into the calculator",
			"\t\t# My comment",
			"\t\tAnd I have entered 70 into the calculator",
			"\t\tWhen I press add",
			"\t\tThen the result should be 120 on the screen",
		];

		expect(
			formatGherkinLines(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});
});

describe("formatGherkinString", () => {
	const gherkinMonacoTokenAdapter = new GherkinMonacoTokenAdapter();
	test("should format Gherkin strings correctly", () => {
		const input = "Feature: Test feature";

		const expected = "Feature: Test feature";

		expect(
			formatGherkinString(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("should handle mixed content", () => {
		const input = "Scenario Outline: Login test";

		const expected = "\tScenario Outline: Login test";

		expect(
			formatGherkinString(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("should handle comment", () => {
		const input = "   # A comment    ";

		const expected = "# A comment";

		expect(
			formatGherkinString(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("should handle tag", () => {
		const input = "   @ATag    ";

		const expected = "@ATag";

		expect(
			formatGherkinString(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});

	test("should handle empty lines", () => {
		const input = "";

		const expected = "";

		expect(
			formatGherkinString(
				input,
				gherkinMonacoTokenAdapter.getGherkinLanguageKeywords("en"),
			),
		).toEqual(expected);
	});
});

describe("removeMultipleSpaces", () => {
	test("removeMultipleSpaces", () => {
		expect(removeMultipleSpaces("  toto titi    tutu   ")).toBe(
			" toto titi tutu ",
		);
	});
});

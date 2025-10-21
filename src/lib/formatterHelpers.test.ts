import {
	formatGherkinLines,
	formatGherkinString,
	removeMultipleSpaces,
} from "./formatterHelpers";

describe("formatGherkinLines", () => {
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

		expect(formatGherkinLines(input)).toEqual(expected);
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

		expect(formatGherkinLines(input)).toEqual(expected);
	});

	test("should handle empty lines", () => {
		const input = ["Feature: Test feature", "", "Scenario: Test scenario"];

		const expected = ["Feature: Test feature", "", "\tScenario: Test scenario"];

		expect(formatGherkinLines(input)).toEqual(expected);
	});

	test("should format simple scenario", () => {
		const input = [
			"\tGiven I have entered 2 in the calculator",
			"And I have entered 2 into the calculator",
			"\tWhen I press add",
			"\t\t\tThen the result should be 4 on the screen",
		];

		const expected = [
			"Given I have entered 2 in the calculator",
			"And I have entered 2 into the calculator",
			"When I press add",
			"Then the result should be 4 on the screen",
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});
});

describe("formatGherkinString", () => {
	test("should format Gherkin strings correctly", () => {
		const input = "Feature: Test feature";

		const expected = "Feature: Test feature";

		expect(formatGherkinString(input)).toEqual(expected);
	});

	test("should handle mixed content", () => {
		const input = "Scenario Outline: Login test";

		const expected = "\tScenario Outline: Login test";

		expect(formatGherkinString(input)).toEqual(expected);
	});

	test("should handle empty lines", () => {
		const input = "";

		const expected = "";

		expect(formatGherkinString(input)).toEqual(expected);
	});
});

describe("removeMultipleSpaces", () => {
	test("removeMultipleSpaces", () => {
		expect(removeMultipleSpaces("  toto titi    tutu   ")).toBe(
			" toto titi tutu ",
		);
	});
});

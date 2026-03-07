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

	test("should format Feature with description", () => {
		// Test from https://cucumber.io/docs/gherkin/reference#feature
		const input = [
			"Feature: Guess the word",
			"",
			"The word guess game is a turn-based game for two players.",
			"The Maker makes a word for the Breaker to guess. The game",
			"is over when the Breaker guesses the Maker's word.",
			"",
			"Example: Maker starts a game",
		];

		const expected = [
			"Feature: Guess the word",
			"",
			"\tThe word guess game is a turn-based game for two players.",
			"\tThe Maker makes a word for the Breaker to guess. The game",
			"\tis over when the Breaker guesses the Maker's word.",
			"",
			"\tExample: Maker starts a game",
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});

	test("should format Feature with Rules", () => {
		// Test from https://cucumber.io/docs/gherkin/reference#rule
		const input = [
			"# -- FILE: features/gherkin.rule_example.feature",
			"Feature: Highlander",
			"",
  			"Rule: There can be only One",
			"",
			"Example: Only One -- More than one alive",
			"Given there are 3 ninjas",
			"And there are more than one ninja alive",
			"When 2 ninjas meet, they will fight",
			"Then one ninja dies (but not me)",
			"And there is one ninja less alive",
			"",
			"Example: Only One -- One alive",
			"Given there is only 1 ninja alive",
			"Then they will live forever ;-)",
			"",
  			"Rule: There can be Two (in some cases)",
			"",
    		"Example: Two -- Dead and Reborn as Phoenix",
		];

		const expected = [
			"# -- FILE: features/gherkin.rule_example.feature",
			"Feature: Highlander",
			"",
  			"\tRule: There can be only One",
			"",
			"\t\tExample: Only One -- More than one alive",
			"\t\t\tGiven there are 3 ninjas",
			"\t\t\tAnd there are more than one ninja alive",
			"\t\t\tWhen 2 ninjas meet, they will fight",
			"\t\t\tThen one ninja dies (but not me)",
			"\t\t\tAnd there is one ninja less alive",
			"",
			"\t\tExample: Only One -- One alive",
			"\t\t\tGiven there is only 1 ninja alive",
			"\t\t\tThen they will live forever ;-)",
			"",
  			"\tRule: There can be Two (in some cases)",
			"",
    		"\t\tExample: Two -- Dead and Reborn as Phoenix",
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});
});

describe("formatGherkinString", () => {
	test("should format Gherkin strings correctly", () => {
		const input = "Feature: Test feature";

		const expected = "Feature: Test feature";

		expect(formatGherkinString(input, {inFeature: false, inRule: false, inScenario:false})).toEqual(expected);
	});

	test("should handle mixed content", () => {
		const input = "Scenario Outline: Login test";

		const expected = "\tScenario Outline: Login test";

		expect(formatGherkinString(input, {inFeature: false, inRule: false, inScenario:false})).toEqual(expected);
	});

	test("should handle empty lines", () => {
		const input = "";

		const expected = "";

		expect(formatGherkinString(input, {inFeature: false, inRule: false, inScenario:false})).toEqual(expected);
	});
});

describe("removeMultipleSpaces", () => {
	test("removeMultipleSpaces", () => {
		expect(removeMultipleSpaces("  toto titi    tutu   ")).toBe(
			" toto titi tutu ",
		);
	});
});

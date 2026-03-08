import {
	formatGherkinLines,
	formatGherkinString,
	removeMultipleSpaces,
} from "./formatterHelpers";

describe("formatGherkinLines", () => {

	test("should handle mixed content with tables", () => {
		const input = [
			"Scenario Outline: Login test",
			"    Given I am on login page",
			"Examples:",
			"|username|password |status|",
			" |john|pass123|success|",
			"|mary|pass456|failure |",
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

	test("should format simple steps", () => {
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

	test("should format simple steps with examples", () => {
		const input = [
			"Given there are <start> cucumbers",
			"When I eat <eat> cucumbers",
			"Then I should have <left> cucumbers",
			"",
			"Examples:",
			"|start|eat|left|",
			"| 12 |   5 |                7 |",
			"|    20 |   5 |   15 |    "
		];

		const expected = [
			"Given there are <start> cucumbers",
			"When I eat <eat> cucumbers",
			"Then I should have <left> cucumbers",
			"",
			"Examples:",
			"\t| start | eat | left |",
			"\t| 12    | 5   | 7    |",
			"\t| 20    | 5   | 15   |"
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

	test("should format Feature with Background", () => {
		// Test from https://cucumber.io/docs/gherkin/reference#background
		const input = [
			"Feature: Multiple site support",
			"Only blog owners can post to a blog, except administrators,",
			" who can post to all blogs.",
			"",
			"Background:",
			"Given a global administrator named \"Greg\"",
			"And a blog named \"Greg's anti-tax rants\"",
			"And a customer named \"Dr. Bill\"",
			"And a blog named \"Expensive Therapy\" owned by \"Dr. Bill\"",
			"",
			"Scenario: Dr. Bill posts to his own blog",
			"Given I am logged in as Dr. Bill",
			"When I try to post to \"Expensive Therapy\"",
			"Then I should see \"Your article was published.\"",
			"",
			"Scenario: Dr. Bill tries to post to somebody else's blog, and fails",
			"Given I am logged in as Dr. Bill",
			"When I try to post to \"Greg's anti-tax rants\"",
			"Then I should see \"Hey! That's not your blog!\"",
		];

		const expected = [
			"Feature: Multiple site support",
			"\tOnly blog owners can post to a blog, except administrators,",
			"\twho can post to all blogs.",
			"",
			"\tBackground:",
			"\t\tGiven a global administrator named \"Greg\"",
			"\t\tAnd a blog named \"Greg's anti-tax rants\"",
			"\t\tAnd a customer named \"Dr. Bill\"",
			"\t\tAnd a blog named \"Expensive Therapy\" owned by \"Dr. Bill\"",
			"",
			"\tScenario: Dr. Bill posts to his own blog",
			"\t\tGiven I am logged in as Dr. Bill",
			"\t\tWhen I try to post to \"Expensive Therapy\"",
			"\t\tThen I should see \"Your article was published.\"",
			"",
			"\tScenario: Dr. Bill tries to post to somebody else's blog, and fails",
			"\t\tGiven I am logged in as Dr. Bill",
			"\t\tWhen I try to post to \"Greg's anti-tax rants\"",
			"\t\tThen I should see \"Hey! That's not your blog!\"",
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});

	test("should format Feature with Background and rule", () => {
		// Test from https://cucumber.io/docs/gherkin/reference#background
		const input = [
			"Feature: Overdue tasks",
			"Let users know when tasks are overdue, even when using other",
			"features of the app",
			"",
			"Rule: Users are notified about overdue tasks on first use of the day",
			"Background:",
			"Given I have overdue tasks",
			"",
			"Example: First use of the day",
			"Given I last used the app yesterday",
			"When I use the app",
			"Then I am notified about overdue tasks",
			"",
			"Example: Already used today",
			"Given I last used the app earlier today",
			"When I use the app",
			"Then I am not notified about overdue tasks"
		];

		const expected = [
			"Feature: Overdue tasks",
			"\tLet users know when tasks are overdue, even when using other",
			"\tfeatures of the app",
			"",
			"\tRule: Users are notified about overdue tasks on first use of the day",
			"\t\tBackground:",
			"\t\t\tGiven I have overdue tasks",
			"",
			"\t\tExample: First use of the day",
			"\t\t\tGiven I last used the app yesterday",
			"\t\t\tWhen I use the app",
			"\t\t\tThen I am notified about overdue tasks",
			"",
			"\t\tExample: Already used today",
			"\t\t\tGiven I last used the app earlier today",
			"\t\t\tWhen I use the app",
			"\t\t\tThen I am not notified about overdue tasks"
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});

	test("should format Feature with three double-quote DocString marks", () => {
		// Test from https://cucumber.io/docs/gherkin/reference#doc-strings
		const input = [
			"Feature: Blog",
			"Let users know when tasks are overdue, even when using other",
			"features of the app",
			"",
			"Rule: A rule",
			"Background:",
			"Given blog page has been displayed",
			"",
			"Example: Display blog post",
			"Given a blog post named \"Random\" with Markdown body",
			'"""',
			"Some Title, Eh?",
			"===============",
			"Here is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"consectetur adipiscing elit.",
			'"""',
			"When blog post is published",
			"Then site display ",
			'"""',
			"Some Title, Eh?",
			"===============",
			"Here is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"consectetur adipiscing elit.",
			'"""'
		];

		const expected = [
			"Feature: Blog",
			"\tLet users know when tasks are overdue, even when using other",
			"\tfeatures of the app",
			"",
			"\tRule: A rule",
			"\t\tBackground:",
			"\t\t\tGiven blog page has been displayed",
			"",
			"\t\tExample: Display blog post",
			"\t\t\tGiven a blog post named \"Random\" with Markdown body",
			'\t\t\t\t"""',
			"\t\t\t\tSome Title, Eh?",
			"\t\t\t\t===============",
			"\t\t\t\tHere is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"\t\t\t\tconsectetur adipiscing elit.",
			'\t\t\t\t"""',
			"\t\t\tWhen blog post is published",
			"\t\t\tThen site display",
			'\t\t\t\t"""',
			"\t\t\t\tSome Title, Eh?",
			"\t\t\t\t===============",
			"\t\t\t\tHere is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"\t\t\t\tconsectetur adipiscing elit.",
			'\t\t\t\t"""'
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});

	test("should format Feature with three backticks DocString marks", () => {
		// Test from https://cucumber.io/docs/gherkin/reference#doc-strings
		const input = [
			"Feature: Blog",
			"Let users know when tasks are overdue, even when using other",
			"features of the app",
			"",
			"Rule: A rule",
			"Background:",
			"Given blog page has been displayed",
			"",
			"Example: Display blog post",
			"Given a blog post named \"Random\" with Markdown body",
			"```",
			"Some Title, Eh?",
			"===============",
			"Here is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"consectetur adipiscing elit.",
			"```",
			"When blog post is published",
			"Then site display ",
			"```",
			"Some Title, Eh?",
			"===============",
			"Here is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"consectetur adipiscing elit.",
			"```"
		];

		const expected = [
			"Feature: Blog",
			"\tLet users know when tasks are overdue, even when using other",
			"\tfeatures of the app",
			"",
			"\tRule: A rule",
			"\t\tBackground:",
			"\t\t\tGiven blog page has been displayed",
			"",
			"\t\tExample: Display blog post",
			"\t\t\tGiven a blog post named \"Random\" with Markdown body",
			"\t\t\t\t```",
			"\t\t\t\tSome Title, Eh?",
			"\t\t\t\t===============",
			"\t\t\t\tHere is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"\t\t\t\tconsectetur adipiscing elit.",
			"\t\t\t\t```",
			"\t\t\tWhen blog post is published",
			"\t\t\tThen site display",
			"\t\t\t\t```",
			"\t\t\t\tSome Title, Eh?",
			"\t\t\t\t===============",
			"\t\t\t\tHere is the first paragraph of my blog post. Lorem ipsum dolor sit amet,",
			"\t\t\t\tconsectetur adipiscing elit.",
			"\t\t\t\t```"
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});

	test("should format Feature with Data Tables", () => {
		// Test from https://cucumber.io/docs/gherkin/reference#doc-strings
		const input = [
			"Feature: Blog",
			"Let users know when tasks are overdue, even when using other",
			"features of the app",
			"",
			"Rule: A rule",
			"Background:",
			"Given blog page has been displayed",
			"",
			"Example: Display blog post",
			"Given the following users exist:",
			"|name|email|twitter|",
			"|Aslak|aslak@cucumber.io| @aslak_hellesoy |",
			"| Julien | julien@cucumber.io | @jbpros|",
			"| Matt   | matt@cucumber.io   | @mattwynne|",
			"When slecting one",
			"Then it is highlited"
		];

		const expected = [
			"Feature: Blog",
			"\tLet users know when tasks are overdue, even when using other",
			"\tfeatures of the app",
			"",
			"\tRule: A rule",
			"\t\tBackground:",
			"\t\t\tGiven blog page has been displayed",
			"",
			"\t\tExample: Display blog post",
			"\t\t\tGiven the following users exist:",
			"\t\t\t\t| name   | email              | twitter         |",
			"\t\t\t\t| Aslak  | aslak@cucumber.io  | @aslak_hellesoy |",
			"\t\t\t\t| Julien | julien@cucumber.io | @jbpros         |",
			"\t\t\t\t| Matt   | matt@cucumber.io   | @mattwynne      |",
			"\t\t\tWhen slecting one",
			"\t\t\tThen it is highlited"
		];

		expect(formatGherkinLines(input)).toEqual(expected);
	});
});

describe("formatGherkinString", () => {
	test("should format Gherkin strings correctly", () => {
		const input = "Feature: Test feature";

		const expected = "Feature: Test feature";

		expect(formatGherkinString(input, {inFeature: false, inRule: false, inScenario:false, inDocString: false})).toEqual(expected);
	});

	test("should handle mixed content", () => {
		const input = "Scenario Outline: Login test";

		const expected = "\tScenario Outline: Login test";

		expect(formatGherkinString(input, {inFeature: false, inRule: false, inScenario:false, inDocString: false})).toEqual(expected);
	});

	test("should handle empty lines", () => {
		const input = "";

		const expected = "";

		expect(formatGherkinString(input, {inFeature: false, inRule: false, inScenario:false, inDocString: false})).toEqual(expected);
	});
});

describe("removeMultipleSpaces", () => {
	test("removeMultipleSpaces", () => {
		expect(removeMultipleSpaces("  toto titi    tutu   ")).toBe(
			" toto titi tutu ",
		);
	});
});

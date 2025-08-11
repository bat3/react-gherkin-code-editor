export type SupportedGherkinLanguage = "en" | "fr";

export type GherkinKeywords =
	| "Feature"
	| "Background"
	| "Rule"
	| "Scenario"
	| "ScenarioOutline"
	| "Examples"
	| "Given"
	| "When"
	| "Then"
	| "And"
	| "But"
	| "DelimitedParameters"
	| "Tag"
	| "DocString"
	| "DataTable"
	| "Comment";

export type TokenName = `${GherkinKeywords}-keyword`;

export const gherkinEnglishKeywords = new Map<GherkinKeywords, string[]>();
gherkinEnglishKeywords.set("Feature", [
	"Feature:",
	"Business:",
	"NeedAbility:",
]);
gherkinEnglishKeywords.set("Background", ["Background:"]);
gherkinEnglishKeywords.set("Rule", ["Rule"]);
gherkinEnglishKeywords.set("Scenario", ["Scenario:", "Example:"]);
gherkinEnglishKeywords.set("ScenarioOutline", [
	"Scenario Outline:",
	"Scenario Template:",
]);
gherkinEnglishKeywords.set("Examples", ["Examples:", "Scenarios:"]);
gherkinEnglishKeywords.set("Given", ["Given", "*"]);
gherkinEnglishKeywords.set("When", ["When", "*"]);
gherkinEnglishKeywords.set("Then", ["Then", "*"]);
gherkinEnglishKeywords.set("And", ["And", "*"]);
gherkinEnglishKeywords.set("But", ["But", "*"]);

export const gherkinFrenchKeywords = new Map<GherkinKeywords, string[]>();
gherkinFrenchKeywords.set("Feature", ["Fonctionnalité:"]);
gherkinFrenchKeywords.set("Background", ["Contexte:"]);
gherkinFrenchKeywords.set("Rule", ["Règle:"]);
gherkinFrenchKeywords.set("Scenario", ["Exemple:", "Scénario:"]);
gherkinFrenchKeywords.set("ScenarioOutline", [
	"Plan du scénario:",
	"Plan du Scénario:",
]);
gherkinFrenchKeywords.set("Examples", ["Exemples:"]);
gherkinFrenchKeywords.set("Given", [
	"Soit",
	"Sachant",
	"Etant donné",
	"Étant donné",
	"*",
]);
gherkinFrenchKeywords.set("When", ["Quand", "Lorsque", "Lorsqu'", "*"]);
gherkinFrenchKeywords.set("Then", ["Alors", "Donc", "*"]);
gherkinFrenchKeywords.set("And", ["Et", "Et que", "Et qu'", "*"]);
gherkinFrenchKeywords.set("But", ["Mais", "Mais que", "Mais qu'", "*"]);

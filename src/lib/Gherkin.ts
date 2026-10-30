export type SupportedLanguage = "en" | "fr" | "es";

export interface GherkinKeywords {
	Feature: string[];
	Background: string[];
	Rule: string[];
	Scenario: string[];
	ScenarioOutline: string[];
	Examples: string[];
	Given: string[];
	When: string[];
	Then: string[];
	And: string[];
	But: string[];
	Tag: string[];
	DocString: string[];
}

export const gherkinLanguages: Record<SupportedLanguage, GherkinKeywords> = {
	en: {
		Feature: ["Feature", "Business Need", "Ability"],
		Background: ["Background"],
		Rule: ["Rule"],
		Scenario: ["Scenario", "Example"],
		ScenarioOutline: ["Scenario Outline", "Scenario Template"],
		Examples: ["Examples", "Scenarios"],
		Given: ["Given", "*"],
		When: ["When", "*"],
		Then: ["Then", "*"],
		And: ["And", "*"],
		But: ["But", "*"],
		Tag: ["@"],
		DocString: ['"""', "```"],
	},
	fr: {
		Feature: ["Fonctionnalité"],
		Background: ["Contexte"],
		Rule: ["Règle"],
		Scenario: ["Scénario", "Exemple"],
		ScenarioOutline: ["Plan du scénario", "Plan du Scénario"],
		Examples: ["Exemples"],
		Given: [
			"*",
			"Soit",
			"Sachant que",
			"Sachant qu'",
			"Sachant",
			"Etant donné que",
			"Etant donné qu'",
			"Etant donné",
			"Etant donnée",
			"Etant donnés",
			"Etant données",
			"Étant donné que",
			"Étant donné qu'",
			"Étant donné",
			"Étant donnée",
			"Étant donnés",
			"Étant données",
		],
		When: ["*", "Quand", "Lorsque", "Lorsqu'"],
		Then: ["*", "Alors", "Donc"],
		And: ["*", "Et que", "Et qu'", "Et"],
		But: ["*", "Mais que", "Mais qu'", "Mais"],
		Tag: ["@"],
		DocString: ['"""', "```"],
	},
	es: {
		Feature: ["Característica", "Necesidad del negocio", "Requisito"],
		Background: ["Antecedentes"],
		Rule: ["Regla", "Regla de negocio"],
		Scenario: ["Ejemplo", "Escenario"],
		ScenarioOutline: ["Esquema del escenario"],
		Examples: ["Ejemplos"],
		Given: ["*", "Dado", "Dada", "Dados", "Dadas"],
		When: ["*", "Cuando"],
		Then: ["*", "Entonces"],
		And: ["*", "Y", "E"],
		But: ["*", "Pero"],
		Tag: ["@"],
		DocString: ['"""', "```"],
	},
};

// Backward-compatibility default keywords (English)
export const gherkinKeywords: GherkinKeywords = gherkinLanguages.en;

// Combined keywords across all supported languages for context-agnostic fallback parsing
export const combinedGherkinKeywords: GherkinKeywords = {
	Feature: Array.from(
		new Set([
			...gherkinLanguages.en.Feature,
			...gherkinLanguages.fr.Feature,
			...gherkinLanguages.es.Feature,
		]),
	),
	Background: Array.from(
		new Set([
			...gherkinLanguages.en.Background,
			...gherkinLanguages.fr.Background,
			...gherkinLanguages.es.Background,
		]),
	),
	Rule: Array.from(
		new Set([
			...gherkinLanguages.en.Rule,
			...gherkinLanguages.fr.Rule,
			...gherkinLanguages.es.Rule,
		]),
	),
	Scenario: Array.from(
		new Set([
			...gherkinLanguages.en.Scenario,
			...gherkinLanguages.fr.Scenario,
			...gherkinLanguages.es.Scenario,
		]),
	),
	ScenarioOutline: Array.from(
		new Set([
			...gherkinLanguages.en.ScenarioOutline,
			...gherkinLanguages.fr.ScenarioOutline,
			...gherkinLanguages.es.ScenarioOutline,
		]),
	),
	Examples: Array.from(
		new Set([
			...gherkinLanguages.en.Examples,
			...gherkinLanguages.fr.Examples,
			...gherkinLanguages.es.Examples,
		]),
	),
	Given: Array.from(
		new Set([
			...gherkinLanguages.en.Given,
			...gherkinLanguages.fr.Given,
			...gherkinLanguages.es.Given,
		]),
	),
	When: Array.from(
		new Set([
			...gherkinLanguages.en.When,
			...gherkinLanguages.fr.When,
			...gherkinLanguages.es.When,
		]),
	),
	Then: Array.from(
		new Set([
			...gherkinLanguages.en.Then,
			...gherkinLanguages.fr.Then,
			...gherkinLanguages.es.Then,
		]),
	),
	And: Array.from(
		new Set([
			...gherkinLanguages.en.And,
			...gherkinLanguages.fr.And,
			...gherkinLanguages.es.And,
		]),
	),
	But: Array.from(
		new Set([
			...gherkinLanguages.en.But,
			...gherkinLanguages.fr.But,
			...gherkinLanguages.es.But,
		]),
	),
	Tag: Array.from(
		new Set([
			...gherkinLanguages.en.Tag,
			...gherkinLanguages.fr.Tag,
			...gherkinLanguages.es.Tag,
		]),
	),
	DocString: Array.from(
		new Set([
			...gherkinLanguages.en.DocString,
			...gherkinLanguages.fr.DocString,
			...gherkinLanguages.es.DocString,
		]),
	),
};


export type gherkinKeywords = "Feature" | "Background" | "Rule" | "Scenario" | "Scenario Outline" | "Examples" | "Given" | "When" | "Then" | "And" | "But"

export const gherkinEnglishKeywords = new Map<gherkinKeywords, string[]>()
gherkinEnglishKeywords.set("Feature", ["Feature", "Business", "NeedAbility"])
gherkinEnglishKeywords.set("Background", ["Background"])
gherkinEnglishKeywords.set("Rule", ["Rule"])
gherkinEnglishKeywords.set("Scenario", ["Scenario", "Example"])
gherkinEnglishKeywords.set("Scenario Outline", ["Scenario Outline", "Scenario Template"])
gherkinEnglishKeywords.set("Examples", ["Examples", "Scenarios"])
gherkinEnglishKeywords.set("Given", ["Given", "*"])
gherkinEnglishKeywords.set("When", ["When", "*"])
gherkinEnglishKeywords.set("Then", ["Then", "*"])
gherkinEnglishKeywords.set("And", ["And", "*"])
gherkinEnglishKeywords.set("But", ["But", "*"])


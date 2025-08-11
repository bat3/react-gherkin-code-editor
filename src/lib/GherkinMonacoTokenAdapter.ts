import {
	gherkinEnglishKeywords,
	gherkinFrenchKeywords,
	type TokenName,
	type GherkinKeywords,
	type SupportedGherkinLanguage,
} from "./Gherkin";

export class GherkinMonacoTokenAdapter {
	public getGherkinLanguageKeywords(
		language: SupportedGherkinLanguage,
	): Map<GherkinKeywords, string[]> {
		let gherkinKeywords: Map<GherkinKeywords, string[]>;
		switch (language) {
			case "en":
				gherkinKeywords = gherkinEnglishKeywords;
				break;
			case "fr":
				gherkinKeywords = gherkinFrenchKeywords;
				break;
			default:
				gherkinKeywords = gherkinEnglishKeywords;
				break;
		}
		gherkinKeywords.set("Comment", ["#"]);
		gherkinKeywords.set("Tag", ["@"]);
		return gherkinKeywords;
	}

	public getTokens(language: SupportedGherkinLanguage): [RegExp, TokenName][] {
		return this.getRegExpFromToken(this.getGherkinLanguageKeywords(language));
	}

	private getRegExpFromToken(
		gherkinKeywords: Map<GherkinKeywords, string[]>,
	): [RegExp, TokenName][] {
		const regExpTokens: [RegExp, TokenName][] = [];
		for (const [key, values] of gherkinKeywords.entries()) {
			for (const [_, value] of values.entries()) {
				let regExpString: string;
				switch (value) {
					case "*":
						regExpString = "/*( |$)";
						break;

					default:
						regExpString = `${value}( |$)`;

						break;
				}
				regExpTokens.push([new RegExp(regExpString), `${key}-keyword`]);
			}
		}
		// Add generic
		regExpTokens.push([/<.*?>/, "DelimitedParameters-keyword"]);
		regExpTokens.push([/\@.*/, "Tag-keyword"]);
		regExpTokens.push([/#.*/, "Comment-keyword"]);
		return regExpTokens;
	}
}

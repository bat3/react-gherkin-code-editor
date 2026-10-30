import {
	type GherkinKeywords,
	type SupportedLanguage,
	combinedGherkinKeywords,
	gherkinLanguages,
} from "./Gherkin";

export function getKeywordsForLanguage(
	language?: string | SupportedLanguage,
): GherkinKeywords {
	if (!language) {
		return combinedGherkinKeywords;
	}

	const langCode = language.startsWith("GherkinLanguage-")
		? language.replace("GherkinLanguage-", "")
		: language;

	if (langCode in gherkinLanguages) {
		return gherkinLanguages[langCode as SupportedLanguage];
	}

	return combinedGherkinKeywords;
}

/**
 * Formats an array of Gherkin strings with special handling for Examples tables.
 */
export function formatGherkinLines(
	lines: string[],
	language?: string | SupportedLanguage,
): string[] {
	const keywords = getKeywordsForLanguage(language);

	let inExamplesTable = false;
	let inFeature = false;
	let inRule = false;
	let inScenario = false;
	let inDocString = false;
	let examplesTableLines: string[] = [];
	let stepTableLines: string[] = [];
	const formattedLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const rawLine = lines[i];
		const line = removeMultipleSpaces(rawLine.trim());

		// Preserve empty lines
		if (line.length === 0) {
			formattedLines.push("");
			continue;
		}

		// New feature: reset context
		if (keywords.Feature.some((keyword) => line.startsWith(keyword))) {
			inFeature = true;
			inRule = false;
			inScenario = false;
			formattedLines.push(
				formatGherkinString(
					line,
					{
						inFeature,
						inRule,
						inScenario,
						inDocString,
					},
					keywords,
				),
			);
			continue;
		}

		// Rule lines under a feature
		if (keywords.Rule.some((keyword) => line.startsWith(keyword))) {
			inRule = true;
			inScenario = false;

			formattedLines.push(
				formatGherkinString(
					line,
					{
						inFeature,
						inRule,
						inScenario,
						inDocString,
					},
					keywords,
				),
			);
			continue;
		}

		// Examples header starts a table block
		if (keywords.Examples.some((keyword) => line.startsWith(keyword))) {
			inExamplesTable = true;
			formattedLines.push(
				formatGherkinString(
					line,
					{
						inFeature,
						inRule,
						inScenario,
						inDocString,
					},
					keywords,
				),
			);
			continue;
		}

		// Any scenario/example line marks that we're inside a scenario
		if (
			keywords.Scenario.some((keyword) => line.startsWith(keyword)) ||
			keywords.ScenarioOutline.some((keyword) => line.startsWith(keyword)) ||
			keywords.Background.some((keyword) => line.startsWith(keyword))
		) {
			inScenario = true;
			formattedLines.push(
				formatGherkinString(
					line,
					{
						inFeature,
						inRule,
						inScenario,
						inDocString,
					},
					keywords,
				),
			);
			continue;
		}

		// Handle table rows inside an Examples block
		if (inExamplesTable && line.includes("|")) {
			examplesTableLines.push(
				formatGherkinString(
					line,
					{
						inFeature,
						inRule,
						inScenario,
						inDocString,
					},
					keywords,
				),
			);

			const isLastLine = i === lines.length - 1;
			const nextLineHasPipe = !isLastLine && lines[i + 1].includes("|");

			// Last row of the examples table: format and flush
			if (isLastLine || !nextLineHasPipe) {
				const formattedTable = formatExamplesTable(examplesTableLines, {
					inFeature,
					inRule,
					inScenario,
					inDocString,
				});
				formattedLines.push(...formattedTable);
				examplesTableLines = [];
				inExamplesTable = false;
			}
		} else if (!inExamplesTable && inScenario && line.includes("|")) {
			// Handle data tables attached to steps
			stepTableLines.push(line);

			const isLastLine = i === lines.length - 1;
			const nextLineHasPipe = !isLastLine && lines[i + 1].includes("|");

			if (isLastLine || !nextLineHasPipe) {
				const formattedStepTable = formatStepTable(stepTableLines);
				formattedLines.push(...formattedStepTable);
				stepTableLines = [];
			}
		} else {
			// Normal non-table line (including doc strings)
			// Pass current inDocString so formatGherkinString can indent correctly
			formattedLines.push(
				formatGherkinString(
					line,
					{
						inFeature,
						inRule,
						inScenario,
						inDocString,
					},
					keywords,
				),
			);

			if (keywords.DocString.some((keyword) => line === keyword)) {
				inDocString = !inDocString;
			}
		}
	}

	return formattedLines;
}

/**
 * Generic helper to format a Gherkin table (Examples or data table)
 * by aligning columns and applying a given indentation level.
 */
function formatTableLines(tableLines: string[], indentTabs: number): string[] {
	if (tableLines.length === 0) return [];

	const rows = tableLines.map((line) =>
		line
			.split("|")
			.map((cell) => cell.trim())
			.filter((cell) => cell.length > 0),
	);

	const columnWidths = rows[0].map((_, colIndex) =>
		Math.max(...rows.map((row) => row[colIndex]?.length || 0)),
	);

	return rows.map((row) => {
		const formattedCells = row.map((cell, index) =>
			cell.padEnd(columnWidths[index]),
		);
		return `${"\t".repeat(indentTabs)}| ${formattedCells.join(" | ")} |`;
	});
}

const baseIndentForSteps = (context: GherkinContext) => {
	if (context.inRule && context.inScenario) {
		return 3;
	}
	if (context.inFeature && context.inScenario) {
		return 2;
	}
	if (context.inScenario) {
		return 1;
	}
	return 0;
};

/**
 * Formats an Examples table by aligning columns
 * (always 3 tabs of indentation).
 */
function formatExamplesTable(
	tableLines: string[],
	context: GherkinContext,
): string[] {
	return formatTableLines(tableLines, baseIndentForSteps(context) + 1);
}

/**
 * Formats a data table attached to a step by aligning columns
 * (always 4 tabs of indentation).
 */
function formatStepTable(tableLines: string[]): string[] {
	return formatTableLines(tableLines, 4);
}

interface GherkinContext {
	inFeature: boolean;
	inRule: boolean;
	inScenario: boolean;
	inDocString: boolean;
}

export function formatGherkinString(
	line: string,
	context: GherkinContext,
	keywords: GherkinKeywords = combinedGherkinKeywords,
): string {
	const trimmedLine = line.trimStart();

	// Doc string delimiters and body: opening, content, and closing at step+1
	if (keywords.DocString.some((keyword) => trimmedLine === keyword)) {
		const baseIndent = baseIndentForSteps(context);
		const indentLevel = baseIndent + 1;
		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Doc string body: always one level deeper than the step
	if (context.inDocString) {
		const baseIndent = baseIndentForSteps(context);
		const indentLevel = baseIndent + 1;
		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Feature
	if (keywords.Feature.some((keyword) => trimmedLine.startsWith(keyword))) {
		return trimmedLine;
	}

	// Rule is always one level under Feature
	if (keywords.Rule.some((keyword) => trimmedLine.startsWith(keyword))) {
		return `\t${trimmedLine}`;
	}

	// Examples headers keep previous behaviour
	if (keywords.Examples.some((keyword) => trimmedLine.startsWith(keyword))) {
		const baseIndent = baseIndentForSteps(context);
		const indentLevel = baseIndent;
		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Scenario / Example / tags headers
	if (
		keywords.Scenario.some((keyword) => trimmedLine.startsWith(keyword)) ||
		keywords.ScenarioOutline.some((keyword) =>
			trimmedLine.startsWith(keyword),
		) ||
		keywords.Background.some((keyword) => trimmedLine.startsWith(keyword)) ||
		keywords.Tag.some((keyword) => trimmedLine.startsWith(keyword))
	) {
		let indentLevel = 0;

		if (context.inRule) {
			indentLevel = 2;
		} else if (context.inFeature) {
			indentLevel = 1;
		}

		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Steps
	if (
		keywords.Given.some((keyword) => trimmedLine.startsWith(keyword)) ||
		keywords.When.some((keyword) => trimmedLine.startsWith(keyword)) ||
		keywords.Then.some((keyword) => trimmedLine.startsWith(keyword)) ||
		keywords.And.some((keyword) => trimmedLine.startsWith(keyword)) ||
		keywords.But.some((keyword) => trimmedLine.startsWith(keyword))
	) {
		if (!context.inScenario) {
			return trimmedLine;
		}

		const indentLevel = baseIndentForSteps(context);
		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Description lines directly under a Feature
	if (context.inFeature && !context.inScenario) {
		return `\t${trimmedLine}`;
	}

	return line;
}

export function removeMultipleSpaces(line: string) {
	return line.replace(/\s+/g, " ");
}

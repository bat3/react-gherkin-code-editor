import { gherkinKeywords } from "./Gherkin";

/**
 * Formats an array of Gherkin strings with special handling for Examples tables.
 */
export function formatGherkinLines(lines: string[]): string[] {
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
		if (gherkinKeywords.Feature.some((keyword) => line.startsWith(keyword))) {
			inFeature = true;
			inRule = false;
			inScenario = false;
			formattedLines.push(
				formatGherkinString(line, {
					inFeature,
					inRule,
					inScenario,
					inDocString,
				}),
			);
			continue;
		}

		// Rule lines under a feature
		if (gherkinKeywords.Rule.some((keyword) => line.startsWith(keyword))) {
			inRule = true;
			inScenario = false;

			formattedLines.push(
				formatGherkinString(line, {
					inFeature,
					inRule,
					inScenario,
					inDocString,
				}),
			);
			continue;
		}

		// Examples header starts a table block
		if (gherkinKeywords.Examples.some((keyword) => line.startsWith(keyword))) {
			inExamplesTable = true;
			formattedLines.push(
				formatGherkinString(line, {
					inFeature,
					inRule,
					inScenario,
					inDocString,
				}),
			);
			continue;
		}

		// Any scenario/example line marks that we're inside a scenario
		if (
			gherkinKeywords.Scenario.some((keyword) => line.startsWith(keyword)) ||
			gherkinKeywords.Background.some((keyword) => line.startsWith(keyword))
		) {
			inScenario = true;
			formattedLines.push(
				formatGherkinString(line, {
					inFeature,
					inRule,
					inScenario,
					inDocString,
				}),
			);
			continue;
		}

		// Handle table rows inside an Examples block
		if (inExamplesTable && line.includes("|")) {
			examplesTableLines.push(
				formatGherkinString(line, {
					inFeature,
					inRule,
					inScenario,
					inDocString,
				}),
			);

			const isLastLine = i === lines.length - 1;
			const nextLineHasPipe = !isLastLine && lines[i + 1].includes("|");

			// Last row of the examples table: format and flush
			if (isLastLine || !nextLineHasPipe) {
				const formattedTable = formatExamplesTable(examplesTableLines);
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
				formatGherkinString(line, {
					inFeature,
					inRule,
					inScenario,
					inDocString,
				}),
			);

			if (gherkinKeywords.DocString.some((keyword) => line === keyword)) {
				inDocString = !inDocString;
			}
		}
	}

	return formattedLines;
}

/**
 * Formats an Examples table by aligning columns
 * @param tableLines - Array of already-indented, pipe-separated strings
 * @returns Array of formatted Examples table lines
 */
function formatExamplesTable(tableLines: string[]): string[] {
	if (tableLines.length === 0) return [];

	// Split each line into cells and trim them
	const rows = tableLines.map((line) =>
		line
			.split("|")
			.map((cell) => cell.trim())
			.filter((cell) => cell.length > 0),
	);

	// Find the maximum width for each column
	const columnWidths = rows[0].map((_, colIndex) =>
		Math.max(...rows.map((row) => row[colIndex]?.length || 0)),
	);

	// Format each row with 3 tabs (Examples table)
	return rows.map((row) => {
		const formattedCells = row.map((cell, index) =>
			cell.padEnd(columnWidths[index]),
		);
		return `\t\t\t| ${formattedCells.join(" | ")} |`;
	});
}

/**
 * Formats a data table attached to a step by aligning columns
 * @param tableLines - Array of raw pipe-separated strings (no indentation)
 * @returns Array of formatted step table lines
 */
function formatStepTable(tableLines: string[]): string[] {
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

	// Step tables are one level deeper (4 tabs)
	return rows.map((row) => {
		const formattedCells = row.map((cell, index) =>
			cell.padEnd(columnWidths[index]),
		);
		return `\t\t\t\t| ${formattedCells.join(" | ")} |`;
	});
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
):  string {

	const trimmedLine = line.trimStart();

	const baseIndentForSteps = () => {
		if (context.inRule && context.inScenario) {
			return 3;
		}
		if (context.inScenario) {
			return 2;
		}
		return 0;
	};

	// Doc string delimiters and body: opening, content, and closing at step+1
	if (gherkinKeywords.DocString.some((keyword) => trimmedLine === keyword)) {
		const baseIndent = baseIndentForSteps();
		const indentLevel = baseIndent + 1;
		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Doc string body: always one level deeper than the step
	if (context.inDocString) {
		const baseIndent = baseIndentForSteps();
		const indentLevel = baseIndent + 1;
		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Feature
	if (gherkinKeywords.Feature.some((keyword) => trimmedLine.startsWith(keyword))) {
		return trimmedLine;
	}

	// Rule is always one level under Feature
	if (gherkinKeywords.Rule.some((keyword) => trimmedLine.startsWith(keyword))) {
		return `\t${trimmedLine}`;
	}

	// Scenario / Example / tags headers
	if (
		gherkinKeywords.Scenario.some((keyword) => trimmedLine.startsWith(keyword)) ||
		gherkinKeywords.ScenarioOutline.some((keyword) => trimmedLine.startsWith(keyword)) ||
		gherkinKeywords.Background.some((keyword) => trimmedLine.startsWith(keyword)) ||
		gherkinKeywords.Tag.some((keyword) => trimmedLine.startsWith(keyword))
	) {
		let indentLevel = 1;

		if (context.inRule) {
			indentLevel = 2;
		} else if (context.inFeature) {
			indentLevel = 1;
		}

		return `${"\t".repeat(indentLevel)}${trimmedLine}`;
	}

	// Background / Examples headers keep previous behaviour
	if (
		gherkinKeywords.Examples.some((keyword) => trimmedLine.startsWith(keyword))
	) {
		return `\t\t${trimmedLine}`;
	}

	// Steps
	if (
		gherkinKeywords.Given.some((keyword) => trimmedLine.startsWith(keyword)) ||
		gherkinKeywords.When.some((keyword) => trimmedLine.startsWith(keyword)) ||
		gherkinKeywords.Then.some((keyword) => trimmedLine.startsWith(keyword)) ||
		gherkinKeywords.And.some((keyword) => trimmedLine.startsWith(keyword)) ||
		gherkinKeywords.But.some((keyword) => trimmedLine.startsWith(keyword))
	) {
		if (!context.inScenario) {
			return trimmedLine;
		}

		const indentLevel = context.inRule ? 3 : 2;
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

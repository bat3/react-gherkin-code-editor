import { gherkinKeywords } from "./Gherkin";

/**
 * Formats an array of Gherkin strings with special handling for Examples tables.
 */
export function formatGherkinLines(lines: string[]): string[] {
	let inExamplesTable = false;
	let inFeature = false;
	let inRule = false;
	let inScenario = false;
	let tableLines: string[] = [];
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
		if (line.startsWith(gherkinKeywords.Feature[0])) {
			inFeature = true;
			inRule = false;
			inScenario = false;
			formattedLines.push(
				formatGherkinString(line, { inFeature, inRule, inScenario }),
			);
			continue;
		}

		// Rule lines under a feature
		if (line.startsWith(gherkinKeywords.Rule[0])) {
			inRule = true;
			inScenario = false;

			formattedLines.push(
				formatGherkinString(line, { inFeature, inRule, inScenario }),
			);
			continue;
		}

		// Examples header starts a table block
		if (line.startsWith(gherkinKeywords.Examples[0])) {
			inExamplesTable = true;
			formattedLines.push(
				formatGherkinString(line, { inFeature, inRule, inScenario }),
			);
			continue;
		}

		// Any scenario/example line marks that we're inside a scenario
		if (
			line.startsWith(gherkinKeywords.Scenario[0]) ||
			line.startsWith(gherkinKeywords.Scenario[1])
		) {
			inScenario = true;
			formattedLines.push(
				formatGherkinString(line, { inFeature, inRule, inScenario }),
			);
			continue;
		}

		// Handle table rows inside an Examples block
		if (inExamplesTable && line.includes("|")) {
			tableLines.push(
				formatGherkinString(line, { inFeature, inRule, inScenario }),
			);

			const isLastLine = i === lines.length - 1;
			const nextLineHasPipe = !isLastLine && lines[i + 1].includes("|");

			// Last row of the table: format and flush
			if (isLastLine || !nextLineHasPipe) {
				const formattedTable = formatTable(tableLines);
				formattedLines.push(...formattedTable);
				tableLines = [];
				inExamplesTable = false;
			}
		} else {
			// Normal non-table line
			formattedLines.push(
				formatGherkinString(line, { inFeature, inRule, inScenario }),
			);
		}
	}

	return formattedLines;
}

/**
 * Formats a table by aligning columns
 * @param tableLines - Array of pipe-separated strings
 * @returns Array of formatted table lines
 */
function formatTable(tableLines: string[]): string[] {
	if (tableLines.length === 0) return [];

	// Split each line into cells and trim them
	const rows = tableLines.map((line) =>
		line
			.split("|")
			.map((cell) => cell.trim())
			.filter((cell) => cell.length > 0),
	);

	// Find the maximum width for each column
	const columnWidths = rows[0].map((_, colIndex) => {
		return Math.max(...rows.map((row) => row[colIndex]?.length || 0));
	});

	// Format each row
	return rows.map((row) => {
		const formattedCells = row.map((cell, index) => {
			return cell.padEnd(columnWidths[index]);
		});
		return `\t\t\t| ${formattedCells.join(" | ")} |`;
	});
}

interface GherkinContext {
	inFeature?: boolean;
	inRule?: boolean;
	inScenario?: boolean;
}


export function formatGherkinString(
	line: string,
	context: GherkinContext,
):  string {

	const trimmedLine = line.trimStart();

	const startsWith = (keyword: string) => trimmedLine.startsWith(keyword);

	// Headers
	if (startsWith("Feature:")) {
		return trimmedLine;
	}

	// Rule is always one level under Feature
	if (startsWith("Rule:")) {
		return `\t${trimmedLine}`;
	}

	// Scenario / Example / tags headers
	if (
		startsWith("Scenario:") ||
		startsWith("Scenario Outline:") ||
		startsWith("Example:") ||
		startsWith("@")
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
	if (startsWith("Background:") || startsWith("Examples:")) {
		return `\t\t${trimmedLine}`;
	}

	// Steps
	if (
		startsWith("Given") ||
		startsWith("When") ||
		startsWith("Then") ||
		startsWith("And") ||
		startsWith("But")
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

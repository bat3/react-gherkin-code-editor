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

		// New feature: reset context and keep the line as-is
		if (line.startsWith(gherkinKeywords.Feature[0])) {
			inFeature = true;
			inRule = false;
			inScenario = false;
			formattedLines.push(formatGherkinString(line, inScenario));
			continue;
		}

		// Rule lines under a feature
		if (line.startsWith(gherkinKeywords.Rule[0])) {
			inRule = true;
			inScenario = false;

			const formattedRule = formatGherkinString(line, inScenario);
			if (formattedRule === line) {
				formattedLines.push(`\t${line}`);
			} else {
				formattedLines.push(formattedRule);
			}

			continue;
		}

		// Examples header starts a table block
		if (line.startsWith(gherkinKeywords.Examples[0])) {
			inExamplesTable = true;
			formattedLines.push(formatGherkinString(line, inScenario));
			continue;
		}

		// Any scenario line marks that we're inside a scenario
		if (line.startsWith(gherkinKeywords.Scenario[0]) || line.startsWith(gherkinKeywords.Scenario[1])) {
			inScenario = true;
			if (inRule) {
				// Example inside a Rule: two levels under the Feature
				formattedLines.push(`\t\t${line}`);
			} else if (inFeature) {
				// Example directly under a Feature
				formattedLines.push(`\t${line}`);
			} else {
				formattedLines.push(formatGherkinString(line, inScenario));
			}
			continue;
		}

		// Handle table rows inside an Examples block
		if (inExamplesTable && line.includes("|")) {
			tableLines.push(formatGherkinString(line, inScenario));

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
			if (inFeature && !inScenario && !inExamplesTable) {
				// Lines directly under a Feature are considered description.
				// If the formatter doesn't apply any special indentation,
				// indent them once to match expected output.
				const formatted = formatGherkinString(line, inScenario);
				if (formatted === line) {
					formattedLines.push(`\t${line}`);
				} else {
					formattedLines.push(formatted);
				}
			} else if (inRule && inScenario && !inExamplesTable) {
				// Steps inside a Rule's example: indent one level deeper
				const formatted = formatGherkinString(line, inScenario);
				formattedLines.push(`\t${formatted}`);
			} else {
				formattedLines.push(formatGherkinString(line, inScenario));
			}
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

export function formatGherkinString(
	line: string,
	isInScenario = false,
): string {
	const keywordsLevel1 = ["Feature:"];
	const keywordsLevel2 = ["Scenario:", "Scenario Outline:", "@"];
	const keywordsLevel3 = ["Background:", "Examples:", "@"];
	const keywordsLevel4 = ["Given", "When", "Then", "And", "But"];

	const startsWithKeywordsLevel1 = keywordsLevel1.some((keyword) =>
		line.includes(keyword),
	);

	if (startsWithKeywordsLevel1) {
		return line.trim();
	}

	const startsWithKeywordsLevel2 = keywordsLevel2.some((keyword) =>
		line.includes(keyword),
	);

	if (startsWithKeywordsLevel2) {
		return `\t${line.trim()}`;
	}

	const startsWithKeywordsLevel3 = keywordsLevel3.some((keyword) =>
		line.includes(keyword),
	);

	if (startsWithKeywordsLevel3) {
		return `\t\t${line.trim()}`;
	}

	const startsWithKeywordsLevel4 = keywordsLevel4.some((keyword) =>
		line.includes(keyword),
	);

	if (startsWithKeywordsLevel4) {
		// If we're in a scenario context, use level 3 indentation, otherwise no indentation
		return isInScenario ? `\t\t${line.trim()}` : line.trim();
	}

	return line;
}

export function removeMultipleSpaces(line: string) {
	return line.replace(/\s+/g, " ");
}

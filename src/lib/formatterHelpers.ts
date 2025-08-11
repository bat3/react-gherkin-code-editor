import type { GherkinKeywords } from "./Gherkin";

/**
 * Formats an array of Gherkin strings with special handling for Examples tables
 * @param lines - Array of Gherkin strings to format
 * @returns Array of formatted strings
 */
export function formatGherkinLines(
	lines: string[],
	gherkinKeywords: Map<GherkinKeywords, string[]>,
): string[] {
	let isInExamplesTable = false;
	let tableLines: string[] = [];
	const formattedLines: string[] = [];
	let currentLevel = 0;

	// For each line in the input array
	for (let i = 0; i < lines.length; i++) {
		const trimmedLine = removeMultipleSpaces(lines[i].trim());

		// Check if we're entering an Examples section
		if (
			gherkinKeywords.get("Examples")?.some((e) => trimmedLine.startsWith(e))
		) {
			isInExamplesTable = true;
			formattedLines.push(formatGherkinString(trimmedLine, gherkinKeywords));
			continue;
		}

		// Handle comments and tags based on context
		if (
			trimmedLine.startsWith(gherkinKeywords.get("Comment")?.[0] ?? "") ||
			trimmedLine.startsWith(gherkinKeywords.get("Tag")?.[0] ?? "")
		) {
			// If we recently processed a step line, indent at that level
			if (currentLevel === 2) {
				formattedLines.push(`\t\t${trimmedLine}`);
			} else if (currentLevel === 1) {
				// Otherwise, indent at scenario level
				formattedLines.push(`\t${trimmedLine}`);
			} else {
				formattedLines.push(trimmedLine);
			}
			continue;
		}

		// Handle table lines
		if (isInExamplesTable && trimmedLine.includes("|")) {
			tableLines.push(formatGherkinString(trimmedLine, gherkinKeywords));

			// If next line doesn't have a pipe or we're at the end, format the collected table
			if (i === lines.length - 1 || !lines[i + 1].includes("|")) {
				const formattedTable = formatTable(tableLines);
				formattedLines.push(...formattedTable);
				tableLines = [];
				isInExamplesTable = false;
			}
		} else {
			// Normal line formatting
			const formatted = formatGherkinString(trimmedLine, gherkinKeywords);
			formattedLines.push(formatted);

			// Track current indentation level for context
			if (formatted.startsWith("\t\t")) {
				currentLevel = 2;
			} else if (formatted.startsWith("\t")) {
				currentLevel = 1;
			} else {
				currentLevel = 0;
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
	gherkinKeywords: Map<GherkinKeywords, string[]>,
): string {
	const keywordsLevel1 = gherkinKeywords.get("Feature") ?? [];
	const keywordsLevel2 = (gherkinKeywords.get("Background") ?? []).concat(
		gherkinKeywords.get("Scenario") ?? [],
		gherkinKeywords.get("ScenarioOutline") ?? [],
	);

	const keywordsLevel3 = (gherkinKeywords.get("Given") ?? []).concat(
		gherkinKeywords.get("When") ?? [],
		gherkinKeywords.get("Then") ?? [],
		gherkinKeywords.get("And") ?? [],
		gherkinKeywords.get("But") ?? [],
		gherkinKeywords.get("Examples") ?? [],
	);

	const trimmedLine = line.trim();

	const startsWithKeywordsLevel1 = keywordsLevel1.some((keyword) =>
		trimmedLine.startsWith(keyword),
	);

	if (startsWithKeywordsLevel1) {
		return trimmedLine;
	}

	const startsWithKeywordsLevel2 = keywordsLevel2.some((keyword) =>
		trimmedLine.startsWith(keyword),
	);

	if (startsWithKeywordsLevel2) {
		return `\t${trimmedLine}`;
	}

	const startsWithKeywordsLevel3 = keywordsLevel3.some((keyword) =>
		trimmedLine.startsWith(keyword),
	);

	if (startsWithKeywordsLevel3) {
		return `\t\t${trimmedLine}`;
	}

	return trimmedLine;
}

export function removeMultipleSpaces(line: string) {
	return line.replace(/\s+/g, " ");
}

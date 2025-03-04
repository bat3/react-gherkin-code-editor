/**
 * Formats an array of Gherkin strings with special handling for Examples tables
 * @param lines - Array of Gherkin strings to format
 * @returns Array of formatted strings
 */
export function formatGherkinLines(lines: string[]): string[] {
  let isInExamplesTable = false;
  let tableLines: string[] = [];
  const formattedLines: string[] = [];

  // For each line in the input array
  for (let i = 0; i < lines.length; i++) {
    const line = removeMultipleSpaces(lines[i].trim());

    // Check if we're entering an Examples section
    if (line.toLowerCase().startsWith('examples:')) {
      isInExamplesTable = true;
      formattedLines.push(formatGherkinString(line));
      continue;
    }

    // Handle table lines
    if (isInExamplesTable && line.includes('|')) {
      tableLines.push(formatGherkinString(line));

      // If next line doesn't have a pipe or we're at the end, format the collected table
      if (i === lines.length - 1 || !lines[i + 1].includes('|')) {
        const formattedTable = formatTable(tableLines);
        formattedLines.push(...formattedTable);
        tableLines = [];
        isInExamplesTable = false;
      }
    } else {
      // Normal line formatting
      if (line.length > 0) {
        formattedLines.push(formatGherkinString(line));
      } else {
        formattedLines.push('');
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
  const rows = tableLines.map(line =>
    line.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
  );

  // Find the maximum width for each column
  const columnWidths = rows[0].map((_, colIndex) => {
    return Math.max(...rows.map(row => row[colIndex]?.length || 0));
  });

  // Format each row
  return rows.map(row => {
    const formattedCells = row.map((cell, index) => {
      return cell.padEnd(columnWidths[index]);
    });
    return `\t\t\t| ${formattedCells.join(' | ')} |`
  });
}

export function formatGherkinString(line: string): string {
  const keywordsLevel1 = ['Feature:',];
  const keywordsLevel2 = ['Scenario:', 'Scenario Outline:', '@'];
  const keywordsLevel3 = ['Given', 'When', 'Then', 'And', 'But', 'Background:', 'Examples:', '@'];
  const keywordsLevel4 = ['|'];

  const startsWithKeywordsLevel1 = keywordsLevel1.some(keyword =>
    line.includes(keyword)
  );

  if (startsWithKeywordsLevel1) {
    return line.trim();
  }

  const startsWithKeywordsLevel2 = keywordsLevel2.some(keyword =>
    line.includes(keyword)
  );

  if (startsWithKeywordsLevel2) {
    return `\t${line.trim()}`
  }


  const startsWithKeywordsLevel3 = keywordsLevel3.some(keyword =>
    line.includes(keyword)
  );

  if (startsWithKeywordsLevel3) {
    return `\t\t${line.trim()}`
  }

  const startsWithKeywordsLevel4 = keywordsLevel3.some(keyword =>
    line.includes(keyword)
  );

  if (startsWithKeywordsLevel4) {
    return `\t\t\t${line.trim()}`
  }

  return line;
}

export function removeMultipleSpaces(line: string) {
  return line.replace(/\s+/g, " ");
}



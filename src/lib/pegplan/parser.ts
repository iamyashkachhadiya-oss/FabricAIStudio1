/**
 * Peg Plan Parser — Bidirectional Text ↔ Matrix Sync
 *
 * Text format (Surat factory standard):
 *   1-->1,3,5,6,7,10,11,14
 *   ---
 *   2-->2,4,6,7,8,10,11,14
 *   ---
 *   3-->1,3,5,6,7,10,11,13
 *
 * Parsing rule:
 *   - Split on "---" divider lines → array of pick blocks
 *   - For each block: extract pick number from "N-->" prefix
 *   - Collect comma-separated integers as raised shafts
 *   - Set grid[pick][shaft] = 1 for raised, 0 for lowered
 */

/**
 * Convert peg plan text to a binary matrix
 * @param text - Peg plan in "N-->shaft,shaft,..." format
 * @param shaftCount - Number of shafts (columns in matrix)
 * @returns 2D binary matrix [picks × shafts]
 */
export function textToMatrix(text: string, shaftCount: number): number[][] {
  if (!text.trim()) return []

  // Split by "---" separator lines
  const blocks = text.split(/\n*-{3,}\n*/).filter(b => b.trim())
  const matrix: number[][] = []

  for (const block of blocks) {
    // Find lines with "-->" pattern
    const lines = block.split('\n').filter(l => l.trim())
    let allShafts: number[] = []

    for (const line of lines) {
      const arrowMatch = line.match(/\d+\s*-->\s*(.+)/)
      if (arrowMatch) {
        // Line starts with "N-->" — extract shafts after arrow
        const shaftStr = arrowMatch[1]
        const shafts = shaftStr
          .split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n) && n >= 1 && n <= shaftCount)
        allShafts.push(...shafts)
      } else {
        // Continuation line — just comma-separated numbers
        const shafts = line
          .split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n) && n >= 1 && n <= shaftCount)
        allShafts.push(...shafts)
      }
    }

    // Build row: shafts are 1-indexed, matrix is 0-indexed
    const row = new Array(shaftCount).fill(0)
    for (const shaft of allShafts) {
      row[shaft - 1] = 1
    }
    matrix.push(row)
  }

  return matrix
}

/**
 * Convert binary matrix back to peg plan text
 * @param matrix - 2D binary matrix [picks × shafts]
 * @returns Peg plan text in "N-->shaft,shaft,..." format
 */
export function matrixToText(matrix: number[][]): string {
  if (!matrix.length) return ''

  const lines: string[] = []

  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i]
    const raisedShafts: number[] = []

    for (let j = 0; j < row.length; j++) {
      if (row[j] === 1) {
        raisedShafts.push(j + 1) // Convert 0-indexed back to 1-indexed
      }
    }

    lines.push(`${i + 1}-->${raisedShafts.join(',')}`)

    // Add separator between picks (but not after last one)
    if (i < matrix.length - 1) {
      lines.push('---')
    }
  }

  return lines.join('\n')
}

/**
 * NLP → Weave Engine Bridge
 * ==========================
 * Converts natural language intent (from FabricaAI chat) into deterministic
 * DesignParams that feed directly into the generative engine.
 *
 * CRITICAL RULE: This layer produces ZERO matrix values.
 *   LLM → intent metadata → nlpBridge → DesignParams → engine → matrix
 *
 * The LLM is only asked for intent (weave type, shaft hint, symmetry, colour).
 * All 0/1 values come from the deterministic generators in engine.ts.
 */

import type { DesignParams, WeaveType } from './presets'
import { buildDesign, generateMatrix, type GeneratedDesign } from './engine'
import { validateMatrix, countRequiredShafts } from './generators'
import { mirrorX, mirrorY } from './variations'
import type { WeaveMatrix } from './generators'

// ─── Intent shape (what the LLM returns for nlp_design mode) ─────────────────

export interface NLPDesignIntent {
  /** Raw text that was parsed */
  raw_input: string
  /** Mapped weave type */
  weave_family: 'plain' | 'twill' | 'satin' | 'dobby_pattern' | 'jacquard' | 'unknown'
  /** Specific structure sub-type */
  weave_variant?: string
  /** Twill/satin numerics */
  up?: number
  down?: number
  n?: number
  step?: number
  /** Z or S direction */
  direction?: 'Z' | 'S'
  /** Symmetry operations to apply */
  repeat_symmetry?: ('mirror_x' | 'mirror_y' | 'rotation_180')[]
  /** Colour intent */
  colour_palette?: string[]
  /** Minimum shafts implied by the design description */
  shaft_count_hint?: number
  /** Placement on fabric */
  placement?: 'body' | 'border' | 'pallu' | 'allover'
  /** Loom target resolved from column complexity */
  loom_target?: 'dobby' | 'jacquard'
}

// ─── Float validation result ──────────────────────────────────────────────────

export interface FloatValidation {
  valid: boolean
  maxWarpFloat: number
  maxWeftFloat: number
  errors: string[]    // hard errors (block output)
  warnings: string[]  // soft warnings (proceed with caution)
  notices: string[]   // informational
  interlacementRatio: number
  shaftCount: number
  loomTarget: 'dobby' | 'jacquard'
}

// ─── Full bridge output ───────────────────────────────────────────────────────

export interface BridgeResult {
  design: GeneratedDesign
  intent: NLPDesignIntent
  validation: FloatValidation
  /** Peg plan text in Surat factory format for the store */
  pegPlanText: string
  /** The matrix itself */
  matrix: WeaveMatrix
}

// ─── Keyword → WeaveType mapping ─────────────────────────────────────────────

const WEAVE_KEYWORD_MAP: { pattern: RegExp; type: WeaveType; up?: number; down?: number; n?: number }[] = [
  // Specific named weaves first (more specific → less specific order)
  { pattern: /houndstooth|hound.?stooth/i,               type: 'houndstooth' },
  { pattern: /herringbone|herring.?bone/i,               type: 'herringbone', up: 2, down: 2 },
  { pattern: /broken.?twill|point.?twill/i,              type: 'broken_twill', up: 2, down: 2 },
  { pattern: /zigzag|zig.?zag/i,                         type: 'zigzag', up: 2, down: 2 },
  { pattern: /honeycomb|honey.?comb/i,                   type: 'honeycomb', n: 8 },
  { pattern: /brighton/i,                                type: 'brighton_honeycomb', n: 12 },
  { pattern: /birdseye|bird.?s.?eye/i,                   type: 'birdseye', n: 4 },
  { pattern: /diamond/i,                                 type: 'diamond', n: 8 },
  { pattern: /mock.?leno|leno/i,                         type: 'mock_leno', n: 8 },
  { pattern: /crepe/i,                                   type: 'crepe', n: 8 },
  { pattern: /bedford.?cord|bedford/i,                   type: 'bedford_cord', n: 4 },
  { pattern: /warp.?rib|rib.?warp/i,                     type: 'warp_rib', n: 2 },
  { pattern: /weft.?rib|rib.?weft/i,                     type: 'weft_rib', n: 2 },
  { pattern: /basket/i,                                  type: 'basket', n: 2 },
  { pattern: /satin|sateen/i,                            type: 'satin', n: 5 },
  { pattern: /twill|taffeta/i,                           type: 'twill', up: 2, down: 2 },
  { pattern: /plain|tabby|taffeta/i,                     type: 'plain' },
]

// ─── Colour name normalisation ────────────────────────────────────────────────

const COLOUR_NORMALISE: Record<string, string> = {
  ivory: 'cream', ecru: 'cream', offwhite: 'cream', 'off-white': 'cream',
  navy: 'navy', 'navy blue': 'navy', indigo: 'indigo', cobalt: 'navy',
  maroon: 'burgundy', crimson: 'burgundy', wine: 'burgundy',
  'forest green': 'teal', olive: 'teal', khaki: 'teal',
  charcoal: 'grey', slate: 'grey', ash: 'grey',
  beige: 'cream', sand: 'cream', champagne: 'cream',
  gold: 'gold', zari: 'gold', 'gold zari': 'gold',
  silver: 'grey', 'silver grey': 'grey',
}

function normaliseColour(c: string): string {
  const lower = c.toLowerCase().trim()
  return COLOUR_NORMALISE[lower] ?? lower.split(' ')[0]
}

// ─── Extract twill/satin numerics from text ───────────────────────────────────
// Handles: "3/1", "2x2", "2-2", "3 over 1", "over 3 under 1"

function extractTwillNumerics(text: string): { up?: number; down?: number } {
  // "3/1 twill", "2/2", "3-1"
  const fracMatch = text.match(/(\d+)\s*[\/\-x×]\s*(\d+)/)
  if (fracMatch) return { up: +fracMatch[1], down: +fracMatch[2] }
  // "over 3 under 1"
  const verbalMatch = text.match(/over\s+(\d+)\s+under\s+(\d+)/i)
  if (verbalMatch) return { up: +verbalMatch[1], down: +verbalMatch[2] }
  // "3 shaft twill" → 3/1
  const shaftMatch = text.match(/(\d+)\s*shaft/i)
  if (shaftMatch) {
    const s = +shaftMatch[1]
    return { up: s - 1, down: 1 }
  }
  return {}
}

function extractSatinN(text: string): number | undefined {
  const m = text.match(/(\d+)\s*shaft\s*satin|satin\s*(\d+)|(\d+)\s*[-\/]\s*\d+\s*satin/i)
  if (m) return +(m[1] ?? m[2] ?? m[3])
  return undefined
}

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parse raw user text into NLPDesignIntent.
 * Called client-side before sending to API — or server-side after LLM extracts intent.
 */
export function parseIntent(text: string): NLPDesignIntent {
  const intent: NLPDesignIntent = { raw_input: text, weave_family: 'unknown' }
  const lower = text.toLowerCase()

  // 1. Detect weave type
  for (const { pattern, type, up, down, n } of WEAVE_KEYWORD_MAP) {
    if (pattern.test(lower)) {
      intent.weave_family = type.includes('jacquard') ? 'jacquard' :
        ['plain', 'basket', 'warp_rib', 'weft_rib'].includes(type) ? 'plain' :
        type.includes('satin') ? 'satin' :
        type.includes('twill') || type.includes('herringbone') || type.includes('zigzag') ? 'twill' :
        'dobby_pattern'
      intent.weave_variant = type
      if (up)  intent.up  = up
      if (down) intent.down = down
      if (n) intent.n = n
      break
    }
  }

  // 2. Override numerics from text
  if (intent.weave_variant?.includes('twill') ||
      intent.weave_variant?.includes('herringbone') ||
      intent.weave_variant?.includes('zigzag') ||
      intent.weave_variant?.includes('broken_twill')) {
    const nums = extractTwillNumerics(lower)
    if (nums.up)   intent.up   = nums.up
    if (nums.down) intent.down = nums.down
  }

  if (intent.weave_variant?.includes('satin')) {
    const n = extractSatinN(lower)
    if (n) intent.n = n
  }

  // 3. Direction (Z/S twill)
  if (/\bS\b|S.?direction|S.?twill|left.?twill/i.test(text)) intent.direction = 'S'
  else if (/\bZ\b|Z.?direction|Z.?twill|right.?twill/i.test(text)) intent.direction = 'Z'

  // 4. Symmetry
  const sym: NLPDesignIntent['repeat_symmetry'] = []
  if (/mirror|reflect|symmetric/i.test(lower)) {
    if (/vertical|left.?right|horizontal.*mirror/i.test(lower)) sym.push('mirror_x')
    else if (/horizontal|top.?bottom|vertical.*mirror/i.test(lower)) sym.push('mirror_y')
    else sym.push('mirror_x', 'mirror_y') // generic mirror → both
  }
  if (/herringbone|zigzag/i.test(lower)) sym.push('mirror_x') // always mirror for these
  if (sym.length) intent.repeat_symmetry = sym

  // 5. Shaft count hint
  const shaftM = lower.match(/(\d+)\s*shaft/i)
  if (shaftM) intent.shaft_count_hint = +shaftM[1]

  // 6. Colour palette
  const colourMatches = lower.match(
    /\b(ivory|cream|ecru|white|black|navy|indigo|maroon|burgundy|red|green|teal|blue|gold|zari|silver|grey|gray|beige|sand|charcoal|ochre)\b/gi
  )
  if (colourMatches && colourMatches.length > 0) {
    intent.colour_palette = [...new Set(colourMatches.map(normaliseColour))].slice(0, 3)
  }

  // 7. Placement
  if (/border/i.test(lower))      intent.placement = 'border'
  else if (/pallu|pallu/i.test(lower)) intent.placement = 'pallu'
  else if (/allover|all.?over/i.test(lower)) intent.placement = 'allover'
  else                              intent.placement = 'body'

  return intent
}

// ─── Intent → DesignParams ────────────────────────────────────────────────────

export function intentToParams(intent: NLPDesignIntent): DesignParams {
  const weaveType = (intent.weave_variant ?? 'plain') as WeaveType

  const params: DesignParams = {
    type: weaveType,
    direction: intent.direction ?? 'Z',
    modifier: 'solid',
    colors: intent.colour_palette?.slice(0, 2) ?? ['indigo', 'cream'],
    shaft_count: intent.shaft_count_hint ?? 16,
  }

  // Type-specific params
  if (['twill','broken_twill','herringbone','zigzag'].includes(weaveType)) {
    params.up   = intent.up   ?? 2
    params.down = intent.down ?? 2
  }
  if (['satin','honeycomb','birdseye','diamond','mock_leno','crepe','basket','warp_rib','weft_rib','bedford_cord','brighton_honeycomb'].includes(weaveType)) {
    params.n = intent.n ?? 8
  }
  if (weaveType === 'satin' && intent.n) {
    params.n    = intent.n
    params.step = Math.ceil(intent.n / 2) % 2 === 0 ? Math.ceil(intent.n / 2) + 1 : Math.ceil(intent.n / 2)
  }

  return params
}

// ─── Float validation (from info.txt algorithm) ───────────────────────────────

function maxConsecutive(arr: number[], val: number): number {
  let max = 0, run = 0
  for (const v of arr) { run = v === val ? run + 1 : 0; if (run > max) max = run }
  return max
}

export function validateFloats(
  matrix: WeaveMatrix,
  maxWarpFloat = 6,
  maxWeftFloat = 6
): FloatValidation {
  const H = matrix.length
  const W = matrix[0]?.length ?? 0

  const errors: string[]   = []
  const warnings: string[] = []
  const notices: string[]  = []

  let worstWarp = 0
  let worstWeft = 0
  let totalOnes = 0

  // Column scan (warp floats)
  for (let c = 0; c < W; c++) {
    const col = matrix.map(r => r[c])
    totalOnes += col.reduce((a, b) => a + b, 0)
    const f = maxConsecutive(col, 1)
    if (f > worstWarp) worstWarp = f
    if (f > maxWarpFloat * 2) errors.push(`Warp end ${c + 1}: float ${f} (hard limit ${maxWarpFloat * 2})`)
    else if (f > maxWarpFloat) warnings.push(`Warp end ${c + 1}: float ${f} exceeds recommended ${maxWarpFloat}`)
  }

  // Row scan (weft + warp floats in each pick)
  for (let r = 0; r < H; r++) {
    const row = matrix[r]
    const warpF = maxConsecutive(row, 1)
    const weftF = maxConsecutive(row, 0)
    if (warpF > worstWeft) worstWeft = warpF
    if (warpF > maxWeftFloat * 2) errors.push(`Pick ${r + 1}: warp float ${warpF} (hard limit)`)
    else if (warpF > maxWeftFloat) warnings.push(`Pick ${r + 1}: warp float ${warpF}`)
    if (weftF > maxWeftFloat * 2) errors.push(`Pick ${r + 1}: weft float ${weftF} (hard limit)`)
    else if (weftF > maxWeftFloat) warnings.push(`Pick ${r + 1}: weft float ${weftF}`)
  }

  // Interlacement check
  const total = H * W
  const ratio = total > 0 ? totalOnes / total : 0
  if (ratio < 0.15) errors.push(`Very low interlacement (${(ratio * 100).toFixed(1)}%) — fabric may not hold together`)
  else if (ratio < 0.25) warnings.push(`Low interlacement ratio (${(ratio * 100).toFixed(1)}%) — fabric may be fragile`)

  // All-zero / all-one rows
  for (let r = 0; r < H; r++) {
    const s = matrix[r].reduce((a, b) => a + b, 0)
    if (s === 0) errors.push(`Pick ${r + 1}: all weft-up — structurally impossible`)
    if (s === W) errors.push(`Pick ${r + 1}: all warp-up — structurally impossible`)
  }

  // Shaft + loom target
  const shaftCount = countRequiredShafts(matrix)
  const loomTarget: 'dobby' | 'jacquard' = shaftCount > 32 ? 'jacquard' : 'dobby'

  if (shaftCount > 32) {
    notices.push(`Design requires ${shaftCount} distinct shaft patterns — jacquard loom required`)
  } else if (shaftCount > 16) {
    warnings.push(`Design needs ${shaftCount} shafts — ensure loom capacity`)
  }

  return {
    valid: errors.length === 0,
    maxWarpFloat: worstWarp,
    maxWeftFloat: worstWeft,
    errors,
    warnings,
    notices,
    interlacementRatio: ratio,
    shaftCount,
    loomTarget,
  }
}

// ─── Apply symmetry to matrix ─────────────────────────────────────────────────

function applySymmetry(matrix: WeaveMatrix, ops: NLPDesignIntent['repeat_symmetry']): WeaveMatrix {
  if (!ops || ops.length === 0) return matrix
  let m = matrix
  if (ops.includes('mirror_x'))     m = mirrorX(m)
  if (ops.includes('mirror_y'))     m = mirrorY(m)
  if (ops.includes('rotation_180')) {
    // Horizontal stack of original + 180° rotated
    const rot = m.slice().reverse().map(r => [...r].reverse())
    m = m.map((row, i) => [...row, ...rot[i]])
  }
  return m
}

// ─── Matrix → Peg plan text (Surat format) ───────────────────────────────────

export function matrixToPegText(matrix: WeaveMatrix): string {
  return matrix.map((row, i) => {
    const raised = row.map((v, j) => v === 1 ? j + 1 : null).filter(Boolean) as number[]
    return `${i + 1}-->${raised.join(',')}`
  }).join('\n')
}

// ─── Master bridge function ───────────────────────────────────────────────────

/**
 * Full pipeline: raw text → design + matrix + validation + peg plan text
 */
export function bridgeNLPToDesign(text: string): BridgeResult {
  const intent  = parseIntent(text)
  const params  = intentToParams(intent)
  let   matrix  = generateMatrix(params)

  // Apply symmetry
  if (intent.repeat_symmetry?.length) {
    matrix = applySymmetry(matrix, intent.repeat_symmetry)
  }

  // Build full design object
  const design = buildDesign(params, 'generated')

  // Override matrix with symmetry-applied version
  const finalDesign: GeneratedDesign = {
    ...design,
    matrix,
    repeat_rows: matrix.length,
    repeat_cols: matrix[0]?.length ?? 0,
  }

  // Validate floats
  const validation = validateFloats(matrix)

  // Also append engine warnings
  const engineWarnings = validateMatrix(matrix, { maxShafts: params.shaft_count ?? 32 })
  if (engineWarnings.length) validation.warnings.push(...engineWarnings)

  // Set loom target on intent
  intent.loom_target = validation.loomTarget
  intent.shaft_count_hint = validation.shaftCount

  return {
    design: finalDesign,
    intent,
    validation,
    pegPlanText: matrixToPegText(matrix),
    matrix,
  }
}

// ─── Convenience: quick shaft count check ────────────────────────────────────

export function isJacquardRequired(matrix: WeaveMatrix): boolean {
  return countRequiredShafts(matrix) > 32
}

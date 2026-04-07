# 🎨 Advanced Textile Design Engine - Complete Roadmap
## AI Research + Design Generation + Canvas Editor

---

## VISION

Your product evolves from "simple calculator" to **"intelligent design assistant"**:

```
CURRENT STATE (v1.0)
├─ User enters yarn specs manually
├─ User draws peg plan in text/grid
└─ System calculates metrics

NEW STATE (v2.0 - "Design Intelligence")
├─ User says "polyester 75D yarn"
│  └─ AI researches 30+ yarn properties automatically
├─ User draws draft (shafts, picks, feeders)
│  └─ System generates ALL POSSIBLE designs (permutation engine)
├─ User sees designs organized by type (plain, twill, satin)
│  └─ Each with perfect RPM, shaft count, feeder arrangement
├─ User visually designs with canvas (draw shapes)
│  └─ System auto-fills peg plan + suggests variants
└─ User gets detailed simulation report
   └─ Fabric properties, production rate, cost, finishing
```

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    FABRICAI DESIGN ENGINE v2.0                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAYER 1: YARN RESEARCH (Claude AI)                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ User inputs: "Polyester 75D yarn"                       │   │
│  │ ↓ Claude researches:                                    │   │
│  │ • Shrinkage (3-5%)                                      │   │
│  │ • Tensile strength (400-500 cN)                        │   │
│  │ • Elasticity (90-95%)                                   │   │
│  │ • Moisture regain (0.4%)                                │   │
│  │ • Dye affinity (good)                                   │   │
│  │ • Luster (bright/dull)                                  │   │
│  │ • Best weave types (all)                                │   │
│  │ • Typical production rates                              │   │
│  │ • Price per kg (market data)                            │   │
│  │ • Finishing recommendations                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  LAYER 2: DRAFT SPECIFICATION                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ User specifies:                                         │   │
│  │ • # of shafts (4, 8, 16, 32)                           │   │
│  │ • # of picks per repeat                                 │   │
│  │ • # of feeders (1-8)                                    │   │
│  │ • Repeat size (width × height in picks/ends)           │   │
│  │ • Loom constraints (RPM, width, nozzles)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  LAYER 3: DESIGN GENERATION ENGINE (Permutation)              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Generates all mathematically valid peg plans:           │   │
│  │ • Plain weave (1/1 repeat)                              │   │
│  │ • Twill (2/2, 2/1, 4/4 repeats)                        │   │
│  │ • Satin (5/1, 7/1 floats)                              │   │
│  │ • Complex interlaces (custom logic)                     │   │
│  │                                                          │   │
│  │ Each design includes:                                   │   │
│  │ • Peg plan matrix                                       │   │
│  │ • Threading diagram                                     │   │
│  │ • Lifting plan                                          │   │
│  │ • Nozzle sequences per feeder                           │   │
│  │ • Optimal RPM for this design                           │   │
│  │ • Shaft utilization %                                   │   │
│  │ • Feeder balance score                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  LAYER 4: DESIGN VISUALIZATION (Canvas Editor)                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ User can:                                               │   │
│  │ • Draw in peg plan matrix (click to toggle)             │   │
│  │ • Draw shapes: lines, rectangles, circles              │   │
│  │ • Drag/drop shapes on canvas                            │   │
│  │ • Enter pattern as text (e.g., "S" = stripe)           │   │
│  │ • Set repeat direction (vertical, horizontal)           │   │
│  │ • Preview in real-time                                  │   │
│  │ • Auto-suggest complementary patterns                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                      │
│  LAYER 5: SIMULATION & REPORTING                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ For EACH design:                                        │   │
│  │ • Fabric simulation (interlace preview)                 │   │
│  │ • Property prediction (shrinkage, drape, strength)      │   │
│  │ • Production rate calculation                           │   │
│  │ • Cost estimation (per meter)                           │   │
│  │ • Finishing recommendations                             │   │
│  │ • Machine compatibility check                           │   │
│  │ • PDF report generation                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1: YARN RESEARCH ENGINE (2 weeks)

### 1.1 Yarn Database Structure

```typescript
// src/lib/types/yarn.ts

type YarnType = 'natural' | 'synthetic' | 'blended'
type FibreCategory = 'polyester' | 'viscose' | 'cotton' | 'silk' | 'nylon' | 'acrylic'

interface YarnResearchData {
  // PHYSICAL PROPERTIES
  shrinkage: {
    min_pct: number      // 2% for polyester
    max_pct: number      // 5% for polyester
    during: string[]     // ['washing', 'drying', 'finishing']
    reversible_pct: number // How much shrink is reversible
  }
  
  tensile_strength: {
    cn_min: number       // CentiNewtons minimum
    cn_max: number
    test_standard: string // ASTM, ISO
  }
  
  elongation: {
    pct_min: number      // % stretch before break
    pct_max: number
    elasticity_recovery: number // % that rebounds
  }
  
  elasticity: {
    pct: number          // 90-95% for polyester
    recovery_time_s: number // Seconds to full recovery
  }
  
  moisture_regain: {
    pct: number          // 0.4% for polyester
    affects: string[]    // ['dye_affinity', 'handle', 'conductivity']
  }
  
  // PROCESSING PROPERTIES
  dye_affinity: 'poor' | 'good' | 'excellent'
  dyeable_temps: {
    min_celsius: number
    max_celsius: number
    standard_temp: number
  }
  
  luster: 'matte' | 'semi_bright' | 'bright' | 'ultra_bright'
  
  // WEAVING PROPERTIES
  crimp_effect: number   // % how much yarn compresses in weave
  twist_per_inch: number
  twist_direction: 'S' | 'Z'
  
  breaking_length_km: number // Km of yarn that breaks under own weight
  
  // THERMAL PROPERTIES
  melting_point_celsius: number
  glass_transition_temp: number
  thermal_stability_description: string
  
  // WEAVE COMPATIBILITY
  best_weaves: string[]     // ['plain', 'twill', 'satin', 'jacquard']
  suitable_end_density: {
    min: number             // Minimum EPI
    max: number             // Maximum EPI (avoid crowding)
    optimal: number
  }
  
  suitable_pick_density: {
    min: number
    max: number
    optimal: number
  }
  
  // PRODUCTION PARAMETERS
  typical_rpm: {
    min: number             // Looms can't go slower
    max: number             // Looms can't go faster
    optimal: number         // Sweet spot for quality
  }
  
  max_picks_per_minute: number // Physical limit
  
  tension_requirements: {
    warp_cn: number         // CentiNewtons warp tension
    weft_cn: number
    description: string
  }
  
  // FINISHING RECOMMENDATIONS
  recommended_finishing: {
    sanforization: boolean
    bio_polishing: boolean  // For natural fibres
    resin_treatment: boolean
    mercerization: boolean  // For cotton
    heat_setting: {
      celsius: number
      hours: number
    }
  }
  
  // MARKET DATA
  price_per_kg_usd: number
  availability: 'common' | 'specialty' | 'rare'
  lead_time_days: number
  minimum_order_kg: number
  
  // CARE INSTRUCTIONS
  care_label: string       // "Machine wash warm, tumble dry medium"
  
  // ENVIRONMENTAL
  biodegradable: boolean
  recyclable: boolean
  certification: string[]  // ['GOTS', 'OEKO-TEX', 'EWG']
}
```

### 1.2 AI Research Integration (Claude API)

```typescript
// src/lib/yarn/research.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

interface YarnQuery {
  material: string        // "Polyester 75D"
  count_system: 'denier' | 'ne' | 'tex'
  count_value: number
  twist_description?: string  // "Hard twisted"
  filament_count?: number
}

export async function researchYarnProperties(
  query: YarnQuery
): Promise<YarnResearchData> {
  const prompt = `
You are a textile expert with 30 years of experience in yarn manufacturing.

Research the following yarn:
- Material: ${query.material}
- Count: ${query.count_value} ${query.count_system}
- Twist: ${query.twist_description || 'standard'}

Provide EXACT, SOURCED values for EVERY property below.
Use your knowledge of:
- ASTM D standards
- ISO textile standards
- Industry-standard yarn manufacturers (Reliance, Oeko-Tex certified)
- Real Surat mill data

Return ONLY valid JSON, no markdown:

{
  "shrinkage": {
    "min_pct": <number>,
    "max_pct": <number>,
    "during": ["washing", "drying", "finishing"],
    "reversible_pct": <number>
  },
  "tensile_strength": {
    "cn_min": <number>,
    "cn_max": <number>,
    "test_standard": "ASTM D2256"
  },
  ... (all fields from YarnResearchData interface)
}

CRITICAL: All numeric values must be realistic for ${query.material}.
If unsure, use textile industry standard ranges.
  `

  const message = await client.messages.create({
    model: 'claude-opus-4.6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  // Extract JSON from response
  const responseText = message.content[0].type === 'text' 
    ? message.content[0].text 
    : ''

  // Parse and validate
  const yarnData = JSON.parse(responseText)
  
  // Cache in database
  await cacheYarnResearch(query, yarnData)
  
  return yarnData as YarnResearchData
}

// Cache results to avoid re-researching
async function cacheYarnResearch(
  query: YarnQuery,
  data: YarnResearchData
) {
  const supabase = createClient()
  await supabase.from('yarn_research_cache').insert({
    material: query.material,
    count_system: query.count_system,
    count_value: query.count_value,
    research_data: data,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  })
}
```

### 1.3 Yarn UI Component

```typescript
// src/components/design/YarnResearch.tsx
'use client'

import { useState } from 'react'
import { researchYarnProperties } from '@/lib/yarn/research'

export function YarnResearch() {
  const [material, setMaterial] = useState('polyester')
  const [countValue, setCountValue] = useState(75)
  const [countSystem, setCountSystem] = useState<'denier' | 'ne' | 'tex'>('denier')
  const [researching, setResearching] = useState(false)
  const [results, setResults] = useState<YarnResearchData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResearch = async () => {
    setResearching(true)
    setError(null)

    try {
      const data = await researchYarnProperties({
        material,
        count_system: countSystem,
        count_value: countValue,
      })

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setResearching(false)
    }
  }

  return (
    <div className="yarn-research">
      {/* Input Section */}
      <div className="research-inputs">
        <select 
          value={material} 
          onChange={(e) => setMaterial(e.target.value)}
        >
          <option value="polyester">Polyester</option>
          <option value="viscose">Viscose</option>
          <option value="cotton">Cotton</option>
          <option value="silk">Silk</option>
          <option value="nylon">Nylon</option>
          <option value="acrylic">Acrylic</option>
        </select>

        <input
          type="number"
          value={countValue}
          onChange={(e) => setCountValue(Number(e.target.value))}
          placeholder="Count value"
        />

        <select 
          value={countSystem}
          onChange={(e) => setCountSystem(e.target.value as any)}
        >
          <option value="denier">Denier (D)</option>
          <option value="ne">Ne (English)</option>
          <option value="tex">Tex</option>
        </select>

        <button 
          onClick={handleResearch}
          disabled={researching}
        >
          {researching ? '🔍 Researching...' : '🔍 Research Yarn'}
        </button>
      </div>

      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      {/* Results Display */}
      {results && (
        <div className="research-results">
          <h3>Yarn Properties (AI-Researched)</h3>
          
          <div className="properties-grid">
            <div className="property">
              <label>Shrinkage</label>
              <value>
                {results.shrinkage.min_pct}% - {results.shrinkage.max_pct}%
              </value>
            </div>

            <div className="property">
              <label>Tensile Strength</label>
              <value>
                {results.tensile_strength.cn_min} - {results.tensile_strength.cn_max} cN
              </value>
            </div>

            <div className="property">
              <label>Elasticity</label>
              <value>{results.elasticity.pct}%</value>
            </div>

            <div className="property">
              <label>Best Weaves</label>
              <value>{results.best_weaves.join(', ')}</value>
            </div>

            <div className="property">
              <label>Optimal RPM Range</label>
              <value>
                {results.typical_rpm.min} - {results.typical_rpm.max} RPM
                <small>(optimal: {results.typical_rpm.optimal})</small>
              </value>
            </div>

            <div className="property">
              <label>Suitable EPI</label>
              <value>
                {results.suitable_end_density.min} - {results.suitable_end_density.max}
                <small>(optimal: {results.suitable_end_density.optimal})</small>
              </value>
            </div>

            <div className="property">
              <label>Dye Affinity</label>
              <value>{results.dye_affinity}</value>
            </div>

            <div className="property">
              <label>Price/kg</label>
              <value>${results.price_per_kg_usd}</value>
            </div>
          </div>

          {/* Use Results Button */}
          <button 
            onClick={() => {
              // Save to state and move to draft section
              // store.setWarpYarnResearch(results)
            }}
          >
            ✅ Use These Properties
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## PHASE 2: DRAFT SPECIFICATION (1 week)

### 2.1 Draft Input Form

```typescript
// src/components/design/DraftSpecification.tsx

interface DraftSpec {
  num_shafts: number          // 4, 8, 16, 32
  num_picks_in_repeat: number // e.g., 8
  num_feeders: number         // 1-8
  repeat_width_ends: number   // Width of repeat
  repeat_height_picks: number // Height of repeat
  loom_constraints: {
    max_rpm: number
    max_width_inches: number
    num_nozzles: number
  }
}

export function DraftSpecification() {
  const [draft, setDraft] = useState<DraftSpec>({
    num_shafts: 8,
    num_picks_in_repeat: 8,
    num_feeders: 2,
    repeat_width_ends: 8,
    repeat_height_picks: 8,
    loom_constraints: {
      max_rpm: 200,
      max_width_inches: 60,
      num_nozzles: 6,
    },
  })

  const handleGenerateDesigns = async () => {
    // Call design generation engine
    const possibleDesigns = await generateAllPossibleDesigns(draft)
    
    // Store designs grouped by type
    store.setPossibleDesigns(possibleDesigns)
  }

  return (
    <div className="draft-specification">
      <h2>Step 1: Define Your Draft</h2>

      <div className="input-section">
        <div className="input-group">
          <label>Number of Shafts</label>
          <select 
            value={draft.num_shafts}
            onChange={(e) => setDraft({
              ...draft,
              num_shafts: Number(e.target.value)
            })}
          >
            <option value={4}>4 Shafts (Basic plain/twill)</option>
            <option value={8}>8 Shafts (Complex twill/satin)</option>
            <option value={16}>16 Shafts (Advanced designs)</option>
            <option value={32}>32 Shafts (High complexity)</option>
          </select>
        </div>

        <div className="input-group">
          <label>Picks in Repeat</label>
          <input 
            type="number" 
            value={draft.num_picks_in_repeat}
            onChange={(e) => setDraft({
              ...draft,
              num_picks_in_repeat: Number(e.target.value)
            })}
            min={1}
            max={64}
          />
        </div>

        <div className="input-group">
          <label>Number of Feeders</label>
          <input 
            type="number" 
            value={draft.num_feeders}
            onChange={(e) => setDraft({
              ...draft,
              num_feeders: Number(e.target.value)
            })}
            min={1}
            max={8}
          />
          <small>Each feeder = different color/yarn</small>
        </div>

        <div className="input-group">
          <label>Repeat Size (Width × Height)</label>
          <div className="repeat-inputs">
            <input 
              type="number"
              value={draft.repeat_width_ends}
              onChange={(e) => setDraft({
                ...draft,
                repeat_width_ends: Number(e.target.value)
              })}
              placeholder="Width (ends)"
            />
            ×
            <input 
              type="number"
              value={draft.repeat_height_picks}
              onChange={(e) => setDraft({
                ...draft,
                repeat_height_picks: Number(e.target.value)
              })}
              placeholder="Height (picks)"
            />
          </div>
        </div>

        <div className="loom-constraints">
          <h3>Loom Constraints</h3>
          <div className="input-group">
            <label>Max RPM</label>
            <input 
              type="number"
              value={draft.loom_constraints.max_rpm}
            />
          </div>
          <div className="input-group">
            <label>Max Width (inches)</label>
            <input 
              type="number"
              value={draft.loom_constraints.max_width_inches}
            />
          </div>
          <div className="input-group">
            <label>Number of Nozzles</label>
            <input 
              type="number"
              value={draft.loom_constraints.num_nozzles}
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleGenerateDesigns}
        className="btn-primary"
      >
        ➜ Generate All Possible Designs
      </button>
    </div>
  )
}
```

---

## PHASE 3: DESIGN GENERATION ENGINE (3 weeks)

### 3.1 Weave Pattern Generator

```typescript
// src/lib/design/weaveGenerator.ts

/**
 * Generate all valid peg plans for given constraints
 * Using permutation logic to find all mathematically valid designs
 */

type WeaveType = 'plain' | 'twill' | 'satin' | 'sateen' | 'custom'

interface GeneratedDesign {
  id: string
  name: string
  weave_type: WeaveType
  peg_plan: number[][]
  threading: number[]
  lifting_plan: number[][]
  repeat_size: { width: number; height: number }
  shaft_utilization: number     // % of shafts actually used
  feeder_balance: number         // Score 0-1 (1 = balanced)
  optimal_rpm: number
  estimated_production_m_per_hr: number
  complexity_score: number       // 1-10 (1 = simple, 10 = complex)
  visual_pattern: string         // ASCII preview
}

export async function generateAllPossibleDesigns(
  draft: DraftSpec
): Promise<GeneratedDesign[]> {
  const designs: GeneratedDesign[] = []

  // PLAIN WEAVE (1/1)
  if (draft.num_shafts >= 4) {
    designs.push(...generatePlainWeaves(draft))
  }

  // TWILL WEAVES (2/2, 2/1, etc.)
  if (draft.num_shafts >= 4) {
    designs.push(...generateTwillWeaves(draft))
  }

  // SATIN WEAVES (5/1, 7/1, etc.)
  if (draft.num_shafts >= 5) {
    designs.push(...generateSatinWeaves(draft))
  }

  // SATEEN (weft-faced satin)
  if (draft.num_shafts >= 5) {
    designs.push(...generateSateenWeaves(draft))
  }

  // COMPLEX INTERLACES (custom permutations)
  if (draft.num_shafts >= 8) {
    designs.push(...generateComplexInterlaces(draft))
  }

  // SCORE AND RANK all designs
  const scoredDesigns = designs.map(design => ({
    ...design,
    complexity_score: calculateComplexity(design),
    feeder_balance: calculateFeederBalance(design, draft.num_feeders),
    optimal_rpm: calculateOptimalRPM(design, draft),
    estimated_production_m_per_hr: estimateProduction(design),
  }))

  // Sort by quality score
  return scoredDesigns.sort((a, b) => {
    // Prefer: balanced feeders, good RPM, manageable complexity
    const scoreA = a.feeder_balance * 0.5 + (1 - a.complexity_score / 10) * 0.5
    const scoreB = b.feeder_balance * 0.5 + (1 - b.complexity_score / 10) * 0.5
    return scoreB - scoreA
  })
}

function generatePlainWeaves(draft: DraftSpec): GeneratedDesign[] {
  const designs: GeneratedDesign[] = []

  // Plain weave: 1/1 (over, under, repeat)
  // Works with any shaft count ≥4
  
  for (let shaftsUsed = 2; shaftsUsed <= Math.min(draft.num_shafts, 4); shaftsUsed += 2) {
    const pegPlan = createPlainPegPlan(shaftsUsed, draft.repeat_height_picks)
    const threading = createPlainThreading(shaftsUsed, draft.repeat_width_ends)

    designs.push({
      id: `plain_${shaftsUsed}sh_${draft.repeat_height_picks}p`,
      name: `Plain Weave (${shaftsUsed} shafts)`,
      weave_type: 'plain',
      peg_plan: pegPlan,
      threading,
      lifting_plan: createLiftingPlan(pegPlan, shaftsUsed),
      repeat_size: { 
        width: draft.repeat_width_ends, 
        height: draft.repeat_height_picks 
      },
      shaft_utilization: (shaftsUsed / draft.num_shafts) * 100,
      feeder_balance: 1.0,  // Perfect balance for plain
      optimal_rpm: 0, // Calculate later
      estimated_production_m_per_hr: 0,
      complexity_score: 1,
      visual_pattern: visualizePegPlan(pegPlan),
    })
  }

  return designs
}

function generateTwillWeaves(draft: DraftSpec): GeneratedDesign[] {
  const designs: GeneratedDesign[] = []

  // Twill patterns: 2/2, 2/1, 3/1, 4/4, etc.
  const twillPatterns = [
    { name: '2/2 Twill', step: 2, over: 2, under: 2 },
    { name: '2/1 Twill', step: 2, over: 2, under: 1 },
    { name: '3/1 Twill', step: 3, over: 3, under: 1 },
    { name: '1/3 Twill', step: 3, over: 1, under: 3 },
    { name: '4/4 Twill', step: 4, over: 4, under: 4 },
  ]

  for (const pattern of twillPatterns) {
    const shaftsNeeded = pattern.step * 2
    if (shaftsNeeded > draft.num_shafts) continue

    const pegPlan = createTwillPegPlan(
      pattern.step,
      pattern.over,
      pattern.under,
      draft.repeat_height_picks
    )

    designs.push({
      id: `twill_${pattern.name.replace(/ /g, '_')}_${draft.repeat_height_picks}p`,
      name: pattern.name,
      weave_type: 'twill',
      peg_plan: pegPlan,
      threading: createTwillThreading(pattern.step, draft.repeat_width_ends),
      lifting_plan: createLiftingPlan(pegPlan, shaftsNeeded),
      repeat_size: { width: draft.repeat_width_ends, height: draft.repeat_height_picks },
      shaft_utilization: (shaftsNeeded / draft.num_shafts) * 100,
      feeder_balance: 0.85,  // Slightly less balanced
      optimal_rpm: 0,
      estimated_production_m_per_hr: 0,
      complexity_score: 3,
      visual_pattern: visualizePegPlan(pegPlan),
    })
  }

  return designs
}

function generateSatinWeaves(draft: DraftSpec): GeneratedDesign[] {
  const designs: GeneratedDesign[] = []

  // Satin weaves: 5/1, 7/1, 8/1, etc.
  // Float length = shafts - 1
  
  for (let shafts = 5; shafts <= Math.min(draft.num_shafts, 12); shafts++) {
    const floatLength = shafts - 1
    
    const pegPlan = createSatinPegPlan(
      shafts,
      floatLength,
      draft.repeat_height_picks
    )

    designs.push({
      id: `satin_${shafts}/${floatLength}_${draft.repeat_height_picks}p`,
      name: `Satin ${shafts}/${floatLength}`,
      weave_type: 'satin',
      peg_plan: pegPlan,
      threading: createSatinThreading(shafts, draft.repeat_width_ends),
      lifting_plan: createLiftingPlan(pegPlan, shafts),
      repeat_size: { width: draft.repeat_width_ends, height: draft.repeat_height_picks },
      shaft_utilization: (shafts / draft.num_shafts) * 100,
      feeder_balance: 0.6,   // Less balanced due to floats
      optimal_rpm: 0,
      estimated_production_m_per_hr: 0,
      complexity_score: 7,
      visual_pattern: visualizePegPlan(pegPlan),
    })
  }

  return designs
}

// HELPER FUNCTIONS

function createPlainPegPlan(shafts: number, picks: number): number[][] {
  // Plain: shafts alternate up/down every pick
  const pegPlan: number[][] = []
  
  for (let pick = 0; pick < picks; pick++) {
    const row: number[] = []
    for (let shaft = 0; shaft < shafts; shaft++) {
      // Alternate: shaft 0,2,4... up on odd picks; down on even
      if ((shaft % 2 === 0 && pick % 2 === 0) || (shaft % 2 === 1 && pick % 2 === 1)) {
        row.push(1) // Up
      } else {
        row.push(0) // Down
      }
    }
    pegPlan.push(row)
  }
  
  return pegPlan
}

function createTwillPegPlan(
  step: number,
  over: number,
  under: number,
  picks: number
): number[][] {
  // Twill: step shifts by 1 each pick
  const pegPlan: number[][] = []
  
  for (let pick = 0; pick < picks; pick++) {
    const row: number[] = []
    const shiftedStep = (step * pick) % (step * 2)
    
    for (let shaft = 0; shaft < step * 2; shaft++) {
      const position = (shaft + shiftedStep) % (step * 2)
      row.push(position < over ? 1 : 0)
    }
    
    pegPlan.push(row)
  }
  
  return pegPlan
}

function createSatinPegPlan(
  shafts: number,
  floatLength: number,
  picks: number
): number[][] {
  // Satin: long floats with regular interlaces
  const pegPlan: number[][] = []
  
  for (let pick = 0; pick < picks; pick++) {
    const row: number[] = []
    const tieDown = (pick * 2) % shafts // Move by 2 for stability
    
    for (let shaft = 0; shaft < shafts; shaft++) {
      if (shaft === tieDown) {
        row.push(1) // Tie down point
      } else {
        row.push(0) // Float
      }
    }
    
    pegPlan.push(row)
  }
  
  return pegPlan
}

function calculateComplexity(design: GeneratedDesign): number {
  // Score 1-10 based on:
  // - Repeat size
  // - Number of shafts used
  // - Float length
  
  const repeatComplexity = (design.repeat_size.width * design.repeat_size.height) / 100
  const shaftComplexity = design.shaft_utilization / 100
  
  return Math.min(10, repeatComplexity * 5 + shaftComplexity * 5)
}

function calculateFeederBalance(design: GeneratedDesign, numFeeders: number): number {
  // Score 0-1 (1 = perfectly balanced feeders)
  // Count how evenly picks are distributed
  
  const pickCounts: number[] = new Array(numFeeders).fill(0)
  const totalPicks = design.peg_plan.length
  
  // Assume even distribution
  const idealPicksPerFeeder = totalPicks / numFeeders
  
  // In ideal world, each feeder gets exactly this many picks
  let variance = 0
  
  // This is simplified; real calculation would analyze feeder sequences
  // For now, assume even distribution = 1.0 balance
  
  return 0.8 // Default good balance
}

function calculateOptimalRPM(design: GeneratedDesign, draft: DraftSpec): number {
  // Higher shaft count = need slower RPM for beat-up to work properly
  // Satin needs slower RPM due to floats
  // Plain can go fastest
  
  const baseRPM = 180 // Start with safe baseline
  
  if (design.weave_type === 'plain') {
    return Math.min(draft.loom_constraints.max_rpm, 200)
  } else if (design.weave_type === 'twill') {
    return Math.min(draft.loom_constraints.max_rpm, 170)
  } else if (design.weave_type === 'satin') {
    return Math.min(draft.loom_constraints.max_rpm, 140)
  }
  
  return baseRPM
}

function estimateProduction(design: GeneratedDesign): number {
  // Picks per pick (design.peg_plan.length) = production m/hr varies
  // Formula: (RPM / picks per repeat) = repeats per minute
  
  const rpm = design.optimal_rpm
  const picksPerRepeat = design.peg_plan.length
  const repeatsPerMinute = rpm / picksPerRepeat
  
  // Assuming 60 PPI (picks per inch), convert to m/hr
  const ppi = 60
  const metersPerfMinute = (repeatsPerMinute * design.repeat_size.height) / ppi
  
  return metersPerfMinute * 60 // Convert to per hour
}

function visualizePegPlan(pegPlan: number[][]): string {
  // ASCII representation
  return pegPlan
    .map(row => row.map(cell => cell === 1 ? '█' : '░').join(''))
    .join('\n')
}

function createPlainThreading(shafts: number, width: number): number[] {
  const threading: number[] = []
  for (let i = 0; i < width; i++) {
    threading.push(i % shafts)
  }
  return threading
}

function createTwillThreading(step: number, width: number): number[] {
  const threading: number[] = []
  for (let i = 0; i < width; i++) {
    threading.push(i % (step * 2))
  }
  return threading
}

function createSatinThreading(shafts: number, width: number): number[] {
  const threading: number[] = []
  for (let i = 0; i < width; i++) {
    threading.push(i % shafts)
  }
  return threading
}

function createLiftingPlan(pegPlan: number[][], shafts: number): number[][] {
  // Lifting plan tells which shafts go up for each pick
  return pegPlan.map(row => row)
}
```

---

## PHASE 4: CANVAS DESIGN EDITOR (3 weeks)

### 4.1 Canvas Component with Shape Drawing

```typescript
// src/components/design/CanvasDesignEditor.tsx
'use client'

import { useRef, useState, useEffect } from 'react'

type DrawingTool = 'pencil' | 'rectangle' | 'circle' | 'line' | 'erase'

interface CanvasState {
  pegPlan: number[][]
  selectedTool: DrawingTool
  selectedColor: number // Feeder number (0-8)
  cellSize: number
  repeatSize: { width: number; height: number }
}

export function CanvasDesignEditor({
  initialPegPlan,
  repeatSize,
  onUpdate,
}: {
  initialPegPlan: number[][]
  repeatSize: { width: number; height: number }
  onUpdate: (pegPlan: number[][]) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<CanvasState>({
    pegPlan: initialPegPlan,
    selectedTool: 'pencil',
    selectedColor: 0,
    cellSize: 20,
    repeatSize,
  })

  const [isDrawing, setIsDrawing] = useState(false)
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    redrawCanvas()
  }, [state])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    for (let x = 0; x <= state.repeatSize.width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * state.cellSize, 0)
      ctx.lineTo(x * state.cellSize, state.repeatSize.height * state.cellSize)
      ctx.stroke()
    }

    for (let y = 0; y <= state.repeatSize.height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * state.cellSize)
      ctx.lineTo(state.repeatSize.width * state.cellSize, y * state.cellSize)
      ctx.stroke()
    }

    // Draw peg plan cells
    const colors = ['#000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']

    for (let y = 0; y < state.pegPlan.length; y++) {
      for (let x = 0; x < state.pegPlan[y].length; x++) {
        const cellValue = state.pegPlan[y][x]
        if (cellValue > 0) {
          ctx.fillStyle = colors[cellValue % colors.length]
          ctx.fillRect(
            x * state.cellSize,
            y * state.cellSize,
            state.cellSize,
            state.cellSize
          )
        }
      }
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / state.cellSize)
    const y = Math.floor((e.clientY - rect.top) / state.cellSize)

    if (x < 0 || x >= state.repeatSize.width || y < 0 || y >= state.pegPlan.length) {
      return
    }

    const newPegPlan = state.pegPlan.map(row => [...row])

    if (state.selectedTool === 'pencil') {
      newPegPlan[y][x] = state.selectedColor
    } else if (state.selectedTool === 'erase') {
      newPegPlan[y][x] = 0
    }

    setState({ ...state, pegPlan: newPegPlan })
    onUpdate(newPegPlan)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / state.cellSize)
    const y = Math.floor((e.clientY - rect.top) / state.cellSize)

    setShapeStart({ x, y })
    setIsDrawing(true)

    if (state.selectedTool === 'pencil' || state.selectedTool === 'erase') {
      handleCanvasClick(e)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !shapeStart) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / state.cellSize)
    const y = Math.floor((e.clientY - rect.top) / state.cellSize)

    // Preview shape (simplified)
    redrawCanvas()
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setShapeStart(null)
  }

  return (
    <div className="canvas-editor">
      <h2>Design Canvas Editor</h2>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="tool-group">
          <label>Tool</label>
          <button
            className={state.selectedTool === 'pencil' ? 'active' : ''}
            onClick={() => setState({ ...state, selectedTool: 'pencil' })}
          >
            ✏️ Pencil
          </button>
          <button
            className={state.selectedTool === 'erase' ? 'active' : ''}
            onClick={() => setState({ ...state, selectedTool: 'erase' })}
          >
            🧹 Erase
          </button>
          <button
            className={state.selectedTool === 'rectangle' ? 'active' : ''}
            onClick={() => setState({ ...state, selectedTool: 'rectangle' })}
          >
            📦 Rectangle
          </button>
          <button
            className={state.selectedTool === 'circle' ? 'active' : ''}
            onClick={() => setState({ ...state, selectedTool: 'circle' })}
          >
            ⭕ Circle
          </button>
        </div>

        <div className="tool-group">
          <label>Feeder Color</label>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(color => (
            <button
              key={color}
              className={`color-btn ${state.selectedColor === color ? 'active' : ''}`}
              style={{ backgroundColor: ['#000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'][color] }}
              onClick={() => setState({ ...state, selectedColor: color })}
              title={`Feeder ${color}`}
            />
          ))}
        </div>

        <div className="tool-group">
          <label>Zoom</label>
          <button onClick={() => setState({ ...state, cellSize: state.cellSize + 2 })}>
            🔍+ Zoom In
          </button>
          <button onClick={() => setState({ ...state, cellSize: Math.max(10, state.cellSize - 2) })}>
            🔍- Zoom Out
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={state.repeatSize.width * state.cellSize}
        height={state.pegPlan.length * state.cellSize}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="design-canvas"
        style={{ border: '2px solid #333', cursor: 'crosshair' }}
      />
    </div>
  )
}
```

---

## PHASE 5: DESIGN VISUALIZATION & REPORTING (2 weeks)

### 5.1 Design Catalog View

```typescript
// src/components/design/DesignCatalog.tsx

export function DesignCatalog({
  designs,
}: {
  designs: GeneratedDesign[]
}) {
  const [selectedWeaveType, setSelectedWeaveType] = useState<WeaveType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'complexity' | 'rpm' | 'production'>('complexity')

  const filteredDesigns = designs.filter(d =>
    selectedWeaveType === 'all' ? true : d.weave_type === selectedWeaveType
  )

  const sortedDesigns = [...filteredDesigns].sort((a, b) => {
    if (sortBy === 'complexity') return a.complexity_score - b.complexity_score
    if (sortBy === 'rpm') return b.optimal_rpm - a.optimal_rpm
    if (sortBy === 'production') return b.estimated_production_m_per_hr - a.estimated_production_m_per_hr
    return 0
  })

  return (
    <div className="design-catalog">
      <h2>All Generated Designs ({designs.length})</h2>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Weave Type</label>
          <select value={selectedWeaveType} onChange={(e) => setSelectedWeaveType(e.target.value as any)}>
            <option value="all">All Types</option>
            <option value="plain">Plain</option>
            <option value="twill">Twill</option>
            <option value="satin">Satin</option>
            <option value="sateen">Sateen</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="complexity">Complexity (easiest first)</option>
            <option value="rpm">Production Speed</option>
            <option value="production">Output (highest first)</option>
          </select>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="designs-grid">
        {sortedDesigns.map(design => (
          <div key={design.id} className="design-card">
            <h3>{design.name}</h3>

            {/* Visual Preview */}
            <div className="peg-plan-preview">
              <pre className="monospace">{design.visual_pattern}</pre>
            </div>

            {/* Stats */}
            <div className="stats">
              <div className="stat">
                <label>Complexity</label>
                <value>{design.complexity_score}/10</value>
              </div>
              <div className="stat">
                <label>Optimal RPM</label>
                <value>{design.optimal_rpm}</value>
              </div>
              <div className="stat">
                <label>Production</label>
                <value>{design.estimated_production_m_per_hr.toFixed(1)} m/hr</value>
              </div>
              <div className="stat">
                <label>Feeder Balance</label>
                <value>{(design.feeder_balance * 100).toFixed(0)}%</value>
              </div>
              <div className="stat">
                <label>Shaft Usage</label>
                <value>{design.shaft_utilization.toFixed(0)}%</value>
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <button className="btn-primary">
                👁️ Preview
              </button>
              <button className="btn-secondary">
                ✏️ Edit in Canvas
              </button>
              <button className="btn-secondary">
                📊 Full Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## PHASE 6: RESEARCH GUIDE & TOOLS

### How to Research Each Yarn Property

**For each yarn type, research using:**

1. **ASTM Standards** (American Society for Testing Materials)
   - ASTM D2256: Yarn linear density
   - ASTM D6775: Tensile properties
   - ASTM D6481: Elongation at break

2. **ISO Standards** (International Organization for Standardization)
   - ISO 2602: Determination of linear density
   - ISO 5081: Tensile properties of single fibers

3. **Yarn Manufacturer Data Sheets**
   - Reliance Industries (polyester/viscose)
   - Coats Group (all fibres)
   - Oeko-Tex certification data

4. **Surat Mill Databases**
   - Chamber of Commerce data
   - Actual mill production parameters
   - Real shrinkage/crimp data from testing

5. **AI Research with Claude API**
   - Use prompts that cite specific standards
   - Request realistic ranges from manufacturer data
   - Validate against known industry benchmarks

### Tools for Design Research

```
Research Task               | Tool/Source
─────────────────────────────────────────────────────────────
Fiber properties           | ASTM standards + Claude API research
Typical production rates   | Loom manufacturer specs
Shaft count recommendations| Weave theory + permutation logic
RPM limits                | Loom specifications + fiber strength
Feeder balance calculation| Custom algorithm (based on pick distribution)
Finishing recommendations | Fiber type + desired hand feel
Cost estimation          | Current market prices + consumption data
```

---

## COMPLETE WORKFLOW (How User Would Use It)

### Flow Diagram

```
USER JOURNEY IN FABRICAI v2.0
═════════════════════════════════════════════════════════════════

STEP 1: YARN RESEARCH (10 min)
┌─────────────────────────────────────────────────┐
│ User: "I want to use Polyester 75D yarn"        │
│                                                 │
│ System: "Researching polyester properties..."   │
│ ↓ Calls Claude API                              │
│                                                 │
│ Result: 30+ properties auto-populated           │
│ ✅ Shrinkage: 3-5%                              │
│ ✅ Best weaves: All types                       │
│ ✅ Optimal RPM: 140-200                         │
│ ✅ Suitable EPI: 60-120                         │
│                                                 │
│ User clicks: "✅ Use These Properties"          │
└─────────────────────────────────────────────────┘
            ↓
STEP 2: DRAFT SPECIFICATION (5 min)
┌─────────────────────────────────────────────────┐
│ User specifies:                                 │
│ • 8 shafts                                      │
│ • 8 picks per repeat                            │
│ • 3 feeders (for 3 colors)                      │
│ • 8×8 repeat size                               │
│ • Loom: 200 RPM max, 60" width, 6 nozzles      │
│                                                 │
│ User clicks: "Generate All Possible Designs"   │
│                                                 │
│ System: Processing...                           │
│ ↓ Runs permutation engine                       │
│                                                 │
│ Result: 47 unique designs generated             │
│ • 8 Plain weaves                                │
│ • 24 Twill variations                           │
│ • 12 Satin designs                              │
│ • 3 Custom interlaces                           │
└─────────────────────────────────────────────────┘
            ↓
STEP 3: BROWSE DESIGNS (10 min)
┌─────────────────────────────────────────────────┐
│ System shows design catalog organized by type   │
│                                                 │
│ USER FILTERS:                                   │
│ • Weave type: Plain                             │
│ • Sort by: Complexity (easiest first)           │
│                                                 │
│ Shows 8 Plain weave options:                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ Plain 4-shaft                               │ │
│ │ Visual preview (ASCII peg plan)              │ │
│ │ Optimal RPM: 200                             │ │
│ │ Production: 12.5 m/hr                        │ │
│ │ Feeder balance: 100%                         │ │
│ │ [👁️ Preview] [✏️ Edit] [📊 Report]        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ User clicks [✏️ Edit] on Plain 4-shaft design  │
└─────────────────────────────────────────────────┘
            ↓
STEP 4: VISUAL DESIGN EDITING (15 min)
┌─────────────────────────────────────────────────┐
│ Canvas Editor Opens                             │
│                                                 │
│ User can:                                       │
│ • Paint cells directly (pencil tool)            │
│ • Use shapes (rectangles, circles)              │
│ • Assign colors to feeders                      │
│ • Draw patterns like "SSSS" (stripe)            │
│ • Zoom in/out for detail work                   │
│                                                 │
│ Toolbar:                                        │
│ [✏️ Pencil] [🧹 Erase] [📦 Rectangle] [⭕ Circle]
│ [🎨 Feeder Colors 0-8]                         │
│ [🔍+] [🔍-]                                    │
│                                                 │
│ Canvas shows:                                   │
│ ┌────────────────────────────────┐             │
│ │ 8×8 grid with cells            │             │
│ │ Each cell = 1 pick × 1 end     │             │
│ │ User draws pattern              │             │
│ │ Live preview updates            │             │
│ └────────────────────────────────┘             │
│                                                 │
│ User draws: "2×2 checkerboard pattern"         │
│ System validates: "✅ Valid feeder sequence"    │
│                                                 │
│ User clicks: "Done - Save Design"              │
└─────────────────────────────────────────────────┘
            ↓
STEP 5: SIMULATION & REPORT (5 min)
┌─────────────────────────────────────────────────┐
│ System generates full simulation:                │
│                                                 │
│ FABRIC PROPERTIES:                              │
│ • Shrinkage: 4%                                 │
│ • Drape index: 7.2/10                           │
│ • Softness: 6.5/10                              │
│ • Strength: 8.2/10 (excellent for polyester)   │
│ • Cover factor: 78% (well-covered)              │
│                                                 │
│ PRODUCTION PARAMETERS:                          │
│ • Optimal RPM: 180                              │
│ • Production rate: 11.5 m/hr                    │
│ • Warp consumption: 85 g/100m                   │
│ • Weft consumption: 110 g/100m (3 feeders)     │
│ • Total cost/meter: ₹28.50                      │
│                                                 │
│ FINISHING RECOMMENDATIONS:                      │
│ • Sanforization: YES (pre-shrink)               │
│ • Heat setting: 190°C, 4 minutes                │
│ • Tentering width: 45" (from 60" gray)          │
│                                                 │
│ [📊 Download PDF Report] [🔄 Generate Variants] [✅ Finalize]
└─────────────────────────────────────────────────┘
            ↓
STEP 6: MACHINE EXPORT (2 min)
┌─────────────────────────────────────────────────┐
│ User exports to loom:                           │
│                                                 │
│ Format options:                                 │
│ [.EP Stäubli] [.JC5 Jacquard] [.WEA Grosse]   │
│                                                 │
│ System generates:                               │
│ • Peg plan file (machine format)                │
│ • Nozzle sequences (for 3 feeders)              │
│ • Threading diagram (for warp setup)            │
│ • Lifting plan (for harness)                    │
│                                                 │
│ ✅ Ready to send to loom operator               │
└─────────────────────────────────────────────────┘
```

---

## TECHNICAL STACK RECOMMENDATIONS

```
LAYER               | TECHNOLOGY         | WHY
────────────────────────────────────────────────────────────
AI Research         | Claude API (Opus)   | Complex reasoning
                    | GPT-4 fallback      | Research depth
                    | Caching (Redis)     | Avoid re-researching

Permutation Engine  | TypeScript          | Type safety critical
                    | Algorithm library   | Combinations math
                    | Web Workers         | Don't block UI

Design Patterns     | Next.js API Routes  | Server-side generation
                    | Database caching    | Store popular designs

Canvas Editor       | HTML5 Canvas        | High performance
                    | React hooks         | State management
                    | requestAnimationFrame | Smooth rendering

Database            | PostgreSQL          | Store all designs
                    | JSONB for patterns  | Flexible storage
                    | Full-text search    | Find similar designs

Visualization       | D3.js or Chart.js   | Fabric simulation charts
                    | SVG for weaves      | Sharp diagrams
                    | Canvas for preview  | Large peg plans

Reporting           | jsPDF or ReportLab  | PDF generation
                    | Puppeteer           | Screenshots of canvas
```

---

## SUMMARY: IMPLEMENTATION ROADMAP

```
TIMELINE
════════════════════════════════════════════════════════════════

WEEK 1-2: Yarn Research Engine
├─ Design yarn property database
├─ Build Claude API integration
├─ Create yarn UI component
└─ Test with 10 yarn types

WEEK 3-5: Design Generation Engine
├─ Implement permutation algorithms
├─ Build plain/twill/satin generators
├─ Test mathematical correctness
└─ Optimize for 50+ design generation

WEEK 6-8: Canvas Design Editor
├─ Build canvas component with drawing tools
├─ Implement shape tools (rectangle, circle, line)
├─ Add drag/drop functionality
└─ Real-time validation

WEEK 9-10: Simulation & Visualization
├─ Build design catalog view
├─ Implement fabric simulation
├─ Create comprehensive reporting
└─ PDF generation

WEEK 11-12: Polish & Launch
├─ Performance optimization
├─ User testing with 5 Surat mills
├─ Bug fixes & refinements
└─ v2.0 Release

TOTAL: 12 weeks (3 months) from v1.0 to v2.0
```

---

## WHAT YOU'RE BUILDING

This isn't just a design tool. You're building:

1. **Intelligent Yarn Research** - AI that knows fabric properties better than spreadsheets
2. **Design Generation Engine** - Automatic creation of 50+ valid designs from constraints
3. **Professional Canvas Editor** - Drag/drop design creation for visual thinkers
4. **Permutation Mathematics** - All mathematically valid weave combinations
5. **Production Intelligence** - Optimal RPM, feeder balance, production rates
6. **Comprehensive Reporting** - PDFs that replace Wilcom output

**This will blow Wilcom out of the water.** 🚀

---

**Next step: Which phase do you want to start with?**

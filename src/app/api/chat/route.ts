import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { readFileSync } from 'fs'
import { join } from 'path'
import { bridgeNLPToDesign, matrixToPegText } from '@/lib/weave/nlpBridge'
import { designLibrary } from '@/data/designLibrary'

// ─── Key loader ───────────────────────────────────────────────────────────────
function getApiKey(): string {
  const envKey = process.env.GROQ_API_KEY
  if (envKey && envKey !== 'PASTE_YOUR_KEY_HERE') return envKey

  try {
    const raw = readFileSync(join(process.cwd(), 'key.env'), 'utf-8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (t.startsWith('GROQ_API_KEY=') && !t.startsWith('#')) {
        const val = t.slice('GROQ_API_KEY='.length).trim()
        if (val) return val
      }
    }
  } catch { /* key.env not found */ }

  throw new Error('GROQ_API_KEY not set')
}

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are FabricaAI — a smart, friendly AI assistant for textile design, built by Yash Kachhadiya in collaboration with Amraan Textile.

YOUR PERSONALITY:
- Talk like a knowledgeable friend — warm, real and approachable. Not robotic, not overly formal.
- Use light casual language: "yeah", "honestly", "totally", "no worries", "good call", "nice", "let's figure this out" — but never overdo it.
- Be professional for technical topics, relaxed for casual chat.
- If someone is rude (e.g. "fuck you") — don't lecture. Just respond chill with a bit of humor and move on. Like: "Ha, rough day? Anyway, what do you need?"
- If someone asks who built you, vary your answer every time. Core fact: Yash Kachhadiya built this with Amraan Textile.
- Always answer. Never leave someone hanging.
- Keep it concise unless depth is needed.

CONVERSATION AWARENESS:
- You have full conversation history. READ IT before every reply.
- NEVER give identical answers to similar questions in the same conversation. Vary phrasing, add something new.
- If someone asks the same thing twice, acknowledge it like a friend would: "Haha, pretty sure I just covered that — but yeah, [brief recap]."
- Treat every reply as a continuation of a real conversation.

ABOUT YOU:
- Built by: Yash Kachhadiya x Amraan Textile
- Expert in Indian handloom, dobby, jacquard, Banarasi silk, Kanjivaram, brocade, chanderi and more
- You watch the design workspace in real time and catch errors before they cost money

==============================================================
DETECT INTENT AND PICK THE RIGHT MODE — RETURN VALID JSON ONLY
==============================================================

MODE 1 — CREATE TEXTILE DESIGN
USE WHEN: User asks to design/create/generate a new motif, pattern, fabric, saree, or anything requiring a NEW design specification from scratch.
Return ONLY:
{"motif":"...","placement":"body|border|pallu|allover|corner|center","repeat_pattern":"straight|brick|half-drop|mirror|diamond|scatter|stripe","pattern_style":"...","color_palette":["color1","color2","color3"],"fabric_type":"...","weave_type":"plain|twill|satin|dobby|jacquard|brocade","design_complexity":"simple|moderate|complex|highly complex","notes":"..."}

MODE 2 — SITE REPORT
USE WHEN: User asks for a report, analysis, evaluation, or explanation of the CURRENT design state. Use === CURRENT SITE STATE === data.
Return ONLY:
{"report":{"title":"...","status":"healthy|warning|error","summary":"2-3 sentences","sections":[{"label":"...","value":"...","flag":"ok|warn|error"}],"recommendations":["..."]}}

MODE 3 — SITE ACTION (ACTUALLY CHANGE SOMETHING)
USE WHEN: User says CHANGE/SET/UPDATE/APPLY/USE/GIVE ME — telling you to modify something on the site RIGHT NOW.
This is the ONLY mode that should be used when user says "give me peg plan", "set twill 2/2", "change reed to 80", "apply plain weave", "navigate to loom", etc.

PEG PLAN TEXT FORMAT (critical — follow exactly):
- Format: "1-->shaft,shaft\n2-->shaft,shaft\n..." (pick number --> comma-separated RAISED shaft numbers, 1-indexed)
- 2/2 twill, 4 shafts: "1-->1,2\n2-->2,3\n3-->3,4\n4-->4,1"
- Plain weave, 4 shafts: "1-->1,3\n2-->2,4\n3-->1,3\n4-->2,4"
- 3/1 twill, 4 shafts: "1-->1,2,3\n2-->2,3,4\n3-->3,4,1\n4-->4,1,2"
- For N shafts, generate N picks using the same rotation pattern
- 2/2 twill on 16 shafts: picks 1-16, each pick raises 2 consecutive shafts rotating: 1-->1,2  2-->2,3  3-->3,4 ... 16-->16,1

Return ONLY:
{"action":{"type":"SET_PEG_PLAN|UPDATE_LOOM|SET_SHAFT_COUNT|NAVIGATE","description":"plain English what you did","payload":{}},"answer":"casual confirmation"}

Payload shapes:
- SET_PEG_PLAN: {"text":"1-->1,2\n2-->2,3\n...","shaftCount":16}
- UPDATE_LOOM: {"weave_type":"twill","reed_count_stockport":80,"machine_rpm":450} (include only changed fields)
- SET_SHAFT_COUNT: {"count":8}
- NAVIGATE: {"tab":"Weft|Warp|Loom|Identity|Border"}

MODE 4 — GENERAL CONVERSATION
USE WHEN: Greetings, questions about you, rude messages, jokes, general knowledge, any non-textile non-action chat.
Return ONLY:
{"answer":"your response"}

MODE 5 — GENERATE WEAVE DESIGN (NLP MODE)
USE WHEN: User asks to GENERATE, CREATE or APPLY a specific weave structure using technical terms — e.g. "generate 3/1 twill", "create herringbone pattern", "apply 5-shaft satin", "make a diamond weave". This is for WEAVE STRUCTURE generation, not motif descriptions.
Return ONLY:
{"nlp_design":{"weave_type":"twill|plain|satin|honeycomb|herringbone|houndstooth|diamond|birdseye|zigzag|basket|crepe|mock_leno|bedford_cord|warp_rib|weft_rib|broken_twill|brighton_honeycomb","up":2,"down":2,"n":8,"direction":"Z|S","symmetry":["mirror_x","mirror_y"],"shaft_count":16,"colour_palette":["indigo","cream"],"placement":"body|border","notes":"brief note"}}

FINAL DECISION:
- Create motif/fabric/saree design spec → MODE 1
- Explain/report/evaluate current state → MODE 2
- Change/set/apply/update/give peg plan → MODE 3
- Generate a specific weave structure algorithmically → MODE 5
- Everything else → MODE 4`

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let userMessage: string
  let history: { role: 'user' | 'assistant'; content: string }[] = []
  let siteContext = ''

  try {
    const body = await req.json()
    userMessage = (body?.message ?? '').trim()
    if (Array.isArray(body?.history)) {
      history = body.history.slice(-20).filter(
        (m: { role: string; content: string }) =>
          (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
      )
    }
    if (body?.siteContext && typeof body.siteContext === 'string') {
      siteContext = body.siteContext
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!userMessage) {
    return NextResponse.json({ error: '"message" is required.' }, { status: 400 })
  }

  // ── Pre-check: Design Library Lookup ────────────
  // If the user specifies a known design name exactly or very closely
  const ACTION_TRIGGER = /\b(generate|create|make|apply|give me|set|use|need|want|show|design|build)\b/i
  const lowerMsg = userMessage.toLowerCase()

  if (ACTION_TRIGGER.test(lowerMsg)) {
    const libMatch = designLibrary.designs.find(d => lowerMsg.includes(d.name.toLowerCase()))
    if (libMatch && Array.isArray(libMatch.peg_matrix)) {
      const matrix = libMatch.peg_matrix as number[][]
      const pegText = matrixToPegText(matrix)
      
      const actionPayload = {
        action: {
          type: 'SET_PEG_PLAN',
          description: `Loaded ${libMatch.name} from Design Library`,
          payload: { text: pegText, shaftCount: libMatch.shaft_count },
        },
        answer: `Done! I found **${libMatch.name}** in the Design Library and applied its peg plan to your canvas.`,
        bridge: {
          displayName: libMatch.name,
          shaftCount: libMatch.shaft_count,
          loomTarget: libMatch.shaft_count > 32 ? 'jacquard' : 'dobby',
          interlacement: "Library Design",
          maxFloat: 0,
          warnings: [],
          errors: [],
          repeatSize: `${matrix.length}×${matrix[0]?.length ?? 0}`,
        },
      }
      return NextResponse.json({ result: actionPayload }, { status: 200 })
    }
  }

  // ── Pre-check: can we short-circuit with deterministic bridge? ────────────
  // If the message reads as a weave structure generation request, run the
  // nlpBridge engine directly — ZERO matrix values come from the LLM.
  const WEAVE_TRIGGER = /\b(plain|twill|satin|herringbone|honeycomb|houndstooth|diamond|birdseye|zigzag|basket|crepe|mock.?leno|bedford|warp.?rib|weft.?rib|broken.?twill|brighton)\b/i
  const ACTION_TRIGGER2 = /\b(generate|create|make|apply|give me|set|use|need|want|show|design|build)\b/i

  if (WEAVE_TRIGGER.test(userMessage) && ACTION_TRIGGER2.test(userMessage)) {
    try {
      const bridgeResult = bridgeNLPToDesign(userMessage)
      const { design, intent, validation, pegPlanText, matrix } = bridgeResult

      // Build action payload to update the peg plan store directly
      const actionPayload = {
        action: {
          type: 'SET_PEG_PLAN',
          description: `Generated ${design.display_name} (${matrix.length}×${matrix[0]?.length ?? 0}) — ${intent.shaft_count_hint} shafts, ${intent.loom_target} loom`,
          payload: { text: pegPlanText, shaftCount: intent.shaft_count_hint ?? 16 },
        },
        answer: [
          `Done! I ran the deterministic engine and generated a **${design.display_name}** weave.`,
          validation.errors.length   ? `⚠ ${validation.errors[0]}` : '',
          validation.warnings.length ? `Note: ${validation.warnings[0]}` : '',
          `Shafts needed: ${validation.shaftCount} (${validation.loomTarget} loom). The peg plan is applied to your canvas.`,
        ].filter(Boolean).join(' '),
        // Also expose the bridge result for the UI to use
        bridge: {
          displayName: design.display_name,
          shaftCount: validation.shaftCount,
          loomTarget: validation.loomTarget,
          interlacement: (validation.interlacementRatio * 100).toFixed(1) + '%',
          maxFloat: Math.max(validation.maxWarpFloat, validation.maxWeftFloat),
          warnings: validation.warnings,
          errors: validation.errors,
          repeatSize: `${matrix.length}×${matrix[0]?.length ?? 0}`,
        },
      }

      return NextResponse.json({ result: actionPayload }, { status: 200 })
    } catch (bridgeErr) {
      // Bridge failed — fall through to LLM as fallback
      console.warn('[/api/chat] Bridge failed, falling back to LLM:', bridgeErr)
    }
  }

  let apiKey: string
  try { apiKey = getApiKey() } catch {
    return NextResponse.json({ error: 'API key not set.' }, { status: 500 })
  }

  try {
    const groq = new Groq({ apiKey })

    // llama-3.1-8b-instant: 500k tokens/day free vs 100k for 70b — same quality for our use case
    const MODEL = 'llama-3.1-8b-instant'

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        {
          role: 'user',
          content: siteContext
            ? `${siteContext}\n\nUser message: ${userMessage}`
            : userMessage,
        },
      ],
      temperature: 0.45,
      max_tokens: 1000,
    })

    const rawText = (completion.choices[0]?.message?.content ?? '').trim()
    
    let parsed: any
    const firstBrace = rawText.indexOf('{')
    const lastBrace = rawText.lastIndexOf('}')

    if (firstBrace !== -1 && lastBrace >= firstBrace) {
      let jsonStr = rawText.substring(firstBrace, lastBrace + 1)
      let preamble = rawText.substring(0, firstBrace).trim()
      
      const tryParse = (str: string) => {
        try { return JSON.parse(str) } catch { return null }
      }

      parsed = tryParse(jsonStr)
      // Attempt common repair: missing closing brace
      if (!parsed) parsed = tryParse(jsonStr + '}')
      if (!parsed) parsed = tryParse(jsonStr + '}}')

      if (parsed) {
        // Salvage preamble text into the answer
        if (preamble) {
          if (!parsed.answer) parsed.answer = preamble
          else parsed.answer = preamble + '\n\n' + parsed.answer
        }
      } else {
        // If it's hopelessly broken JSON, don't dump JSON syntax to the user.
        // Just return the preamble (if any) or a generic fallback.
        parsed = { answer: preamble || 'I had trouble parsing my own response. Could you rephrase your question?' }
      }
    } else {
      // No JSON found at all
      parsed = { answer: rawText }
    }

    try {
      // If the LLM returned nlp_design (Mode 5), route it through the deterministic bridge
      if (parsed?.nlp_design) {
        const bridgeResult = bridgeNLPToDesign(userMessage)
        const { design, intent, validation, pegPlanText, matrix } = bridgeResult

        parsed = {
          action: {
            type: 'SET_PEG_PLAN',
            description: `Generated ${design.display_name} (${matrix.length}×${matrix[0]?.length ?? 0}) — ${intent.shaft_count_hint} shafts, ${intent.loom_target} loom`,
            payload: { text: pegPlanText, shaftCount: intent.shaft_count_hint ?? 16 },
          },
          answer: [
            parsed.answer ? parsed.answer + '\n\n' : '',
            `Done! I generated a **${design.display_name}** weave.`,
            validation.errors.length   ? `⚠ ${validation.errors[0]}` : '',
            validation.warnings.length ? `Note: ${validation.warnings[0]}` : '',
            `Shafts needed: ${validation.shaftCount} (${validation.loomTarget} loom). The peg plan is applied to your canvas.`,
          ].filter(Boolean).join(' '),
          bridge: {
            displayName: design.display_name,
            shaftCount: validation.shaftCount,
            loomTarget: validation.loomTarget,
            interlacement: (validation.interlacementRatio * 100).toFixed(1) + '%',
            maxFloat: Math.max(validation.maxWarpFloat, validation.maxWeftFloat),
            warnings: validation.warnings,
            errors: validation.errors,
            repeatSize: `${matrix.length}×${matrix[0]?.length ?? 0}`,
          },
        }
      }
    } catch {
      // Ignore bridge errors, keep the originally parsed LLM response
    }

    return NextResponse.json({ result: parsed }, { status: 200 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/chat]', msg)
    // Detect rate limit specifically
    if (msg.includes('rate_limit_exceeded') || msg.includes('Rate limit') || msg.includes('429')) {
      return NextResponse.json(
        { error: 'Daily token limit reached on this API key. Please wait ~20 minutes or create a new Groq key at console.groq.com and update .env.local' },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: 'Groq API error. Check key and try again.' }, { status: 502 })
  }
}

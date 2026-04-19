'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSiteContext } from '@/hooks/useSiteContext'
import { useDesignStore } from '@/lib/store/designStore'
import { textToMatrix } from '@/lib/pegplan/parser'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DesignResult {
  motif?: string; placement?: string; repeat_pattern?: string
  pattern_style?: string; color_palette?: string[]; fabric_type?: string
  weave_type?: string; design_complexity?: string; notes?: string; answer?: string
  report?: {
    title: string; status: 'healthy' | 'warning' | 'error'
    summary: string
    sections: { label: string; value: string; flag: 'ok' | 'warn' | 'error' }[]
    recommendations: string[]
  }
  action?: {
    type: 'SET_PEG_PLAN' | 'UPDATE_LOOM' | 'SET_SHAFT_COUNT' | 'NAVIGATE'
    description: string
    payload: Record<string, unknown>
  }
  /** Populated when the deterministic nlpBridge ran server-side */
  bridge?: {
    displayName: string
    shaftCount: number
    loomTarget: 'dobby' | 'jacquard'
    interlacement: string
    maxFloat: number
    repeatSize: string
    warnings: string[]
    errors: string[]
  }
}
interface ChatMessage {
  role: 'user' | 'ai'; text?: string; result?: DesignResult
  loading?: boolean; error?: boolean; warning?: boolean
}
interface DesignWarning { id: string; message: string; severity: 'warn' | 'error' }

// ─── Weave Engine Card ────────────────────────────────────────────────────────
function WeaveCard({ b }: { b: NonNullable<DesignResult['bridge']> }) {
  const loomColor = b.loomTarget === 'jacquard' ? '#7c3aed' : '#0891b2'
  const floatOk   = b.maxFloat <= 6
  const hasIssues = b.errors.length > 0 || b.warnings.length > 0
  return (
    <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(8,145,178,0.04)', borderRadius: 10, border: '1px solid rgba(8,145,178,0.15)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: 10 }}>⚡</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Engine Output</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: `${loomColor}14`, color: loomColor, border: `1px solid ${loomColor}30` }}>{b.loomTarget.toUpperCase()}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
        {[
          ['Design', b.displayName],
          ['Repeat', b.repeatSize],
          ['Shafts', String(b.shaftCount)],
          ['Interlacement', b.interlacement],
          ['Max Float', `${b.maxFloat} picks`, floatOk],
        ].map(([label, val, ok]) => (
          <div key={label as string} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em', minWidth: 68 }}>{label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: ok === false ? '#E0115F' : '#1D1D1F' }}>{val}</span>
          </div>
        ))}
      </div>
      {hasIssues && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {b.errors.map((e, i) => <div key={i} style={{ fontSize: 10, color: '#E0115F' }}>✗ {e}</div>)}
          {b.warnings.slice(0,2).map((w, i) => <div key={i} style={{ fontSize: 10, color: '#d97706' }}>⚠ {w}</div>)}
        </div>
      )}
    </div>
  )
}

// ─── Action Card ─────────────────────────────────────────────────────────────
function ActionCard({ a, answer }: { a: NonNullable<DesignResult['action']>; answer?: string }) {
  const icons: Record<string, string> = { SET_PEG_PLAN: '⊟', UPDATE_LOOM: '⚙️', SET_SHAFT_COUNT: '🔢', NAVIGATE: '📍' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <span style={{ fontSize: 14 }}>{icons[a.type] ?? '⚡'}</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action Applied</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' }}>{a.type.replace(/_/g, ' ')}</span>
      </div>
      <div style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>{a.description}</div>
      {answer && <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', lineHeight: 1.6 }}>{answer}</div>}
    </div>
  )
}

// ─── Report Card ─────────────────────────────────────────────────────────────
function ReportCard({ r }: { r: NonNullable<DesignResult['report']> }) {
  const sc: Record<string, string> = { healthy: '#16a34a', warning: '#d97706', error: '#E0115F' }
  const fc: Record<string, string> = { ok: '#16a34a', warn: '#d97706', error: '#E0115F' }
  const fi: Record<string, string> = { ok: '✓', warn: '⚠', error: '✗' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#E0115F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📊 Design Report</span>
        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${sc[r.status]}14`, color: sc[r.status], border: `1px solid ${sc[r.status]}30`, textTransform: 'uppercase' }}>{r.status}</span>
      </div>
      <div style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>{r.summary}</div>
      {r.sections?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {r.sections.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, color: fc[s.flag], flexShrink: 0, marginTop: 1 }}>{fi[s.flag]}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.4)', minWidth: 80, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
              <span style={{ fontSize: 12, color: '#1D1D1F', flex: 1 }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
      {r.recommendations?.length > 0 && (
        <div style={{ padding: '8px 10px', background: 'rgba(224,17,95,0.04)', borderRadius: 8, border: '1px solid rgba(224,17,95,0.12)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#E0115F', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendations</div>
          {r.recommendations.map((rec, i) => (
            <div key={i} style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>• {rec}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Design Card ─────────────────────────────────────────────────────────────
function DesignCard({ r }: { r: DesignResult }) {
  if (r.answer) return (
    <div style={{ fontSize: 13, lineHeight: 1.75, color: '#333', whiteSpace: 'pre-wrap' }}>{r.answer}</div>
  )
  const rows = [
    { k: 'Motif', v: r.motif }, { k: 'Placement', v: r.placement },
    { k: 'Repeat', v: r.repeat_pattern }, { k: 'Style', v: r.pattern_style },
    { k: 'Fabric', v: r.fabric_type }, { k: 'Weave', v: r.weave_type },
  ]
  const cc: Record<string, string> = { simple: '#16a34a', moderate: '#d97706', complex: '#E0115F', 'highly complex': '#7c3aed' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.07)', marginBottom: 2 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#E0115F', textTransform: 'uppercase', letterSpacing: '0.1em' }}>✦ Design Spec</span>
        {r.design_complexity && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${cc[r.design_complexity] ?? '#888'}14`, color: cc[r.design_complexity] ?? '#888', border: `1px solid ${cc[r.design_complexity] ?? '#888'}30`, textTransform: 'capitalize' }}>{r.design_complexity}</span>
        )}
      </div>
      {rows.filter(r => r.v).map(({ k, v }) => (
        <div key={k} style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.35)', minWidth: 62, textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: 1 }}>{k}</span>
          <span style={{ fontSize: 12, color: '#1D1D1F', lineHeight: 1.5, flex: 1 }}>{v}</span>
        </div>
      ))}
      {r.color_palette?.length && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.35)', minWidth: 62, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Colors</span>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {r.color_palette.map((c, i) => (
              <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'rgba(0,0,0,0.05)', color: '#333', border: '1px solid rgba(0,0,0,0.1)' }}>{c}</span>
            ))}
          </div>
        </div>
      )}
      {r.notes && (
        <div style={{ marginTop: 6, padding: '8px 10px', background: 'rgba(224,17,95,0.04)', borderRadius: 8, border: '1px solid rgba(224,17,95,0.12)', fontSize: 11, color: '#555', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: '#E0115F' }}>Notes: </span>{r.notes}
        </div>
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#E0115F', animation: `jdot 1.2s ${i * 0.2}s infinite`, opacity: 0.7 }} />
      ))}
      <style>{`@keyframes jdot{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  )
}

// ─── Orb FAB ─────────────────────────────────────────────────────────────────
function OrbButton({ onClick, warnings, side }: { onClick: () => void; warnings: DesignWarning[]; side: 'left' | 'right' }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, [side]: 28, zIndex: 9998 }}>
      <style>{`
        @keyframes orbpulse{0%,100%{box-shadow:0 0 0 0 rgba(224,17,95,0.35),0 6px 24px rgba(224,17,95,0.4)}60%{box-shadow:0 0 0 10px rgba(224,17,95,0),0 6px 24px rgba(224,17,95,0.5)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes wbadge{from{transform:scale(0)}to{transform:scale(1)}}
      `}</style>
      {warnings.length > 0 && (
        <div style={{ position: 'absolute', top: -5, right: side === 'right' ? -5 : undefined, left: side === 'left' ? -5 : undefined, width: 18, height: 18, background: '#FF3B30', borderRadius: '50%', border: '2px solid #fff', fontSize: 8, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, animation: 'wbadge 0.3s ease' }}>{warnings.length}</div>
      )}
      <button onClick={onClick} title="FabricaAI (⌘J)" style={{ width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#E0115F,#BA0C5D)', animation: 'orbpulse 2.5s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s', boxShadow: '0 4px 20px rgba(224,17,95,0.4)' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1.5px solid transparent', borderTopColor: 'rgba(255,255,255,0.5)', animation: 'spin 3s linear infinite' }} />
        <img src="/logo.png" alt="AI" style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover', position: 'relative', zIndex: 1 }} />
      </button>
      <div style={{ position: 'absolute', bottom: -16, [side]: 0, fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>⌘J</div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function GlobalAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [side, setSide] = useState<'left' | 'right'>('right')
  const [panelWidth, setPanelWidth] = useState(400)
  const [chatLog, setChatLog] = useState<ChatMessage[]>([{
    role: 'ai',
    text: `Hi! I'm FabricaAI — your intelligent design assistant.\n\nI monitor your workspace in real time and warn you about design errors. Ask me anything while you keep working — the panel stays open beside your canvas.\n\nTry: "Evaluate my border design" or "What weave suits this motif?"`,
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toPromptString, snapshot } = useSiteContext()
  const store = useDesignStore()
  const [warnings, setWarnings] = useState<DesignWarning[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null)
  const [isResizing, setIsResizing] = useState(false)

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') { e.preventDefault(); setIsOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l' && isOpen) { e.preventDefault(); setChatLog([{ role: 'ai', text: 'Chat cleared. Ready.' }]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 80); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  }, [isOpen, chatLog])

  // ── Panel resize drag ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isResizing) return
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      const delta = side === 'right' ? resizeRef.current.startX - e.clientX : e.clientX - resizeRef.current.startX
      setPanelWidth(Math.max(300, Math.min(720, resizeRef.current.startW + delta)))
    }
    const onUp = () => setIsResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [isResizing, side])


  useEffect(() => {
    const h = (e: Event) => { const text = (e as CustomEvent).detail?.text; if (text) setChatLog(prev => [...prev, { role: 'ai', text }]) }
    window.addEventListener('ai-response', h)
    return () => window.removeEventListener('ai-response', h)
  }, [])

  // ── Proactive warnings ────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e: Event) => {
      const result = (e as CustomEvent).detail?.result as DesignResult | undefined
      if (!result) return
      const add: DesignWarning[] = []
      if (result.design_complexity === 'highly complex') add.push({ id: 'hc', severity: 'warn', message: 'Highly complex design — confirm your loom supports the required shaft count.' })
      if (result.weave_type === 'jacquard' && result.fabric_type?.includes('georgette')) add.push({ id: 'jg', severity: 'error', message: 'Jacquard + Georgette is high risk — open weave structure may distort at high shaft counts.' })
      if (result.notes?.toLowerCase().includes('300')) add.push({ id: 'hd', severity: 'warn', message: 'Thread density > 300/inch detected — verify your reed capacity.' })
      if (add.length) setWarnings(prev => { const ids = new Set(prev.map(w => w.id)); return [...prev, ...add.filter(w => !ids.has(w.id))] })
    }
    window.addEventListener('ai-design-update', h)
    return () => window.removeEventListener('ai-design-update', h)
  }, [])

  // ── Execute site actions ─────────────────────────────────────────────────
  const executeAction = useCallback((action: NonNullable<DesignResult['action']>) => {
    const { type, payload } = action
    try {
      if (type === 'SET_PEG_PLAN') {
        const text = (payload.text as string) ?? ''
        const shaftCount = (payload.shaftCount as number) ?? store.shaftCount ?? 16
        const matrix = textToMatrix(text, shaftCount)
        store.setPegPlan(text, matrix)
      } else if (type === 'UPDATE_LOOM') {
        store.updateLoom(payload as Parameters<typeof store.updateLoom>[0])
      } else if (type === 'SET_SHAFT_COUNT') {
        store.setShaftCount(payload.count as number)
      } else if (type === 'NAVIGATE') {
        // Dispatch to the tab system
        window.dispatchEvent(new CustomEvent('ai-navigate', { detail: { tab: payload.tab } }))
      }
    } catch (e) {
      console.warn('[FabricaAI] Action failed:', e)
    }
  }, [store])

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return
    const history = chatLog
      .filter(m => !m.loading && !m.error && (m.text || m.result))
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text ?? (m.result ? JSON.stringify(m.result) : '') }))
    setInput('')
    setIsLoading(true)
    setChatLog(prev => [...prev, { role: 'user', text }, { role: 'ai', loading: true }])
    window.dispatchEvent(new CustomEvent('ai-command', { detail: { text } }))
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          context: snapshot.activeSection,
          siteContext: toPromptString(),   // live design state injected here
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setChatLog(prev => [...prev.slice(0, -1), { role: 'ai', text: data.error ?? 'Something went wrong.', error: true }])
      } else {
        const result = data.result as DesignResult
        // Execute any site action BEFORE updating chat
        if (result?.action) {
          executeAction(result.action)
        }
        setChatLog(prev => [...prev.slice(0, -1), { role: 'ai', result }])
        window.dispatchEvent(new CustomEvent('ai-design-update', { detail: { result } }))
      }
    } catch {
      setChatLog(prev => [...prev.slice(0, -1), { role: 'ai', text: 'Network error.', error: true }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, chatLog, snapshot, toPromptString, executeAction])

  const isLeft = side === 'left'
  const borderEdge = isLeft ? 'borderRight' : 'borderLeft'

  return (
    <>
      <style>{`
        @keyframes panelslide-right{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes panelslide-left{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes msgin{from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        .jmsg{animation:msgin 0.2s ease}
        .jchip:hover{background:rgba(224,17,95,0.06)!important;border-color:rgba(224,17,95,0.3)!important;color:#E0115F!important}
      `}</style>

      {/* Warning toasts */}
      {warnings.slice(0, 1).map(w => (
        <div key={w.id} style={{
          position: 'fixed', bottom: 96, [isLeft ? 'left' : 'right']: 28, zIndex: 9997,
          background: w.severity === 'error' ? '#FF3B30' : '#FF9F0A',
          color: '#fff', padding: '10px 14px', borderRadius: 12, maxWidth: 280,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', display: 'flex', gap: 8, alignItems: 'flex-start',
          fontSize: 12, lineHeight: 1.5, animation: 'msgin 0.3s ease',
        }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>{w.severity === 'error' ? '⛔' : '⚠️'}</span>
          <div><div style={{ fontWeight: 700, marginBottom: 2 }}>Design Warning</div><div style={{ opacity: 0.92 }}>{w.message}</div></div>
          <button onClick={() => setWarnings(p => p.filter(x => x.id !== w.id))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14, padding: 0, marginLeft: 2 }}>✕</button>
        </div>
      ))}

      {/* FAB */}
      {!isOpen && <OrbButton onClick={() => setIsOpen(true)} warnings={warnings} side={side} />}

      {/* Side Panel — non-blocking (no backdrop) so user can interact with site */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, bottom: 0, [side]: 0,
          width: panelWidth,
          background: '#ffffff',
          [borderEdge]: '1px solid rgba(0,0,0,0.1)',
          zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          boxShadow: isLeft ? '4px 0 40px rgba(0,0,0,0.12)' : '-4px 0 40px rgba(0,0,0,0.12)',
          animation: `panelslide-${side} 0.28s cubic-bezier(0.32,0.72,0,1)`,
        }}>

          {/* Drag-to-resize handle on the inner edge */}
          <div
            onPointerDown={e => {
              e.preventDefault()
              setIsResizing(true)
              resizeRef.current = { startX: e.clientX, startW: panelWidth }
              e.currentTarget.setPointerCapture(e.pointerId)
            }}
            style={{
              position: 'absolute', top: 0, bottom: 0,
              [isLeft ? 'right' : 'left']: 0,
              width: 6, cursor: 'ew-resize', zIndex: 10,
              background: isResizing ? 'rgba(224,17,95,0.15)' : 'transparent',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,17,95,0.1)'}
            onMouseLeave={e => { if (!isResizing) e.currentTarget.style.background = 'transparent' }}
          />

          {/* ── Header ── */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {/* Logo */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src="/logo.png" alt="AI" style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover', border: '1.5px solid rgba(224,17,95,0.25)', boxShadow: '0 0 12px rgba(224,17,95,0.15)' }} />
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: '#34C759', border: '2px solid #fff', animation: 'blink 3s ease infinite' }} />
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1D1D1F', letterSpacing: '-0.02em' }}>FabricaAI</div>
                <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.35)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>AI Design Assistant · Groq</div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {/* Side toggle */}
                <button onClick={() => setSide(s => s === 'right' ? 'left' : 'right')}
                  title={`Move to ${side === 'right' ? 'left' : 'right'} side`}
                  style={{ width: 28, height: 26, borderRadius: 7, border: '1px solid rgba(0,0,0,0.1)', background: '#f5f5f7', color: '#555', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,17,95,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f5f5f7'}
                >{isLeft ? '→' : '←'}</button>

                {/* Width presets */}
                {[['S', 300], ['M', 400], ['L', 560]].map(([l, w]) => (
                  <button key={l as string} onClick={() => setPanelWidth(w as number)}
                    style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${panelWidth === w ? '#E0115F' : 'rgba(0,0,0,0.1)'}`, background: panelWidth === w ? 'rgba(224,17,95,0.08)' : '#f5f5f7', color: panelWidth === w ? '#E0115F' : '#666', cursor: 'pointer', fontSize: 9, fontWeight: 800 }}
                  >{l}</button>
                ))}

                {/* Warnings badge */}
                {warnings.length > 0 && (
                  <div style={{ fontSize: 9, fontWeight: 700, background: 'rgba(255,59,48,0.1)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.25)', borderRadius: 6, padding: '2px 7px' }}>{warnings.length} ⚠</div>
                )}

                {/* Close */}
                <button onClick={() => setIsOpen(false)} style={{ width: 28, height: 26, borderRadius: 7, border: '1px solid rgba(0,0,0,0.1)', background: '#f5f5f7', color: '#555', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>

            {/* Context bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 8, padding: '5px 10px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E0115F', animation: 'blink 2s ease infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live in</span>
              <span style={{ fontSize: 10, color: '#1D1D1F', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{snapshot.activeSection}</span>
              <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>⌘J · ⌘L</span>
            </div>
          </div>

          {/* ── Chat log ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 12, background: '#fafafa' }}>
            {chatLog.map((msg, i) => (
              <div key={i} className="jmsg" style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,#E0115F,#BA0C5D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <img src="/logo.png" alt="" style={{ width: 14, height: 14, borderRadius: 3, objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '86%',
                  padding: msg.result ? '11px 13px' : '8px 12px',
                  fontSize: 13, lineHeight: 1.65,
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#E0115F,#BA0C5D)' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1D1D1F',
                  borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                  boxShadow: msg.role === 'ai' ? '0 1px 4px rgba(0,0,0,0.06)' : '0 2px 8px rgba(224,17,95,0.2)',
                  border: msg.role === 'ai' ? '1px solid rgba(0,0,0,0.07)' : 'none',
                  borderLeft: msg.error ? '3px solid #FF3B30' : undefined,
                  whiteSpace: msg.result ? undefined : 'pre-wrap',
                }}>
                  {msg.loading && <TypingDots />}
                  {msg.result?.action && <ActionCard a={msg.result.action} answer={msg.result.answer} />}
                  {msg.result?.bridge && <WeaveCard b={msg.result.bridge} />}
                  {msg.result?.report && !msg.result.action && <ReportCard r={msg.result.report} />}
                  {msg.result && !msg.result.report && !msg.result.action && !msg.result.bridge && <DesignCard r={msg.result} />}
                  {msg.text && !msg.loading && <span>{msg.text}</span>}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} style={{ height: 8 }} />
          </div>

          {/* Active warnings */}
          {warnings.length > 0 && (
            <div style={{ padding: '8px 12px 0', flexShrink: 0, background: '#fafafa' }}>
              {warnings.map(w => (
                <div key={w.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: w.severity === 'error' ? 'rgba(255,59,48,0.06)' : 'rgba(255,159,10,0.06)', border: `1px solid ${w.severity === 'error' ? 'rgba(255,59,48,0.2)' : 'rgba(255,159,10,0.2)'}`, borderRadius: 9, padding: '7px 10px', marginBottom: 5 }}>
                  <span style={{ fontSize: 12 }}>{w.severity === 'error' ? '⛔' : '⚠️'}</span>
                  <span style={{ fontSize: 11, color: '#444', lineHeight: 1.5, flex: 1 }}>{w.message}</span>
                  <button onClick={() => setWarnings(p => p.filter(x => x.id !== w.id))} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.3)', cursor: 'pointer', fontSize: 12, padding: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Quick chips */}
          <div style={{ padding: '8px 12px 4px', display: 'flex', gap: 5, flexWrap: 'wrap', flexShrink: 0, background: '#fafafa' }}>
            {['Evaluate my design', 'Suggest colors', 'Check loom settings', 'Best weave for this?'].map(q => (
              <button key={q} className="jchip" onClick={() => { setInput(q); inputRef.current?.focus() }}
                style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: 'rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              >{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '8px 12px 16px', flexShrink: 0, background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '7px 8px 7px 14px', transition: 'border-color 0.2s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(224,17,95,0.5)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
            >
              <input ref={inputRef} value={input} disabled={isLoading}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Ask FabricaAI anything…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#1D1D1F', caretColor: '#E0115F', fontFamily: 'inherit' }}
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading}
                style={{ width: 34, height: 34, borderRadius: 9, border: 'none', flexShrink: 0, background: input.trim() && !isLoading ? 'linear-gradient(135deg,#E0115F,#BA0C5D)' : 'rgba(0,0,0,0.07)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: input.trim() && !isLoading ? '0 3px 10px rgba(224,17,95,0.35)' : 'none', transition: 'all 0.2s' }}
              >{isLoading ? <TypingDots /> : '↑'}</button>
            </div>
            <div style={{ marginTop: 5, fontSize: 9, color: 'rgba(0,0,0,0.25)', textAlign: 'center', fontWeight: 600, letterSpacing: '0.04em' }}>
              FABRICAI · ENTER TO SEND · PANEL STAYS OPEN WHILE YOU WORK
            </div>
          </div>
        </div>
      )}
    </>
  )
}

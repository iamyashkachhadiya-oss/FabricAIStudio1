'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDesignStore } from '@/lib/store/designStore'
import { textToMatrix } from '@/lib/pegplan/parser'
import IdentityForm from '@/components/design/IdentityForm'
import WarpSystemForm from '@/components/design/WarpSystemForm'
import WeftForm from '@/components/design/WeftForm'
import LoomForm from '@/components/design/LoomForm'
import CalcPanel from '@/components/design/CalcPanel'
import PegPlanEditor from '@/components/design/PegPlanEditor'
import SimulationPreview from '@/components/outputs/SimulationExport'
import BorderForm from '@/components/design/BorderForm'
import MachineExportPanel from '@/components/outputs/MachineExport'
import SimulationAssistantUI from '@/components/analysis/SimulationAssistant'
import DraftAnalysisTool from '@/components/analysis/DraftAnalysisTool'

type DemoTab = 'Identity' | 'Warp' | 'Weft' | 'Loom' | 'Border' | 'AI Analysis' | 'Export'

const NAV_TABS: { id: DemoTab; label: string; icon: string }[] = [
  { id: 'Identity', label: 'Identity', icon: '🪡' },
  { id: 'Warp',     label: 'Warp',     icon: '↕' },
  { id: 'Weft',     label: 'Weft',     icon: '↔' },
  { id: 'Loom',     label: 'Loom',     icon: '⚙' },
  { id: 'Border',   label: 'Border',   icon: '◻' },
]

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>('Weft')
  const [initialized, setInitialized] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const store = useDesignStore()

  useEffect(() => {
    if (initialized) return
    const { updateIdentity, setPegPlan, recalculate } = useDesignStore.getState()
    updateIdentity({ design_name: 'Pattu Dobby Saree', design_number: 'SD-2025-001' })
    const defaultPegText = `1-->1,3,5,7,9,11,13,15\n2-->2,4,6,8,10,12,14,16\n3-->1,3,5,7,9,11,13,15\n4-->2,4,6,8,10,12,14,16\n5-->1,2,5,6,9,10,13,14\n6-->3,4,7,8,11,12,15,16\n7-->1,2,5,6,9,10,13,14\n8-->3,4,7,8,11,12,15,16`
    const defaultMatrix = textToMatrix(defaultPegText, 16)
    setPegPlan(defaultPegText, defaultMatrix)
    recalculate()
    setInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePegPlanChange = useCallback((text: string, matrix: number[][]) => {
    store.setPegPlan(text, matrix); store.recalculate()
  }, [store])

  const shaftCount = store.shaftCount

  const SHAFT_OPTIONS = [4, 8, 12, 16, 24]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ═══ HEADER — Apple-style glass bar ═══ */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 52,
        background: 'rgba(255,255,255,0.80)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0,
        zIndex: 100,
      }}>
        {/* Left — Logo + Project */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(0,0,0,0.05)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-2)', fontSize: 16,
            }}
          >
            ☰
          </button>

          {/* Logo mark */}
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(145deg, #1D1D1F 0%, #3a3a3c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#007AFF', fontSize: 15, fontWeight: 700, lineHeight: 1 }}>ƒ</span>
          </div>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{
                fontSize: 15, fontWeight: 700,
                color: 'var(--text-1)', letterSpacing: '-0.03em',
              }}>FabricAI</span>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: 'var(--text-3)', letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>Studio</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: -1, letterSpacing: '-0.01em' }}>
              {store.identity.design_name || 'Untitled'} · {store.identity.design_number || 'No ID'}
            </div>
          </div>
        </div>

        {/* Right — Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            padding: '3px 9px',
            fontSize: 10, fontWeight: 600,
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            borderRadius: 99,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Demo
          </span>
          <button
            onClick={() => import('@/components/outputs/PDFExport').then(m => m.downloadPDF())}
            style={{
              height: 32, padding: '0 14px',
              background: 'var(--accent)',
              color: '#fff', border: 'none',
              borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
              letterSpacing: '-0.01em',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(0,122,255,0.30)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export PDF
          </button>
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex flex-col lg:flex-row" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ═══ LEFT SIDEBAR ═══ */}
        <div className={`
          absolute lg:relative z-50 h-full
          w-[288px] lg:w-[272px]
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `} style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border-light)',
          flexShrink: 0,
        }}>

          {/* Sidebar Tab Bar */}
          <div style={{
            display: 'flex',
            padding: '8px 10px',
            gap: 2,
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--surface)',
            flexShrink: 0,
            overflowX: 'auto',
          }}>
            {NAV_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false) }}
                style={{
                  flex: 1,
                  padding: '6px 6px',
                  fontSize: 12,
                  fontWeight: activeTab === id ? 600 : 500,
                  color: activeTab === id ? 'var(--accent)' : 'var(--text-3)',
                  background: activeTab === id ? 'var(--accent-light)' : 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                  minWidth: 0,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sidebar Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px' }}>
            {activeTab === 'Identity'    && <IdentityForm />}
            {activeTab === 'Warp'        && <WarpSystemForm />}
            {activeTab === 'Weft'        && <WeftForm />}
            {activeTab === 'Loom'        && <LoomForm />}
            {activeTab === 'Border'      && <BorderForm />}
            {activeTab === 'AI Analysis' && <SimulationAssistantUI />}
            {activeTab === 'Export'      && <MachineExportPanel />}
          </div>
        </div>

        {/* ═══ CENTER WORKSPACE ═══ */}
        <div className="flex-1 min-w-0" style={{ overflowY: 'auto', overflowX: 'hidden', padding: '20px 18px' }}>
          <div className="flex flex-col gap-4 w-full min-h-full">

            {/* ── 1. PEG PLAN EDITOR ── */}
            <div className="card">
              <div style={{ marginBottom: 14 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>
                    Peg Plan — Bidirectional Editor
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: 'var(--green)',
                    background: 'rgba(52,199,89,0.10)',
                    padding: '2px 7px', borderRadius: 99,
                    letterSpacing: '0.02em',
                  }}>LIVE</span>
                </div>

                {/* Shaft selector row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '-0.01em' }}>
                    Shafts
                  </span>
                  {/* Preset buttons */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: 9, padding: 3, gap: 2,
                  }}>
                    {SHAFT_OPTIONS.map(n => {
                      const active = shaftCount === n
                      return (
                        <button
                          key={n}
                          onClick={() => store.setShaftCount(n)}
                          style={{
                            minWidth: 34, height: 26,
                            padding: '0 8px',
                            fontSize: 12, fontWeight: active ? 700 : 500,
                            color: active ? '#fff' : 'var(--text-3)',
                            background: active ? 'var(--accent)' : 'transparent',
                            border: 'none', borderRadius: 7,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: active ? '0 1px 6px rgba(0,122,255,0.30)' : 'none',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                  {/* Custom input */}
                  <input
                    type="number"
                    min={2} max={32} step={2}
                    value={shaftCount}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v) && v >= 2 && v <= 32) store.setShaftCount(v)
                    }}
                    style={{
                      width: 52, height: 26,
                      fontSize: 12, fontWeight: 600,
                      textAlign: 'center',
                      padding: '0 4px', borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text-1)',
                    }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-4)', letterSpacing: '-0.005em' }}>
                    Click cells to toggle · Text syncs automatically
                  </span>
                </div>
              </div>
              <PegPlanEditor shaftCount={shaftCount} onChange={handlePegPlanChange} initialText={store.pegPlanText} />
            </div>

            {/* ── 2. DRAFT ANALYSIS ── */}
            <div className="card">
              <DraftAnalysisTool />
            </div>

            {/* ── 3. FABRIC SIMULATION ── */}
            <div className="card">
              <div style={{ marginBottom: 18 }}>
                <h3 style={{
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--text-1)', letterSpacing: '-0.01em',
                }}>Fabric Simulation</h3>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                  Real-time weave structure preview
                </div>
              </div>
              <SimulationPreview
                matrix={store.weaveMatrix.length > 0 ? store.weaveMatrix : store.pegPlanMatrix}
                warpColor={store.warp?.colour_hex || '#1D1D1F'}
                weftColor={store.weftSystem.yarns[0]?.colour_hex || '#007AFF'}
                designName={store.identity.design_name || 'Design'}
              />
            </div>

            {/* ── 4. STATUS FOOTER ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              flexShrink: 0,
            }} className="sm:grid-cols-3 lg:grid-cols-5">
              {[
                {
                  label: 'Warp',
                  value: `${store.warp?.count_value || 75}${store.warp?.count_system === 'denier' ? 'D' : 'Ne'}`,
                  sub: store.warp?.material === 'polyester' ? 'Polyester'
                    : store.warp?.material === 'cotton' ? 'Cotton'
                    : store.warp?.material || 'Polyester',
                },
                {
                  label: 'Main Weft',
                  value: `${store.weftSystem.yarns[0]?.count_value || '--'}${store.weftSystem.yarns[0]?.count_system === 'ne' ? 'Ne' : 'D'}`,
                  sub: store.weftSystem.yarns[0]?.material || '--',
                },
                {
                  label: 'Extra Yarns',
                  value: `${Math.max(store.weftSystem.yarns.length - 1, 0)}`,
                  sub: 'yarns',
                },
                {
                  label: 'Machine',
                  value: store.loom?.machine_type === 'rapier' ? 'Rapier'
                    : store.loom?.machine_type === 'air_jet' ? 'Air Jet'
                    : store.loom?.machine_type === 'water_jet' ? 'Water Jet' : 'Rapier',
                  sub: `${store.loom?.machine_rpm || 500} RPM`,
                },
                { label: 'Mode', value: 'Advanced', sub: 'system' },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 12,
                  padding: '11px 14px',
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, textTransform: 'capitalize' }}>
                    {sub}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile CalcPanel */}
            <div className="lg:hidden w-full rounded-2xl overflow-hidden mt-1" style={{
              border: '1px solid var(--border-light)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}>
              <CalcPanel />
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SIDEBAR — Live Calculations ═══ */}
        <div className="hidden lg:block lg:shrink-0" style={{
          width: 260,
          borderLeft: '1px solid var(--border-light)',
          background: 'var(--surface)',
          overflowY: 'auto',
        }}>
          <CalcPanel />
        </div>
      </div>
    </div>
  )
}

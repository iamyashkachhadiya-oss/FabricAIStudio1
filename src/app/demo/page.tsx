'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDesignStore } from '@/lib/store/designStore'
import IdentityForm from '@/components/design/IdentityForm'
import WarpSystemForm from '@/components/design/WarpSystemForm'
import WeftForm from '@/components/design/WeftForm'
import LoomForm from '@/components/design/LoomForm'
import CalcPanel from '@/components/design/CalcPanel'
import PegPlanEditor from '@/components/design/PegPlanEditor'
import WeaveCanvas from '@/components/design/WeaveCanvas'
import SimulationPreview from '@/components/outputs/SimulationExport'
import BorderForm from '@/components/design/BorderForm'
import MachineExportPanel from '@/components/outputs/MachineExport'
import CostingPanel from '@/components/design/CostingPanel'
import SimulationAssistantUI from '@/components/analysis/SimulationAssistant'

type DemoTab = 'Identity' | 'Warp' | 'Weft' | 'Loom' | 'Peg Plan' | 'Border' | 'Costing' | 'AI Analysis' | 'Export'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>('Weft')
  const [initialized, setInitialized] = useState(false)
  const store = useDesignStore()

  useEffect(() => {
    if (initialized) return
    const { updateIdentity, recalculate } = useDesignStore.getState()
    updateIdentity({ design_name: 'Pattu Dobby Saree', design_number: 'SD-2025-001' })
    recalculate()
    setInitialized(true)
  }, [])

  const handlePegPlanChange = useCallback((text: string, matrix: number[][]) => {
    store.setPegPlan(text, matrix); store.recalculate()
  }, [store])

  const handleWeaveToggle = useCallback((row: number, col: number) => {
    const matrix = store.pegPlanMatrix.map((r, ri) =>
      ri === row ? r.map((c, ci) => ci === col ? (c === 1 ? 0 : 1) : c) : [...r]
    )
    import('@/lib/pegplan/parser').then(({ matrixToText }) => {
      store.setPegPlan(matrixToText(matrix), matrix); store.recalculate()
    })
  }, [store])

  const tabs: DemoTab[] = ['Identity', 'Warp', 'Weft', 'Loom', 'Peg Plan', 'Border', 'Costing', 'AI Analysis', 'Export']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56, borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', flexShrink: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(145deg, #1B1F3B, #2A2F52)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>ƒ</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em' }}>FabricAI Studio</span>
        </div>
        <button onClick={() => import('@/components/outputs/PDFExport').then(m => m.downloadPDF())} className="btn-accent" style={{ fontSize: 12, height: 38, padding: '0 18px', borderRadius: 8 }}>Export PDF</button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 360, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
          <div className="tab-bar" style={{ padding: '0 8px', flexShrink: 0 }}>
            {tabs.map((tab) => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ padding: '12px 12px', fontSize: 12 }}>{tab}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {activeTab === 'Identity' && <IdentityForm />}
            {activeTab === 'Warp' && <WarpSystemForm />}
            {activeTab === 'Weft' && <WeftForm />}
            {activeTab === 'Loom' && <LoomForm />}
            {activeTab === 'Peg Plan' && <div className="card"><div className="section-header">Peg Plan Editor</div><PegPlanEditor shaftCount={16} onChange={handlePegPlanChange} initialText={store.pegPlanText} /></div>}
            {activeTab === 'Border' && <BorderForm />}
            {activeTab === 'Costing' && <CostingPanel />}
            {activeTab === 'AI Analysis' && <SimulationAssistantUI />}
            {activeTab === 'Export' && <MachineExportPanel />}
          </div>
        </div>

        {/* Center Workspace */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main Simulation Card */}
          <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-1)' }}>FABRIC SIMULATION</h3>
                <div style={{ height: 1.5, width: 40, background: 'var(--primary)', marginTop: 8 }} />
            </div>
            
            <SimulationPreview 
                matrix={store.pegPlanMatrix} 
                warpColor={store.warp?.colour_hex || '#1B1F3B'} 
                weftColor={store.weftSystem.yarns[0]?.colour_hex || '#E8A838'} 
                designName="Design" 
            />

            {/* Premium Action Row (Match Screenshot) */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button 
                  style={{ height: 44, padding: '0 24px', background: '#2D3436', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download Fabric Image
                </button>
                <button 
                  style={{ height: 44, padding: '0 24px', background: 'white', color: '#128C7E', border: '1.5px solid #128C7E', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Copy for WhatsApp
                </button>
            </div>
          </div>

          <div className="card">
            <div className="section-header">STRUCTURE GRID</div>
            <WeaveCanvas matrix={store.pegPlanMatrix} shaftCount={16} onToggle={handleWeaveToggle} repeatW={16} repeatH={8} />
          </div>

          {/* Global Engineering Status Footer (Match Screenshot) */}
          <div style={{ 
              marginTop: 'auto', background: '#F8F9FA', border: '1.5px solid #EEE', borderRadius: 12, padding: '16px 24px',
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, flexShrink: 0
          }}>
              <div><div style={{ fontSize: 9, fontWeight: 800, color: '#AAA' }}>WARP</div><div style={{ fontSize: 12, fontWeight: 700 }}>{store.warp?.count_value}{store.warp?.count_system === 'denier' ? 'D' : 'Ne'} {store.warp?.material}</div></div>
              <div><div style={{ fontSize: 9, fontWeight: 800, color: '#AAA' }}>MAIN WEFT</div><div style={{ fontSize: 12, fontWeight: 700 }}>{store.weftSystem.yarns[0]?.count_value || '--'}Ne {store.weftSystem.yarns[0]?.material || '--'}</div></div>
              <div><div style={{ fontSize: 9, fontWeight: 800, color: '#AAA' }}>EXTRA YARNS</div><div style={{ fontSize: 12, fontWeight: 700 }}>{store.weftSystem.yarns.length - 1} Yarns</div></div>
              <div><div style={{ fontSize: 9, fontWeight: 800, color: '#AAA' }}>MACHINE</div><div style={{ fontSize: 12, fontWeight: 700 }}>Rapier - 500 RPM</div></div>
              <div><div style={{ fontSize: 9, fontWeight: 800, color: '#AAA' }}>SYSTEM MODE</div><div style={{ fontSize: 12, fontWeight: 700 }}>Advanced</div></div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ borderLeft: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
          <CalcPanel />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useDesignStore } from '@/lib/store/designStore'
import type { WeftYarn, Material, CountSystem } from '@/lib/types'
import { MATERIAL_PHYSICS, CATEGORY_COLORS } from '@/lib/calc/materials'
import ColorPickerPopup from '../common/ColorPickerPopup'

const NOZZLE_COLOUR_MAP = ['#C8D5A1', '#8AB58D', '#5A94BD', '#A6B1C9', '#E8A838', '#D63031', '#6C5CE7', '#00B894']

function NozzleIcon({ color, number, active }: { color: string, number: number, active: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="24" height="32" viewBox="0 0 24 32" style={{ transition: 'all 0.3s ease', filter: active ? 'none' : 'grayscale(1) opacity(0.3)' }}>
        <path d="M4 2 L20 2 L18 18 L12 28 L6 18 Z" fill={color} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <circle cx="12" cy="10" r="4" fill="rgba(255,255,255,0.4)" />
      </svg>
      <span style={{ fontSize: 9, fontWeight: 800, color: active ? 'var(--text-1)' : 'var(--text-3)' }}>{number}</span>
    </div>
  )
}

function PropertiesDetails({ yarn, onClose }: { yarn: WeftYarn, onClose: () => void }) {
  const { updateWeftYarn, recalculate } = useDesignStore()
  const handleUpdate = (updates: any) => {
    updateWeftYarn(yarn.id, { properties: { ...yarn.properties, ...updates } })
    recalculate()
  }

  return (
    <div className="card shadow-lg" style={{
      position: 'absolute', right: -280, top: 0, width: 260, zIndex: 100,
      background: 'white', padding: 16, border: '1.5px solid var(--border)',
      boxShadow: '0 12px 48px rgba(0,0,0,0.12)', borderRadius: 12
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties Details</div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#666' }}>&times;</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>Shrinkage Min%</label>
            <input type="number" value={yarn.properties.shrinkage_min_pct} onChange={(e) => handleUpdate({ shrinkage_min_pct: parseFloat(e.target.value) || 0 })} style={{ height: 32, borderRadius: 6 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>Shrinkage Max%</label>
            <input type="number" value={yarn.properties.shrinkage_max_pct} onChange={(e) => handleUpdate({ shrinkage_max_pct: parseFloat(e.target.value) || 0 })} style={{ height: 32, borderRadius: 6 }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600 }}>Tensile Strength (cN)</label>
          <input type="number" value={yarn.properties.tensile_strength_cn} onChange={(e) => handleUpdate({ tensile_strength_cn: parseInt(e.target.value) || 0 })} style={{ height: 32, borderRadius: 6 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600 }}>Elasticity%</label>
          <input type="number" value={yarn.properties.elasticity_pct} onChange={(e) => handleUpdate({ elasticity_pct: parseInt(e.target.value) || 0 })} style={{ height: 32, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  )
}

function YarnCard({ yarn, onRemove }: { yarn: WeftYarn, onRemove: () => void }) {
  const { updateWeftYarn, recalculate } = useDesignStore()
  const [showPicker, setShowPicker] = useState(false)
  const [showProps, setShowProps] = useState(false)
  
  const mat = MATERIAL_PHYSICS[yarn.material]
  const catColor = mat ? CATEGORY_COLORS[mat.category] : null
  const handleUpdate = (updates: any) => {
    updateWeftYarn(yarn.id, updates)
    recalculate()
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="card" style={{ 
        padding: 12, marginBottom: 16, background: 'linear-gradient(135deg, #F8F9FA, #FFFFFF)',
        border: '1.5px solid var(--border-light)', borderRadius: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div 
              onClick={() => setShowPicker(true)}
              style={{ width: 44, height: 44, borderRadius: 8, background: yarn.colour_hex, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-1)' }}>{yarn.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{yarn.count_value}Ne {yarn.material}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setShowProps(!showProps)} className="btn-secondary" style={{ width: 28, height: 28, padding: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20v-8m0-4h.01M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/></svg></button>
            <button onClick={onRemove} className="btn-secondary" style={{ width: 28, height: 28, padding: 0, color: '#D44B4B' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, display: 'block' }}>Material</label>
          <select 
            value={yarn.material} 
            onChange={(e) => handleUpdate({ material: e.target.value as Material })}
            style={{ height: 34, borderRadius: 8, border: '1.5px solid var(--border)', width: '100%', fontSize: 12 }}
          >
            {Object.entries(MATERIAL_PHYSICS).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          {NOZZLE_COLOUR_MAP.map(c => (
            <div 
              key={c} 
              onClick={() => handleUpdate({ colour_hex: c })}
              style={{ width: 14, height: 14, borderRadius: '50%', background: c, cursor: 'pointer', border: yarn.colour_hex === c ? '2px solid #2D3436' : '1px solid #EEE' }} 
            />
          ))}
        </div>

        {catColor && (
          <div style={{ marginTop: 12, padding: 10, background: catColor.bg + '15', borderRadius: 8, border: `1.5px solid ${catColor.bg}25` }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: catColor.text, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{mat.category}</div>
            <div style={{ fontSize: 10, color: catColor.text, fontWeight: 600, lineHeight: 1.4 }}>
                Shrink: {mat.shrink_base}% · Drape: {mat.drape_base} · Stiff: {mat.stiff_base} · Tenacity: {mat.tenacity_base}N/cm · {mat.note || 'General material properties'}
            </div>
          </div>
        )}

        {showPicker && <ColorPickerPopup isOpen={true} initialColor={yarn.colour_hex} title="Pick Yarn Color" onClose={() => setShowPicker(false)} onSave={(c) => { handleUpdate({ colour_hex: c }); setShowPicker(false) }} />}
        {showProps && <PropertiesDetails yarn={yarn} onClose={() => setShowProps(false)} />}
      </div>
    </div>
  )
}

export default function WeftYarnSystem() {
  const { weftSystem, addWeftYarn, removeWeftYarn, setTotalNozzles, updateInsertionSequence, recalculate } = useDesignStore()
  const activeNozzleSet = new Set(weftSystem.yarns.flatMap(y => y.nozzle_config.sequence))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.02em' }}>Weft Yarn Configuration</h2>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #EEE' }}>
        <div style={{ position: 'relative', width: 90, height: 60, background: '#F8F9FA', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="60" height="40" viewBox="0 0 60 40"><rect x="10" y="5" width="40" height="30" fill="none" stroke="#D1D1D1" strokeWidth="1.5" /><path d="M10 10 H50 M10 20 H50 M10 30 H50" stroke="#E1E1E1" strokeWidth="1" /><circle cx="5" cy="20" r="3" fill="#2D3436" /><path d="M5 20 H10" stroke="#2D3436" strokeWidth="2.5" /></svg>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: weftSystem.total_nozzles_available }).map((_, i) => (
            <NozzleIcon key={i} color={NOZZLE_COLOUR_MAP[i % NOZZLE_COLOUR_MAP.length]} number={i + 1} active={activeNozzleSet.has(i + 1)} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Machine Nozzles:</div>
        <select style={{ width: 64, height: 34, borderRadius: 8, fontWeight: 700, border: '1.5px solid var(--border)' }} value={weftSystem.total_nozzles_available} onChange={(e) => { setTotalNozzles(parseInt(e.target.value)); recalculate() }}>
          {[2, 4, 6, 8, 12, 16].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#AAA', textTransform: 'uppercase' }}>Weft Yarns</div>
          <button className="btn-accent" style={{ height: 32, padding: '0 12px', fontSize: 11 }} onClick={addWeftYarn}>+ Add New Yarn</button>
        </div>
        {weftSystem.yarns.map((yarn) => <YarnCard key={yarn.id} yarn={yarn} onRemove={() => { removeWeftYarn(yarn.id); recalculate() }} />)}
      </div>

      <div className="card" style={{ marginTop: 12, background: 'var(--bg-darker)', border: '1.5px dashed var(--border)', borderRadius: 12 }}>
        <div className="section-header" style={{ border: 'none', marginBottom: 14, fontSize: 10 }}>MASTER INSERTION PATTERN</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 48, background: 'white', padding: 10, borderRadius: 10, border: '1.5px solid var(--border)', marginBottom: 12 }}>
          {weftSystem.insertion_sequence.pattern.map((id, i) => {
            const yarn = weftSystem.yarns.find(y => y.id === id)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: yarn?.colour_hex || '#CCC', color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                <span>{yarn?.label || 'Yarn'}</span>
                <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 4 }} onClick={() => { updateInsertionSequence(weftSystem.insertion_sequence.pattern.filter((_, idx) => idx !== i)); recalculate(); }}>×</button>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {weftSystem.yarns.map(y => <button key={y.id} className="btn-secondary" style={{ fontSize: 11, height: 32 }} onClick={() => { updateInsertionSequence([...weftSystem.insertion_sequence.pattern, y.id]); recalculate() }}>Add {y.label}</button>)}
        </div>
      </div>
    </div>
  )
}

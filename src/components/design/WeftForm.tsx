'use client'

import { useState } from 'react'
import { useDesignStore } from '@/lib/store/designStore'
import type { WeftYarn, CountSystem, Luster } from '@/lib/types'
import ColorPickerPopup from '../common/ColorPickerPopup'

const NOZZLE_COLOUR_MAP = ['#1B1F3B', '#D4AF37', '#00B894', '#D63031', '#8E44AD', '#0984E3', '#E67E22', '#27AE60']

function WeftDiagram() {
  return (
    <div style={{ display: 'none' }}>
      {/* Hidden to match the exact mockup. Or kept if needed */}
    </div>
  )
}

function NozzleSelector({ number, color, active }: { number: number; color: string; active: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ 
        width: 36, height: 36, borderRadius: '50%', background: color, 
        boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        opacity: active ? 1 : 0.4, transition: 'all 0.2s', border: active ? 'none' : '1px solid #CCC'
      }} />
      <span style={{ fontSize: 9, fontWeight: 700, color: '#A0A0A5' }}>{number}</span>
    </div>
  )
}

function DarkInput({ label, value, onChange, type = "text", disabled = false }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        style={{ 
          height: 38, background: '#323232', border: '1px solid #444', borderRadius: 6, 
          color: '#FFF', fontSize: 13, fontWeight: 600, padding: '0 12px', outline: 'none',
          opacity: disabled ? 0.7 : 1
        }} 
      />
    </div>
  )
}

function StepperInput({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div style={{ display: 'flex', height: 38, borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E5E5' }}>
        <button onClick={() => onChange(value - 1)} style={{ width: 36, background: '#FFF', border: 'none', borderRight: '1px solid #E5E5E5', cursor: 'pointer', fontSize: 18, color: '#888' }}>−</button>
        <div style={{ flex: 1, background: '#323232', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
          {value}
        </div>
        <button onClick={() => onChange(value + 1)} style={{ width: 36, background: '#FFF', border: 'none', borderLeft: '1px solid #E5E5E5', cursor: 'pointer', fontSize: 18, color: '#888' }}>+</button>
      </div>
    </div>
  )
}

function SignalBits({ nozzles }: { nozzles: number[] }) {
  if (nozzles.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: 'span 2' }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signal Bits</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {nozzles.map(n => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: 12, fontSize: 10, fontWeight: 700, color: '#666' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8A838' }} />
            S{n}
          </div>
        ))}
      </div>
    </div>
  )
}

function LightYarnCard({ yarn, expanded, onToggle, onRemove }: any) {
  const { updateWeftYarn, recalculate } = useDesignStore()
  const [showPicker, setShowPicker] = useState(false)

  const handleUpdate = (updates: Partial<WeftYarn>) => {
    updateWeftYarn(yarn.id, updates)
    recalculate()
  }

  return (
    <div style={{ border: '1px solid #E5E5E5', borderRadius: 12, marginBottom: 12, overflow: 'hidden', background: '#FFF' }}>
      
      {/* Header */}
      <div onClick={onToggle} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: expanded ? '1px solid #FOF0F0' : 'none' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div 
            onClick={(e) => { e.stopPropagation(); setShowPicker(true) }}
            style={{ width: 36, height: 36, borderRadius: 8, background: yarn.colour_hex, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#333' }}>{yarn.label}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
              {yarn.material} • {yarn.count_value}{yarn.count_system === 'ne' ? 's' : 'D'}
              <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>A (Ground)</span>
                <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{yarn.luster}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ color: '#A0A0A5', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ background: '#FAF9F5', padding: 16 }}>
          
          {/* Color Match Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</label>
            <div style={{ display: 'flex', alignItems: 'center', height: 38, background: '#323232', border: '1px solid #444', borderRadius: 6, overflow: 'hidden' }}>
              <div 
                onClick={() => setShowPicker(true)}
                style={{ width: 38, height: '100%', background: yarn.colour_hex, cursor: 'pointer', borderRight: '1px solid #222' }} 
              />
              <input 
                type="text" 
                value={yarn.colour_hex} 
                onChange={(e) => handleUpdate({ colour_hex: e.target.value })}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#FFF', fontSize: 14, fontWeight: 600, padding: '0 12px', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fiber</label>
              <select 
                value={yarn.material} 
                onChange={(e) => handleUpdate({ material: e.target.value as any })}
                style={{ height: 38, background: '#323232', border: '1px solid #444', borderRadius: 6, color: '#FFF', fontSize: 13, fontWeight: 600, padding: '0 12px', outline: 'none' }}
              >
                <option value="cotton">Cotton</option><option value="polyester">Polyester</option><option value="viscose">Viscose</option><option value="zari">Zari</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Count Type</label>
              <select 
                value={yarn.count_system} 
                onChange={(e) => handleUpdate({ count_system: e.target.value as any })}
                style={{ height: 38, background: '#323232', border: '1px solid #444', borderRadius: 6, color: '#FFF', fontSize: 13, fontWeight: 600, padding: '0 12px', outline: 'none' }}
              >
                <option value="ne">Ne</option><option value="denier">Denier</option>
              </select>
            </div>

            <DarkInput label="Yarn Count" value={yarn.count_value + (yarn.count_system === 'ne' ? 's' : 'D')} onChange={(v: string) => handleUpdate({ count_value: parseFloat(v) || 0 })} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#8A8A8E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Luster</label>
              <select 
                value={yarn.luster} 
                onChange={(e) => handleUpdate({ luster: e.target.value as any })}
                style={{ height: 38, background: '#323232', border: '1px solid #444', borderRadius: 6, color: '#FFF', fontSize: 13, fontWeight: 600, padding: '0 12px', outline: 'none' }}
              >
                <option value="bright">Bright</option><option value="semi_dull">Semi-Dull</option><option value="dull">Matte</option>
              </select>
            </div>

            <DarkInput label="Fancy Yarn" value="None" disabled />
            <DarkInput label="Group" value={yarn.label} onChange={(v: string) => handleUpdate({ label: v })} />

            <StepperInput label="PPI" value={yarn.ppi || 80} onChange={(v: number) => handleUpdate({ ppi: v })} />
            <DarkInput label="Height H (MM)" value="0.3" disabled />
            <DarkInput label="Width W (MM)" value="0.4" disabled />
            
            <SignalBits nozzles={yarn.nozzle_config.sequence} />
          </div>
          
          <button 
            onClick={onRemove}
            style={{ 
              marginTop: 10, display: 'block', width: '100%', height: 36, background: '#FFF0F0', color: '#D32F2F', 
              border: '1px solid #FFCDD2', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' 
            }}
          >
            Remove Yarn
          </button>
        </div>
      )}

      {showPicker && <ColorPickerPopup isOpen={true} initialColor={yarn.colour_hex} title={`Color`}
        onClose={() => setShowPicker(false)} onSave={(c) => { handleUpdate({ colour_hex: c }); setShowPicker(false) }} />}
    </div>
  )
}

export default function WeftYarnSystem() {
  const { weftSystem, addWeftYarn, removeWeftYarn, setTotalNozzles, updateInsertionSequence, recalculate } = useDesignStore()
  const activeNozzleSet = new Set(weftSystem.yarns.flatMap(y => y.nozzle_config.sequence))

  const [expandedCard, setExpandedCard] = useState<string | null>(weftSystem.yarns[0]?.id || null)

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111', letterSpacing: '-0.02em', margin: 0 }}>Weft Configuration</h2>
        <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginTop: 4 }}>Pattu Dobby Saree - SD-2025-001</div>
      </div>

      {/* Mode Toggles */}
      <div style={{ display: 'flex', background: '#F5EFE6', borderRadius: 8, padding: 4, marginBottom: 24 }}>
        <button style={{ flex: 1, background: '#FFF', color: '#8C7A6B', border: '1px solid #FFF', borderRadius: 6, fontSize: 12, fontWeight: 700, height: 32, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>Simple</button>
        <button style={{ flex: 1, background: 'transparent', color: '#8C7A6B', border: 'none', fontSize: 12, fontWeight: 700, height: 32, cursor: 'pointer' }}>Advanced</button>
        <button style={{ flex: 1, background: 'transparent', color: '#8C7A6B', border: 'none', fontSize: 12, fontWeight: 700, height: 32, cursor: 'pointer' }}>Signals</button>
      </div>

      {/* Machine Nozzles */}
      <div style={{ borderTop: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA', padding: '16px 0', marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#A0A0A5', letterSpacing: '0.05em', marginBottom: 12 }}>MACHINE NOZZLES</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#444' }}>Total nozzles available</div>
          <select 
            value={weftSystem.total_nozzles_available}
            onChange={(e) => { setTotalNozzles(parseInt(e.target.value)); recalculate() }}
            style={{ width: 44, height: 28, background: '#F5F5F5', border: '1px solid #EAEAEA', borderRadius: 6, fontWeight: 800, fontSize: 13, color: '#333', textAlign: 'center', cursor: 'pointer' }}
          >
            <option value="4">4</option><option value="6">6</option><option value="8">8</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <NozzleSelector 
               key={i} 
               number={i + 1} 
               color={NOZZLE_COLOUR_MAP[i % NOZZLE_COLOUR_MAP.length]} 
               active={activeNozzleSet.has(i + 1) || i < weftSystem.total_nozzles_available} 
            />
          ))}
        </div>
      </div>

      {/* Weft Yarn Details */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#A0A0A5', letterSpacing: '0.05em', marginBottom: 16 }}>WEFT YARN DETAILS</div>
        
        <button 
          onClick={addWeftYarn}
          style={{ width: '100%', height: 44, background: '#FFF', border: '1px solid #E5E5E5', borderRadius: 12, color: '#C4C4C4', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          Add new yarn
        </button>

        {weftSystem.yarns.map((yarn) => (
          <LightYarnCard 
            key={yarn.id} 
            yarn={yarn} 
            expanded={expandedCard === yarn.id}
            onToggle={() => setExpandedCard(expandedCard === yarn.id ? null : yarn.id)}
            onRemove={() => { removeWeftYarn(yarn.id); recalculate() }} 
          />
        ))}
      </div>

      {/* Insertion Sequence */}
      <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#A0A0A5', letterSpacing: '0.05em', marginBottom: 12 }}>INSERTION SEQUENCE</div>
        <div style={{ background: '#F5EFE6', borderRadius: 8, padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 12 }}>
          {weftSystem.insertion_sequence.pattern.length > 0 ? `${weftSystem.insertion_sequence.pattern.length} Pick Repeat` : 'Empty Sequence'}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {weftSystem.insertion_sequence.pattern.map((id, i) => {
            const yarn = weftSystem.yarns.find(y => y.id === id)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#FFF', border: '1px solid #EAEAEA', borderRadius: 16, fontSize: 11, fontWeight: 700, color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: yarn?.colour_hex || '#CCC' }} />
                {(i + 1) + (yarn?.label.substring(0, 1) || 'A')}
                <div 
                   style={{ color: '#CCC', cursor: 'pointer', marginLeft: 4 }}
                   onClick={() => { updateInsertionSequence(weftSystem.insertion_sequence.pattern.filter((_, idx) => idx !== i)); recalculate() }}
                >×</div>
              </div>
            )
          })}
        </div>
        <button style={{ width: 80, height: 32, background: '#FFF', border: '1px solid #EAEAEA', borderRadius: 8, color: '#F0F0F0', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          + add
        </button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {weftSystem.yarns.map(y => (
            <button key={y.id} style={{ fontSize: 11, padding: '6px 12px', background: '#FFF', border: `1px solid ${y.colour_hex}`, borderRadius: 8, color: '#444', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { updateInsertionSequence([...weftSystem.insertion_sequence.pattern, y.id]); recalculate() }}>
              Add {y.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Calculations */}
      <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#A0A0A5', letterSpacing: '0.05em', marginBottom: 12 }}>LIVE CALCULATIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ background: '#FAF9F5', border: '1px solid #EFEAE0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#A0A0A5', marginBottom: 6 }}>WEFT WEIGHT</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#E8A838' }}>4705<span style={{ fontSize: 10, fontWeight: 600, color: '#A0A0A5', marginLeft: 2 }}>g/100m</span></div>
          </div>
          <div style={{ background: '#FAF9F5', border: '1px solid #EFEAE0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#A0A0A5', marginBottom: 6 }}>PPI</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#333' }}>80<span style={{ fontSize: 10, fontWeight: 600, color: '#A0A0A5', marginLeft: 2 }}>picks/in</span></div>
          </div>
          <div style={{ background: '#FAF9F5', border: '1px solid #EFEAE0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#A0A0A5', marginBottom: 6 }}>CRIMP %</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#333' }}>6.2<span style={{ fontSize: 10, fontWeight: 600, color: '#A0A0A5', marginLeft: 2 }}>%</span></div>
          </div>
          <div style={{ background: '#FAF9F5', border: '1px solid #EFEAE0', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#A0A0A5', marginBottom: 6 }}>WASTAGE</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#333' }}>3.0<span style={{ fontSize: 10, fontWeight: 600, color: '#A0A0A5', marginLeft: 2 }}>%</span></div>
          </div>
        </div>
        <div style={{ background: '#FAF9F5', border: '1px solid #EFEAE0', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#A0A0A5', marginBottom: 6 }}>WEIGHT FORMULA (NE)</div>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#666', lineHeight: 1.5 }}>
            Reed(in) × 453.59 × PPI × 100<br/>
            ÷ (840 × Ne) × Wastage × Crimp
          </div>
        </div>
      </div>

    </div>
  )
}

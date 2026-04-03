'use client'

import { useState } from 'react'
import { useDesignStore } from '@/lib/store/designStore'
import type { WarpYarn, CountSystem, Luster } from '@/lib/types'
import ColorPickerPopup from '../common/ColorPickerPopup'

function WarpDiagram() {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* We keep the original requested photo */}
      <img 
        src="/warp_machine.png" 
        alt="Warp Configuration Machine" 
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }} 
      />
    </div>
  )
}

function DarkInput({ label, value, onChange, type = "text", disabled = false }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#A0A0A5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        style={{ 
          height: 38, background: '#323232', border: '1px solid #444', borderRadius: 6, 
          color: '#FFF', fontSize: 14, fontWeight: 600, padding: '0 12px', outline: 'none',
          opacity: disabled ? 0.7 : 1
        }} 
      />
    </div>
  )
}

function LightStepperInput({ label, value, onChange }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#A0A0A5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div style={{ display: 'flex', height: 38, borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E5E5' }}>
        <button onClick={() => onChange(value - 1)} style={{ width: 36, background: '#FFF', border: 'none', borderRight: '1px solid #E5E5E5', cursor: 'pointer', fontSize: 18, color: '#E0E0E0' }}>−</button>
        <div style={{ flex: 1, background: '#323232', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
          {value}
        </div>
        <button onClick={() => onChange(value + 1)} style={{ width: 36, background: '#FFF', border: 'none', borderLeft: '1px solid #E5E5E5', cursor: 'pointer', fontSize: 18, color: '#E0E0E0' }}>+</button>
      </div>
    </div>
  )
}

function LightWarpYarnCard({ yarn, index, expanded, onToggle, onRemove }: any) {
  const { updateWarpYarn, recalculate } = useDesignStore()
  const [showPicker, setShowPicker] = useState(false)

  const handleUpdate = (updates: Partial<WarpYarn>) => {
    updateWarpYarn(yarn.id, updates)
    recalculate()
  }

  const seqPositions = [1, 3, 5, 7, 2, 4, 6, 8].map(n => n + yarn.sort_order * 2)

  return (
    <div style={{ border: '1px solid #EAEAEA', borderRadius: 12, marginBottom: 16, overflow: 'hidden', background: '#FFF' }}>
      
      {/* Header (Accordion Toggle) */}
      <div 
        onClick={onToggle}
        style={{ 
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          borderBottom: expanded ? '1px solid #EAEAEA' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div 
            onClick={(e) => { e.stopPropagation(); setShowPicker(true) }}
            style={{ 
              width: 32, height: 32, borderRadius: 8, background: yarn.colour_hex || '#1a1a2e', 
              border: '1px solid rgba(0,0,0,0.1)'
            }} 
          />
          <div style={{ fontSize: 15, fontWeight: 800, color: '#333' }}>
            Warp {index + 1}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '4px 10px', background: '#F5EFE6', borderRadius: 12, fontSize: 11, fontWeight: 800, color: '#8C7A6B' }}>
            {yarn.epi_share} EPI
          </div>
          {/* Exact little white box from mockup */}
          <div style={{ width: 32, height: 24, border: '1px solid #EAEAEA', borderRadius: 6, background: '#FFF' }} />
          
          <svg style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#A0A0A5' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: 20, background: '#FAF9F5' }}>
          
          {/* Color Row */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#A0A0A5', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', height: 44, border: '1px solid #444', borderRadius: 8, overflow: 'hidden', background: '#323232', paddingLeft: 8 }}>
              <div 
                onClick={() => setShowPicker(true)}
                style={{ width: 28, height: 28, borderRadius: 6, background: yarn.colour_hex, cursor: 'pointer', flexShrink: 0, border: '1px solid #111' }} 
              />
              <input 
                type="text"
                value={yarn.colour_hex}
                onChange={(e) => handleUpdate({ colour_hex: e.target.value })}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#FFF', fontSize: 16, padding: '0 12px', outline: 'none', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Material & Yarn Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#A0A0A5', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fiber Material
              </label>
              <select 
                value={yarn.material}
                onChange={(e) => handleUpdate({ material: e.target.value as any })}
                style={{ width: '100%', height: 44, background: '#323232', border: '1px solid #444', borderRadius: 8, color: '#FFF', fontSize: 15, padding: '0 12px', outline: 'none', appearance: 'none' }}
              >
                <option value="cotton">Cotton</option>
                <option value="polyester">Polyester</option>
                <option value="viscose">Viscose</option>
                <option value="silk">Silk</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#A0A0A5', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Yarn Count
              </label>
              <input 
                type="text"
                value={yarn.count_value + (yarn.count_system === 'ne' ? 's' : 'D')}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  handleUpdate({ count_value: val });
                }}
                style={{ width: '100%', height: 44, background: '#323232', border: '1px solid #444', borderRadius: 8, color: '#FFF', fontSize: 15, padding: '0 12px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Steppers: EPI & Filament Count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <LightStepperInput 
              label="Warp Count (EPI)" 
              value={yarn.epi_share} 
              onChange={(val: number) => handleUpdate({ epi_share: Math.max(0, val) })}
            />
            <LightStepperInput 
              label="Filament Count" 
              value={yarn.filament_count || 1} 
              onChange={(val: number) => handleUpdate({ filament_count: Math.max(1, val) })}
            />
          </div>

          {/* Drawing-In Sequence */}
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#A0A0A5', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Drawing-In Sequence
            </label>
            <input 
              type="text"
              defaultValue={seqPositions.join(', ')}
              style={{ width: '100%', height: 44, background: '#323232', border: '1px solid #444', borderRadius: 8, color: '#FFF', fontSize: 15, padding: '0 12px', outline: 'none' }}
            />
          </div>

        </div>
      )}

      {showPicker && <ColorPickerPopup isOpen={true} initialColor={yarn.colour_hex} title={`Color — ${yarn.label}`}
        onClose={() => setShowPicker(false)} onSave={(c) => { handleUpdate({ colour_hex: c }); setShowPicker(false) }} />}
    </div>
  )
}

export default function WarpSystemForm() {
  const { warpSystem, addWarpYarn } = useDesignStore()

  const [expandedCard, setExpandedCard] = useState<string | null>(warpSystem.yarns[0]?.id || null)

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Light Theme Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#A0A0A5', letterSpacing: '0.05em', marginBottom: 12 }}>
          WARP CONFIGURATION
        </div>
      </div>

      <WarpDiagram />

      <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: 20 }}>
        <button 
          onClick={addWarpYarn}
          style={{ 
            width: '100%', height: 48, background: '#FFF', border: '1px solid #F0F0F0', borderRadius: 12,
            color: '#F0F0F0', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 24, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Add warp type
        </button>

        {warpSystem.yarns.map((yarn, i) => (
          <LightWarpYarnCard 
            key={yarn.id} 
            yarn={yarn} 
            index={i} 
            expanded={expandedCard === yarn.id}
            onToggle={() => setExpandedCard(expandedCard === yarn.id ? null : yarn.id)}
          />
        ))}
      </div>
    </div>
  )
}

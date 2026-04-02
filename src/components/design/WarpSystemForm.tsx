'use client'

import { useState } from 'react'
import { useDesignStore } from '@/lib/store/designStore'
import type { WarpYarn, Material, CountSystem, Luster } from '@/lib/types'
import { MATERIAL_PHYSICS, CATEGORY_COLORS } from '@/lib/calc/materials'
import MaterialSelect from './MaterialSelect'
import ColorPickerPopup from '../common/ColorPickerPopup'

function WarpYarnItem({
  yarn,
  isExpanded,
  onUpdate,
  onRemove,
  onToggleExpand,
  onColorSelect,
}: {
  yarn: WarpYarn
  isExpanded: boolean
  onUpdate: (updates: Partial<WarpYarn>) => void
  onRemove: () => void
  onToggleExpand: () => void
  onColorSelect: () => void
}) {
  const mat = MATERIAL_PHYSICS[yarn.material]
  const catColor = mat ? CATEGORY_COLORS[mat.category] : null

  return (
    <div className="card" style={{ padding: 16, marginBottom: 12, border: '1.5px solid var(--border-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={onColorSelect}
            style={{ 
              width: 18, 
              height: 18, 
              borderRadius: '50%', 
              background: yarn.colour_hex, 
              border: '1.5px solid var(--border)', 
              cursor: 'pointer',
              padding: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }} 
          />
          <div style={{ fontWeight: 600, fontSize: 14 }}>{yarn.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {yarn.count_value}{yarn.count_system === 'denier' ? 'D' : 'Ne'} {mat?.name || yarn.material}
          </div>
          {catColor && (
            <span style={{
              fontSize: 9, padding: '1px 6px', borderRadius: 4,
              background: catColor.bg, color: catColor.text, fontWeight: 600,
            }}>
              {mat?.category}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" style={{ height: 28, padding: '0 8px' }} onClick={onToggleExpand}>
            {isExpanded ? 'Collapse' : 'Edit'}
          </button>
          <button className="btn-secondary" style={{ height: 28, padding: '0 8px', color: '#D44B4B' }} onClick={onRemove}>
            ×
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left: Basics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label>Yarn Label</label>
              <input type="text" value={yarn.label} onChange={(e) => onUpdate({ label: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Count Mode</label>
                <select value={yarn.count_system} onChange={(e) => onUpdate({ count_system: e.target.value as CountSystem })}>
                  <option value="denier">Denier</option>
                  <option value="ne">Ne</option>
                </select>
              </div>
              <div>
                <label>Value</label>
                <input type="number" value={yarn.count_value} onChange={(e) => onUpdate({ count_value: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            {yarn.count_system === 'denier' && (
              <div>
                <label>Filament Count</label>
                <input type="number" value={yarn.filament_count || ''} onChange={(e) => onUpdate({ filament_count: parseInt(e.target.value) || null })} placeholder="36" />
              </div>
            )}
            <div>
              <label>EPI Share (this yarn&apos;s contribution to total EPI)</label>
              <input type="number" value={yarn.epi_share} onChange={(e) => onUpdate({ epi_share: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label>Colour Code</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={onColorSelect}
                  style={{ 
                    width: 36, 
                    height: 36, 
                    background: yarn.colour_hex, 
                    border: '1.5px solid var(--border)', 
                    borderRadius: 6, 
                    cursor: 'pointer',
                    padding: 0,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                />
                <input type="text" value={yarn.colour_code} onChange={(e) => onUpdate({ colour_code: e.target.value })} placeholder="Pantone / Name" />
              </div>
            </div>
          </div>

          {/* Right: Material & Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 16, borderLeft: '1px solid var(--border-light)' }}>
            <div>
              <label>Material</label>
              <MaterialSelect
                value={yarn.material}
                onChange={(v) => onUpdate({ material: v })}
                showBadge={false}
              />
            </div>
            <div>
              <label>Luster</label>
              <select value={yarn.luster} onChange={(e) => onUpdate({ luster: e.target.value as Luster })}>
                <option value="bright">Bright</option>
                <option value="semi_dull">Semi-Dull</option>
                <option value="dope_dyed">Dope-Dyed</option>
                <option value="matt">Matt</option>
                <option value="trilobal">Trilobal</option>
              </select>
            </div>
            <div>
              <label>Price per Kg</label>
              <div style={{ position: 'relative' }}>
                <input type="number" value={yarn.price_per_kg} onChange={(e) => onUpdate({ price_per_kg: parseFloat(e.target.value) || 0 })} style={{ paddingLeft: 30 }} />
                <span style={{ position: 'absolute', left: 12, top: 12, fontSize: 13, color: 'var(--text-3)' }}>$</span>
              </div>
            </div>
            {/* Material Physics Preview */}
            {mat && (
              <div style={{
                background: 'var(--bg)', borderRadius: 8, padding: 10,
                fontSize: 10, color: 'var(--text-3)', lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Material Physics</div>
                Shrink: {mat.shrink_base}% · Drape: {mat.drape_base} · Stiff: {mat.stiff_base}<br />
                Tenacity: {mat.tenacity_base} N/cm · Moisture: {mat.moisture_regain_pct}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WarpSystemForm() {
  const { warpSystem, setWarpMode, addWarpYarn, updateWarpYarn, removeWarpYarn } = useDesignStore()
  const [expandedId, setExpandedId] = useState<string | null>(warpSystem.yarns[0]?.id || null)
  const [pickingColorId, setPickingColorId] = useState<string | null>(null)

  const activePickerYarn = warpSystem.yarns.find(y => y.id === pickingColorId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="section-header" style={{ marginBottom: 4 }}>Warp Yarn System</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
            Configure {warpSystem.mode === 'advanced' ? 'multiple warp yarns' : 'single warp yarn'} with material physics
          </div>
        </div>
        <div className="pill-group">
          <button className={`pill-btn ${warpSystem.mode === 'simple' ? 'active' : ''}`}
            onClick={() => setWarpMode('simple')}>Simple</button>
          <button className={`pill-btn ${warpSystem.mode === 'advanced' ? 'active' : ''}`}
            onClick={() => setWarpMode('advanced')}>Multi-Warp</button>
        </div>
      </div>

      {/* Yarn List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-header" style={{ marginBottom: 0, border: 'none' }}>Warp Yarns</div>
          {(warpSystem.mode === 'advanced' || warpSystem.yarns.length === 0) && (
            <button className="btn-accent" style={{ height: 32, fontSize: 12, padding: '0 12px' }} onClick={addWarpYarn}>
              + Add Warp Yarn
            </button>
          )}
        </div>

        {warpSystem.yarns.map((yarn) => (
          <WarpYarnItem
            key={yarn.id}
            yarn={yarn}
            isExpanded={expandedId === yarn.id}
            onToggleExpand={() => setExpandedId(expandedId === yarn.id ? null : yarn.id)}
            onRemove={() => removeWarpYarn(yarn.id)}
            onUpdate={(updates) => updateWarpYarn(yarn.id, updates)}
            onColorSelect={() => setPickingColorId(yarn.id)}
          />
        ))}

        <ColorPickerPopup
          isOpen={!!pickingColorId}
          initialColor={activePickerYarn?.colour_hex || '#FFFFFF'}
          title={`Color for ${activePickerYarn?.label || 'Warp Yarn'}`}
          onClose={() => setPickingColorId(null)}
          onSave={(color) => {
            if (pickingColorId) {
              updateWarpYarn(pickingColorId, { colour_hex: color })
            }
            setPickingColorId(null)
          }}
        />
      </div>

      {/* Engineering Note */}
      <div className="card" style={{ background: '#F0F7FF', border: '1px solid #CDE2FF' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ color: '#0066CC', paddingTop: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#004C99', fontSize: 13 }}>Multi-Warp Engineering</div>
            <div style={{ fontSize: 12, color: '#005BB7', lineHeight: 1.5, marginTop: 4 }}>
              In <strong>Multi-Warp</strong> mode, different warp yarns blend their material physics
              (shrinkage, drape, stiffness, tenacity) to compute the overall fabric simulation.
              Each yarn&apos;s <strong>EPI Share</strong> defines its contribution to the total ends per inch.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

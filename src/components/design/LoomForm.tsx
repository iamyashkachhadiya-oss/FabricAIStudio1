'use client'

import { useState } from 'react'
import { useDesignStore } from '@/lib/store/designStore'
import type { MachineType, DobbyType, ExportFormat, WeaveType } from '@/lib/types'
import { WEAVE_MODIFIERS } from '@/lib/calc/materials'

function ParamGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

export default function LoomForm() {
  const loom = useDesignStore((s) => s.loom)
  const updateLoom = useDesignStore((s) => s.updateLoom)
  const recalculate = useDesignStore((s) => s.recalculate)
  const [pneumaticOpen, setPneumaticOpen] = useState(false)

  if (!loom) return null

  const handleChange = (field: string, value: string | number) => {
    updateLoom({ [field]: value })
    recalculate()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1B1F3B', marginBottom: 4 }}>Machine System</h2>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 20 }}>Calibrate loom physics & output formats</p>

      <ParamGroup title="Hardware Specs">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label>Machine Type</label>
            <select value={loom.machine_type} onChange={(e) => handleChange('machine_type', e.target.value as MachineType)}>
              <option value="air_jet">Air Jet</option>
              <option value="rapier">Rapier</option>
              <option value="water_jet">Water Jet</option>
              <option value="power_loom">Power Loom</option>
            </select>
          </div>
          <div>
            <label>Dobby Type</label>
            <select value={loom.dobby_type} onChange={(e) => handleChange('dobby_type', e.target.value as DobbyType)}>
              <option value="mechanical">Mechanical</option>
              <option value="staubli">Stäubli</option>
              <option value="grosse">Grosse</option>
              <option value="picanol">Picanol</option>
            </select>
          </div>
        </div>

        {loom.dobby_type !== 'mechanical' && (
          <div>
            <label>Output Format</label>
            <select value={loom.export_format} onChange={(e) => handleChange('export_format', e.target.value as ExportFormat)}>
              <option value=".EP">.EP (Stäubli)</option>
              <option value=".JC5">.JC5 (Electronic)</option>
              <option value=".DES">.DES (Picanol)</option>
              <option value=".WEA">.WEA (Grosse)</option>
              <option value="text">Debug Text</option>
            </select>
          </div>
        )}
      </ParamGroup>

      <ParamGroup title="Geometric Limits">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label>Reed (Stockport)</label>
            <select value={loom.reed_count_stockport} onChange={(e) => handleChange('reed_count_stockport', parseInt(e.target.value))}>
              {[48, 56, 60, 72, 80].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label>Ends/Dent</label>
            <select value={loom.ends_per_dent} onChange={(e) => handleChange('ends_per_dent', parseInt(e.target.value))}>
              {[1, 2, 3, 4].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label>Cloth Width (inches)</label>
          <input type="number" value={loom.cloth_width_inches || ''} onChange={(e) => handleChange('cloth_width_inches', parseFloat(e.target.value) || 0)} />
        </div>
      </ParamGroup>

      <ParamGroup title="Operation & Tension">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label>Machine RPM</label>
            <input type="number" value={loom.machine_rpm || ''} onChange={(e) => handleChange('machine_rpm', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <label>Target PPI</label>
            <input type="number" value={loom.target_ppi || ''} onChange={(e) => handleChange('target_ppi', parseInt(e.target.value) || 0)} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ margin: 0 }}>Loom Tension (cN)</label>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{loom.loom_tension_cN || 180}</span>
          </div>
          <input type="range" min={40} max={400} step={5} value={loom.loom_tension_cN || 180}
            onChange={(e) => handleChange('loom_tension_cN', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', height: 6, margin: '8px 0' }} />
        </div>
      </ParamGroup>

      <div style={{ 
        padding: 16, background: '#f8f9fa', borderRadius: 10, border: '1px solid #eee',
        display: 'flex', flexDirection: 'column', gap: 12
      }}>
        <button 
          onClick={() => setPneumaticOpen(!pneumaticOpen)}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>Advanced Air Settings</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: pneumaticOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        
        {pneumaticOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'slideDown 0.2s' }}>
            {[
              { key: 'sv1_psi', label: 'SV1: Cloth Storage' },
              { key: 'sv2_psi', label: 'SV2: Beater' },
              { key: 'sv3_psi', label: 'SV3: Dobby' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: 10 }}>{label}</label>
                <input type="number" value={(loom as any)[key] || ''} onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)} style={{ height: 32, fontSize: 12 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

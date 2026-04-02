'use client'

import { useState } from 'react'
import type { BorderWeaveType } from '@/lib/types'

interface BorderState {
  border_present: boolean
  border_width_cm: number
  border_shaft_numbers: number[]
  border_weave_type: BorderWeaveType
  border_peg_plan_text: string
  border_weft_group: string
  leno_selvedge: boolean
  selvedge_bit_s9: boolean
  selvedge_bit_s10: boolean
}

export default function BorderForm() {
  const [border, setBorder] = useState<BorderState>({
    border_present: false,
    border_width_cm: 2.5,
    border_shaft_numbers: [9, 10, 15, 16],
    border_weave_type: 'plain',
    border_peg_plan_text: '',
    border_weft_group: 'B',
    leno_selvedge: false,
    selvedge_bit_s9: true,
    selvedge_bit_s10: true,
  })

  const update = (field: string, value: unknown) => {
    setBorder((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="section-header">Border & Selvedge Configuration</div>

      {/* Border Toggle */}
      <div>
        <label>Border Present</label>
        <div className="pill-group">
          <button className={`pill-btn ${border.border_present ? 'active' : ''}`}
            onClick={() => update('border_present', true)}>Yes</button>
          <button className={`pill-btn ${!border.border_present ? 'active' : ''}`}
            onClick={() => update('border_present', false)}>No</button>
        </div>
      </div>

      {border.border_present && (
        <>
          {/* Border Width */}
          <div>
            <label htmlFor="border-width">Border Width (cm)</label>
            <input id="border-width" type="number" step="0.5" min="0" max="10"
              value={border.border_width_cm}
              onChange={(e) => update('border_width_cm', parseFloat(e.target.value) || 0)} />
          </div>

          {/* Border Weave Type */}
          <div>
            <label htmlFor="border-weave-type">Border Weave Type</label>
            <select id="border-weave-type" value={border.border_weave_type}
              onChange={(e) => update('border_weave_type', e.target.value)}>
              <option value="plain">Plain Weave</option>
              <option value="hopsack">Hopsack (2/2 Matt)</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Border Shaft Numbers */}
          <div>
            <label htmlFor="border-shafts">Border Shafts (comma-separated)</label>
            <input id="border-shafts" type="text"
              value={border.border_shaft_numbers.join(', ')}
              onChange={(e) => {
                const shafts = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                update('border_shaft_numbers', shafts)
              }}
              placeholder="9, 10, 15, 16" />
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              Typically shafts 9, 10, 15, 16 for saree borders
            </div>
          </div>

          {/* Border Weft Group */}
          <div>
            <label htmlFor="border-weft-group">Border Weft Group</label>
            <div className="pill-group">
              <button className={`pill-btn ${border.border_weft_group === 'A' ? 'active' : ''}`}
                onClick={() => update('border_weft_group', 'A')}>Group A</button>
              <button className={`pill-btn ${border.border_weft_group === 'B' ? 'active' : ''}`}
                onClick={() => update('border_weft_group', 'B')}>Group B</button>
            </div>
          </div>

          {/* Custom Peg Plan (only for custom weave type) */}
          {border.border_weave_type === 'custom' && (
            <div>
              <label htmlFor="border-peg-plan">Border Peg Plan</label>
              <textarea id="border-peg-plan"
                value={border.border_peg_plan_text}
                onChange={(e) => update('border_peg_plan_text', e.target.value)}
                placeholder={`1-->9,10\n---\n2-->15,16`}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                  minHeight: 120, background: 'var(--bg-darker)',
                }} />
            </div>
          )}
        </>
      )}

      {/* Selvedge Options */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
        <div className="section-header">Selvedge</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label>Leno Selvedge</label>
            <div className="pill-group">
              <button className={`pill-btn ${border.leno_selvedge ? 'active' : ''}`}
                onClick={() => update('leno_selvedge', true)}>Enabled</button>
              <button className={`pill-btn ${!border.leno_selvedge ? 'active' : ''}`}
                onClick={() => update('leno_selvedge', false)}>Disabled</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>Selvedge Bit S9</label>
              <div className="pill-group">
                <button className={`pill-btn ${border.selvedge_bit_s9 ? 'active' : ''}`}
                  onClick={() => update('selvedge_bit_s9', true)}>On</button>
                <button className={`pill-btn ${!border.selvedge_bit_s9 ? 'active' : ''}`}
                  onClick={() => update('selvedge_bit_s9', false)}>Off</button>
              </div>
            </div>
            <div>
              <label>Selvedge Bit S10</label>
              <div className="pill-group">
                <button className={`pill-btn ${border.selvedge_bit_s10 ? 'active' : ''}`}
                  onClick={() => update('selvedge_bit_s10', true)}>On</button>
                <button className={`pill-btn ${!border.selvedge_bit_s10 ? 'active' : ''}`}
                  onClick={() => update('selvedge_bit_s10', false)}>Off</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

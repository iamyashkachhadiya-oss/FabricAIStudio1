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

function ToggleGroup({ value, options, onChange }: { value: string | boolean; options: { label: string; val: any }[]; onChange: (v: any) => void }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'rgba(0,0,0,0.05)',
      borderRadius: 9, padding: 3, gap: 2,
    }}>
      {options.map(opt => {
        const isActive = value === opt.val
        return (
          <button
            key={String(opt.val)}
            onClick={() => onChange(opt.val)}
            style={{
              padding: '5px 14px',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-1)' : 'var(--text-3)',
              background: isActive ? 'var(--surface)' : 'transparent',
              border: 'none', borderRadius: 7,
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600,
      color: 'var(--text-3)', textTransform: 'uppercase',
      letterSpacing: '0.07em', marginBottom: 12,
      paddingBottom: 8, borderBottom: '1px solid var(--border-light)',
    }}>{children}</div>
  )
}

function FormLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginBottom: 5, display: 'block' }}>
      {children}
    </label>
  )
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

  const update = (field: string, value: unknown) =>
    setBorder((prev) => ({ ...prev, [field]: value }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: 3 }}>
          Border & Selvedge
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
          Configure decorative border and edge finishing
        </p>
      </div>

      {/* Border Toggle */}
      <div style={{ marginBottom: 20 }}>
        <SectionTitle>Border</SectionTitle>
        <div style={{ marginBottom: 14 }}>
          <FormLabel>Border Present</FormLabel>
          <ToggleGroup
            value={border.border_present}
            options={[{ label: 'Yes', val: true }, { label: 'No', val: false }]}
            onChange={(v) => update('border_present', v)}
          />
        </div>

        {border.border_present && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <FormLabel htmlFor="border-width">Border Width (cm)</FormLabel>
              <input id="border-width" type="number" step="0.5" min="0" max="10"
                value={border.border_width_cm}
                onChange={(e) => update('border_width_cm', parseFloat(e.target.value) || 0)} />
            </div>

            <div>
              <FormLabel htmlFor="border-weave-type">Border Weave Type</FormLabel>
              <select id="border-weave-type" value={border.border_weave_type}
                onChange={(e) => update('border_weave_type', e.target.value)}>
                <option value="plain">Plain Weave</option>
                <option value="hopsack">Hopsack (2/2 Matt)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <FormLabel htmlFor="border-shafts">Border Shafts (comma-separated)</FormLabel>
              <input id="border-shafts" type="text"
                value={border.border_shaft_numbers.join(', ')}
                onChange={(e) => {
                  const shafts = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                  update('border_shaft_numbers', shafts)
                }}
                placeholder="9, 10, 15, 16" />
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
                Typically shafts 9, 10, 15, 16 for saree borders
              </div>
            </div>

            <div>
              <FormLabel>Border Weft Group</FormLabel>
              <ToggleGroup
                value={border.border_weft_group}
                options={[{ label: 'Group A', val: 'A' }, { label: 'Group B', val: 'B' }]}
                onChange={(v) => update('border_weft_group', v)}
              />
            </div>

            {border.border_weave_type === 'custom' && (
              <div>
                <FormLabel htmlFor="border-peg-plan">Border Peg Plan</FormLabel>
                <textarea id="border-peg-plan"
                  value={border.border_peg_plan_text}
                  onChange={(e) => update('border_peg_plan_text', e.target.value)}
                  placeholder={`1-->9,10\n---\n2-->15,16`}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    minHeight: 120, background: 'var(--bg)',
                  }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selvedge */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SectionTitle>Selvedge</SectionTitle>

        <div>
          <FormLabel>Leno Selvedge</FormLabel>
          <ToggleGroup
            value={border.leno_selvedge}
            options={[{ label: 'Enabled', val: true }, { label: 'Disabled', val: false }]}
            onChange={(v) => update('leno_selvedge', v)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <FormLabel>Selvedge Bit S9</FormLabel>
            <ToggleGroup
              value={border.selvedge_bit_s9}
              options={[{ label: 'On', val: true }, { label: 'Off', val: false }]}
              onChange={(v) => update('selvedge_bit_s9', v)}
            />
          </div>
          <div>
            <FormLabel>Selvedge Bit S10</FormLabel>
            <ToggleGroup
              value={border.selvedge_bit_s10}
              options={[{ label: 'On', val: true }, { label: 'Off', val: false }]}
              onChange={(v) => update('selvedge_bit_s10', v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

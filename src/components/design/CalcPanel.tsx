'use client'

import { useDesignStore } from '@/lib/store/designStore'

export default function CalcPanel() {
  const calcOutputs = useDesignStore((s) => s.calcOutputs)
  const weftSystem = useDesignStore((s) => s.weftSystem)

  if (!calcOutputs) {
    return (
      <div style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'var(--text-3)',
        fontSize: 13,
        lineHeight: 1.6,
        gap: 8,
        minHeight: 200,
      }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>📐</div>
        <div style={{ fontWeight: 500, color: 'var(--text-2)' }}>No data yet</div>
        <div style={{ fontSize: 12 }}>Fill in yarn + loom specs to see calculations</div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '18px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 4,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}>
          Live Calculations
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="pulse-indicator" style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--green)', display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {/* GSM — Hero Metric */}
      <div style={{
        background: 'linear-gradient(135deg, #007AFF14 0%, #007AFF06 100%)',
        border: '1px solid rgba(0,122,255,0.14)',
        borderRadius: 14,
        padding: '16px 16px',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          GSM
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {calcOutputs.gsm.toFixed(1)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, opacity: 0.7 }}>g/m²</span>
        </div>
      </div>

      {/* Key metrics row */}
      <MetricCard label="ENDS PER INCH" value={String(calcOutputs.epi)} />
      <MetricCard label="PRODUCTION" value={calcOutputs.production_m_per_hr.toFixed(2)} unit="m/hr" />

      {/* 2-col grids */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricSmall label="REED SPACE" value={calcOutputs.reed_space_inches.toFixed(1)} unit="in" />
        <MetricSmall label="TOTAL ENDS" value={calcOutputs.total_warp_ends.toLocaleString()} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricSmall label="LINEAR WT" value={calcOutputs.linear_meter_weight_g.toFixed(1)} unit="g/m" />
        <MetricSmall label="OZ/YD²" value={calcOutputs.oz_per_sq_yard.toFixed(2)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricSmall label="WARP WT" value={calcOutputs.warp_weight_per_100m_g.toFixed(0)} unit="g/100m" />
        <MetricSmall label="WEFT WT" value={calcOutputs.weft_weight_per_100m_g.toFixed(0)} unit="g/100m" />
      </div>

      {/* Weft breakdown */}
      {calcOutputs.per_yarn_weft_weights && Object.keys(calcOutputs.per_yarn_weft_weights).length >= 1 && (
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border-light)',
          borderRadius: 12,
          padding: '13px 14px',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
          }}>
            Weft Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {Object.entries(calcOutputs.per_yarn_weft_weights).map(([id, weight], idx) => (
              <YarnWeightRow key={id} id={id} weight={weight} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Warp consumed */}
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border-light)',
        borderRadius: 12,
        padding: '13px 14px',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5,
        }}>
          Warp Consumed
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            {calcOutputs.warp_consumed_m_per_hr.toFixed(2)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>m/hr</span>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 12,
      padding: '13px 14px',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 28, fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{unit}</span>}
      </div>
    </div>
  )
}

function MetricSmall({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border-light)',
      borderRadius: 10,
      padding: '10px 11px',
    }}>
      <div style={{
        fontSize: 9, fontWeight: 600, color: 'var(--text-3)',
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{value}</span>
        {unit && <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 500 }}>{unit}</span>}
      </div>
    </div>
  )
}

function YarnWeightRow({ id, weight, index }: { id: string; weight: number; index: number }) {
  const yarn = useDesignStore((s) => s.weftSystem.yarns.find((y) => y.id === id))
  if (!yarn) return null

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const letter = letters[index] || String(index + 1)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: yarn.colour_hex,
          boxShadow: `0 0 0 2px ${yarn.colour_hex}33`,
          flexShrink: 0,
        }} />
        <span style={{ color: 'var(--text-2)', fontWeight: 500, letterSpacing: '-0.01em' }}>
          {letter} — {yarn.label}
        </span>
      </div>
      <span style={{
        color: 'var(--text-1)', fontWeight: 700,
        fontFamily: 'var(--font-mono)', fontSize: 12,
      }}>
        {weight.toFixed(0)}<small style={{ fontWeight: 400, opacity: 0.5, fontSize: 10 }}>g</small>
      </span>
    </div>
  )
}

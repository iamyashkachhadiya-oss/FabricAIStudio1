'use client'

import { useDesignStore } from '@/lib/store/designStore'

export default function CalcPanel() {
  const calcOutputs = useDesignStore((s) => s.calcOutputs)

  if (!calcOutputs) {
    return (
      <div style={{
        width: 280,
        flexShrink: 0,
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'var(--text-3)',
        fontSize: 13,
        lineHeight: 1.5,
      }}>
        Fill in yarn + loom specs to see calculations
      </div>
    )
  }

  return (
    <div style={{
      width: 280,
      flexShrink: 0,
      padding: '20px 16px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div className="section-header" style={{ marginBottom: 0 }}>Live Calculations</div>

      {/* Primary Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* GSM */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(232,168,56,0.08) 0%, rgba(232,168,56,0.02) 100%)',
          borderRadius: 12,
          padding: '16px 18px',
          border: '1px solid rgba(232,168,56,0.15)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            GSM
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
            {calcOutputs.gsm.toFixed(1)}
          </div>
        </div>

        {/* EPI */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: 10,
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Ends per Inch
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
            {calcOutputs.epi}
          </div>
        </div>

        {/* Production */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: 10,
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Production
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
              {calcOutputs.production_m_per_hr.toFixed(2)}
            </span>
            <span style={{ fontSize: 11, color: '#888' }}>m/hr</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Metric label="Reed Space" value={calcOutputs.reed_space_inches.toFixed(1)} unit="in" />
        <Metric label="Total Ends" value={calcOutputs.total_warp_ends.toLocaleString()} unit="" />
        <Metric label="Linear Wt" value={calcOutputs.linear_meter_weight_g.toFixed(1)} unit="g/m" />
        <Metric label="oz/yd²" value={calcOutputs.oz_per_sq_yard.toFixed(2)} unit="" />
        <Metric label="Warp Wt" value={calcOutputs.warp_weight_per_100m_g.toFixed(0)} unit="g/100m" />
        <Metric label="Weft Wt" value={calcOutputs.weft_weight_per_100m_g.toFixed(0)} unit="g/100m" />
      </div>

      {/* Multi-Yarn Weight Breakdown */}
      {calcOutputs.per_yarn_weft_weights && Object.keys(calcOutputs.per_yarn_weft_weights).length > 1 && (
        <div className="card" style={{ padding: 12, background: 'var(--bg-darker)', border: 'none', borderRadius: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>
            Weft Weight Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(calcOutputs.per_yarn_weft_weights).map(([id, weight]) => {
              // We need the yarn label from the store
              return <YarnWeightRow key={id} id={id} weight={weight} />
            })}
          </div>
        </div>
      )}

      <Metric label="Warp Consumed" value={calcOutputs.warp_consumed_m_per_hr.toFixed(2)} unit="m/hr" />

      {/* Recalculated Live Indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: 'var(--text-3)',
        justifyContent: 'center',
        paddingTop: 8,
      }}>
        <span className="pulse-indicator" style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#4ADE80', display: 'inline-block',
        }} />
        Recalculated live
      </div>
    </div>
  )
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{
      background: 'var(--bg)',
      borderRadius: 8,
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{value}</span>
        {unit && <span style={{ fontSize: 10, color: '#888' }}>{unit}</span>}
      </div>
    </div>
  )
}
function YarnWeightRow({ id, weight }: { id: string; weight: number }) {
  const yarn = useDesignStore((s) => s.weftSystem.yarns.find((y) => y.id === id))
  if (!yarn) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: yarn.colour_hex }} />
        <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{yarn.label}</span>
      </div>
      <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{weight.toFixed(0)}<small style={{ fontWeight: 400, opacity: 0.6 }}>g</small></span>
    </div>
  )
}

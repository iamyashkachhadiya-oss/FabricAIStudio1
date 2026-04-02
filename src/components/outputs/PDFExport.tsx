'use client'

import { useDesignStore } from '@/lib/store/designStore'

// PDF generation using canvas-based approach (avoids @react-pdf SSR issues)
export async function downloadPDF() {
  const state = useDesignStore.getState()
  const { identity, warp, weftSystem, loom, calcOutputs } = state

  // Create a printable HTML document
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download PDF')
    return
  }

  const weftYarnRows = weftSystem.yarns.map((y, idx) => `
    <tr><td colspan="2" style="font-weight:700;color:#1B1F3B;padding-top:${idx === 0 ? '0' : '16px'}; border-bottom: 2px solid #E8A838;">
      ${y.label} [Nozzles: ${y.nozzle_config.sequence.join(', ')}]
    </td></tr>
    <tr><td>Count</td><td>${y.count_value} ${y.count_system === 'denier' ? 'D' : 'Ne'}</td></tr>
    <tr><td>Material</td><td>${y.material}</td></tr>
    <tr><td>Luster</td><td>${y.luster}</td></tr>
    <tr><td>Shrinkage</td><td>${y.properties.shrinkage_min_pct}% – ${y.properties.shrinkage_max_pct}%</td></tr>
    <tr><td>Nozzle Pressure</td><td>${y.nozzle_config.pressure_bar} Bar</td></tr>
    ${y.notes ? `<tr><td>Notes</td><td>${y.notes}</td></tr>` : ''}
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${identity.design_number}_${identity.design_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; color: #1B1F3B; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #E8A838; }
    .logo { font-size: 22px; font-weight: 700; }
    .logo span { color: #E8A838; }
    .meta { font-size: 11px; color: #666; text-align: right; }
    h2 { font-size: 14px; font-weight: 700; color: #E8A838; text-transform: uppercase; letter-spacing: 0.1em; margin: 24px 0 12px; }
    .section { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { padding: 8px 12px; border-bottom: 1px solid #E2E0D8; }
    td:first-child { font-weight: 500; color: #666; width: 40%; }
    td:last-child { font-weight: 600; }
    .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .calc-item { background: #F7F6F2; border-radius: 8px; padding: 14px; }
    .calc-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #888; }
    .calc-value { font-size: 22px; font-weight: 700; color: #1B1F3B; margin-top: 4px; }
    .calc-value.highlight { color: #E8A838; font-size: 28px; }
    .calc-unit { font-size: 11px; color: #888; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E0D8; font-size: 10px; color: #999; text-align: center; }
    .page-break { page-break-before: always; padding-top: 30px; }
    .peg-grid { margin: 16px 0; }
    .peg-row { display: flex; }
    .peg-cell { width: 18px; height: 18px; border: 1px solid #E2E0D8; }
    .peg-cell.filled { background: #1B1F3B; }
    .sv-table tr:nth-child(even) td { background: #F7F6F2; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <!-- PAGE 1: Identity + Yarn + Machine -->
  <div class="header">
    <div>
      <div class="logo">Fabric<span>AI</span> Studio</div>
    </div>
    <div class="meta">
      <div>${loom ? 'Factory Document' : ''}</div>
      <div>${new Date().toLocaleDateString()}</div>
      <div>Version ${state.designId ? '1.0' : 'Draft'}</div>
    </div>
  </div>

  <div class="section">
    <h2>Design Identity</h2>
    <table>
      <tr><td>Design Name</td><td>${identity.design_name || '—'}</td></tr>
      <tr><td>Design Number</td><td>${identity.design_number || '—'}</td></tr>
      <tr><td>Quality Name</td><td>${identity.quality_name || '—'}</td></tr>
      <tr><td>Customer Reference</td><td>${identity.customer_ref || '—'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Warp Specification</h2>
    <table>
      <tr><td>Count</td><td>${warp?.count_value || '—'} ${warp?.count_system === 'denier' ? 'D' : 'Ne'}${warp?.filament_count ? `/${warp.filament_count}f` : ''}</td></tr>
      <tr><td>Material</td><td>${warp?.material || '—'}</td></tr>
      <tr><td>Luster</td><td>${warp?.luster || '—'}</td></tr>
      <tr><td>Colour</td><td>${warp?.colour_code || '—'}</td></tr>
      <tr><td>EPI</td><td>${calcOutputs?.epi || '—'}</td></tr>
      <tr><td>Reed Count</td><td>${loom?.reed_count_stockport || '—'}s Stockport</td></tr>
      <tr><td>Ends / Dent</td><td>${loom?.ends_per_dent || '—'}</td></tr>
    </table>
  </div>

  <div class="section">
    <h2>Weft Specification</h2>
    <table>
      ${weftYarnRows}
    </table>
  </div>

  <div class="section">
    <h2>Machine Parameters</h2>
    <table>
      <tr><td>Machine Type</td><td>${loom?.machine_type?.replace(/_/g, ' ') || '—'}</td></tr>
      <tr><td>Dobby Type</td><td>${loom?.dobby_type || '—'}</td></tr>
      <tr><td>RPM</td><td>${loom?.machine_rpm || '—'}</td></tr>
      <tr><td>Cloth Width</td><td>${loom?.cloth_width_inches || '—'}"</td></tr>
      <tr><td>Efficiency</td><td>${loom?.loom_efficiency_pct || '—'}%</td></tr>
      <tr><td>Total Nozzles</td><td>${weftSystem.total_nozzles_available}</td></tr>
    </table>
  </div>

  ${loom?.sv1_psi ? `
  <div class="section">
    <h2>Pneumatic Settings</h2>
    <table class="sv-table">
      <tr><td>SV1 — Cloth Storage</td><td>${loom.sv1_psi} PSI</td></tr>
      <tr><td>SV2 — Beater</td><td>${loom.sv2_psi} PSI</td></tr>
      <tr><td>SV3 — Dobby</td><td>${loom.sv3_psi} PSI</td></tr>
      <tr><td>SV4 — Shuttle Right</td><td>${loom.sv4_psi} PSI</td></tr>
      <tr><td>SV5 — Shuttle Left</td><td>${loom.sv5_psi} PSI</td></tr>
    </table>
  </div>
  ` : ''}

  <!-- PAGE 2: Peg Plan -->
  <div class="page-break">
    <h2>Peg Plan</h2>
    ${state.pegPlanMatrix.length > 0 ? `
    <div class="peg-grid">
      ${state.pegPlanMatrix.map((row, ri) => `
        <div class="peg-row">
          <span style="width:24px;font-size:10px;color:#888;text-align:right;padding-right:4px;display:inline-block;">${ri + 1}</span>
          ${row.map((cell) => `<div class="peg-cell${cell ? ' filled' : ''}"></div>`).join('')}
        </div>
      `).join('')}
    </div>
    ` : '<p style="color:#888;font-size:13px;">No peg plan defined</p>'}

    ${weftSystem.mode === 'advanced' && weftSystem.insertion_sequence.pattern.length > 0 ? `
    <h2>Master Weft Insertion Pattern</h2>
    <div style="font-size:18px;font-weight:700;padding:16px;background:#F7F6F2;border-radius:8px;">
      ${weftSystem.insertion_sequence.pattern.map(id => weftSystem.yarns.find(y => y.id === id)?.label).join(' – ')}
    </div>
    ` : ''}
  </div>

  <!-- PAGE 3: Calculations -->
  ${calcOutputs ? `
  <div class="page-break">
    <h2>Fabric Output Calculations</h2>
    <div class="calc-grid">
      <div class="calc-item">
        <div class="calc-label">GSM</div>
        <div class="calc-value highlight">${calcOutputs.gsm.toFixed(1)}</div>
      </div>
      <div class="calc-item">
        <div class="calc-label">EPI</div>
        <div class="calc-value">${calcOutputs.epi}</div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Reed Space</div>
        <div class="calc-value">${calcOutputs.reed_space_inches.toFixed(1)} <span class="calc-unit">inches</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Total Warp Ends</div>
        <div class="calc-value">${calcOutputs.total_warp_ends.toLocaleString()}</div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Linear Weight</div>
        <div class="calc-value">${calcOutputs.linear_meter_weight_g.toFixed(1)} <span class="calc-unit">g/m</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-label">oz/yd²</div>
        <div class="calc-value">${calcOutputs.oz_per_sq_yard.toFixed(2)}</div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Warp Weight</div>
        <div class="calc-value">${calcOutputs.warp_weight_per_100m_g.toFixed(0)} <span class="calc-unit">g/100m</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Weft Weight</div>
        <div class="calc-value">${calcOutputs.weft_weight_per_100m_g.toFixed(0)} <span class="calc-unit">g/100m</span></div>
      </div>
      <div class="calc-item" style="grid-column:span 2;">
        <div class="calc-label">Production Rate (Actual)</div>
        <div class="calc-value">${calcOutputs.production_m_per_hr.toFixed(2)} <span class="calc-unit">m/hr</span></div>
        <div style="font-size:10px;color:#888;margin-top:4px;">= (${loom?.machine_rpm} RPM × 60) / (${loom?.target_ppi} PPI × 39.37) × ${loom?.loom_efficiency_pct}%</div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- PAGE 4: Fabric Simulation Report -->
  ${calcOutputs?.simulation ? `
  <div class="page-break">
    <h2>Fabric Output Simulation Report</h2>
    
    <div style="text-align:center;padding:20px;background:#FFF8E8;border-radius:12px;margin-bottom:20px;border:1px solid #F0D68A;">
      <div style="font-size:10px;font-weight:700;color:#E8A838;text-transform:uppercase;letter-spacing:0.2em;">Identified Fabric Profile</div>
      <div style="font-size:24px;font-weight:800;color:#1B1F3B;margin:8px 0 4px;text-transform:capitalize;">${calcOutputs.simulation.archetype}</div>
      <div style="font-size:12px;color:#666;">${calcOutputs.simulation.archetype_description}</div>
    </div>

    <div class="calc-grid">
      <div class="calc-item" style="border-left:4px solid #C41E3A;">
        <div class="calc-label">Shrinkage</div>
        <div class="calc-value" style="color:#C41E3A;">${calcOutputs.simulation.shrinkage_pct.toFixed(1)}<span class="calc-unit">%</span></div>
        <div style="height:6px;background:#F0EEEE;border-radius:3px;margin-top:8px;overflow:hidden;">
          <div style="height:100%;width:${Math.round((calcOutputs.simulation.shrinkage_pct / 35) * 100)}%;background:#C41E3A;border-radius:3px;"></div>
        </div>
      </div>
      <div class="calc-item" style="border-left:4px solid #2980B9;">
        <div class="calc-label">Drape Index</div>
        <div class="calc-value" style="color:#2980B9;">${calcOutputs.simulation.drape_index}<span class="calc-unit">/ 100</span></div>
        <div style="height:6px;background:#F0EEEE;border-radius:3px;margin-top:8px;overflow:hidden;">
          <div style="height:100%;width:${calcOutputs.simulation.drape_index}%;background:#2980B9;border-radius:3px;"></div>
        </div>
      </div>
      <div class="calc-item" style="border-left:4px solid #E67E22;">
        <div class="calc-label">Stiffness Index</div>
        <div class="calc-value" style="color:#E67E22;">${calcOutputs.simulation.stiffness_index}<span class="calc-unit">/ 100</span></div>
        <div style="height:6px;background:#F0EEEE;border-radius:3px;margin-top:8px;overflow:hidden;">
          <div style="height:100%;width:${calcOutputs.simulation.stiffness_index}%;background:#E67E22;border-radius:3px;"></div>
        </div>
      </div>
      <div class="calc-item" style="border-left:4px solid #27AE60;">
        <div class="calc-label">Fabric Strength</div>
        <div class="calc-value" style="color:#27AE60;">${calcOutputs.simulation.strength_n_per_cm.toFixed(1)}<span class="calc-unit">N/cm</span></div>
        <div style="height:6px;background:#F0EEEE;border-radius:3px;margin-top:8px;overflow:hidden;">
          <div style="height:100%;width:${Math.round(Math.min(calcOutputs.simulation.strength_n_per_cm / 400, 1) * 100)}%;background:#27AE60;border-radius:3px;"></div>
        </div>
      </div>
    </div>

    <div class="calc-grid" style="margin-top:16px;">
      <div class="calc-item">
        <div class="calc-label">Dimensional Stability</div>
        <div class="calc-value">${calcOutputs.simulation.dimensional_stability}<span class="calc-unit">/ 100</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Softness</div>
        <div class="calc-value">${calcOutputs.simulation.softness}<span class="calc-unit">/ 100</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Handle Score</div>
        <div class="calc-value">${calcOutputs.simulation.handle_score}<span class="calc-unit">/ 100</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Cover Factor</div>
        <div class="calc-value">${calcOutputs.simulation.cover_factor.toFixed(2)}</div>
      </div>
    </div>

    <h2 style="margin-top:24px;">Warp Material Contribution</h2>
    <table>
      <tr><td>Material</td><td>${calcOutputs.simulation.warp_contribution.material}</td></tr>
      <tr><td>Shrink Base</td><td>${calcOutputs.simulation.warp_contribution.shrink_base}%</td></tr>
      <tr><td>Drape Base</td><td>${calcOutputs.simulation.warp_contribution.drape_base}</td></tr>
      <tr><td>Stiffness Base</td><td>${calcOutputs.simulation.warp_contribution.stiff_base}</td></tr>
      <tr><td>Tenacity Base</td><td>${calcOutputs.simulation.warp_contribution.tenacity_base} N/cm</td></tr>
    </table>

    ${calcOutputs.simulation.weft_contributions.length > 0 ? `
    <h2 style="margin-top:20px;">Weft Material Contributions</h2>
    <table>
      ${calcOutputs.simulation.weft_contributions.map((w: { yarn_label: string; material: string; shrink_base: number; drape_base: number; stiff_base: number; tenacity_base: number }) => `
        <tr style="border-bottom:2px solid #E8A838;"><td colspan="2" style="font-weight:700;">${w.yarn_label} — ${w.material}</td></tr>
        <tr><td>Shrink Base</td><td>${w.shrink_base}%</td></tr>
        <tr><td>Drape Base</td><td>${w.drape_base}</td></tr>
        <tr><td>Stiffness Base</td><td>${w.stiff_base}</td></tr>
        <tr><td>Tenacity Base</td><td>${w.tenacity_base} N/cm</td></tr>
      `).join('')}
    </table>
    ` : ''}

    <h2 style="margin-top:20px;">Engineering Alerts</h2>
    ${calcOutputs.simulation.alerts.map((a: { severity: string; message: string; fix: string }) => {
      const alertColors: Record<string, string> = { ok: '#eaf3de', warn: '#faeeda', danger: '#fcebeb', info: '#e6f1fb' }
      const borderColors: Record<string, string> = { ok: '#3b6d11', warn: '#ba7517', danger: '#a32d2d', info: '#185fa5' }
      return `<div style="padding:10px 14px;border-radius:8px;margin-bottom:8px;background:${alertColors[a.severity] || '#f0f0f0'};border-left:3px solid ${borderColors[a.severity] || '#888'};font-size:12px;">
        <strong>${a.message}</strong><br/>
        <span style="font-size:10px;color:#888;">Recommended: ${a.fix}</span>
      </div>`
    }).join('')}

    <h2 style="margin-top:20px;">Simulation Formulas</h2>
    <table>
      <tr><td>Shrinkage %</td><td style="font-family:monospace;font-size:10px;">S% = S_base × (1 + regain/100 × 1.8) × crimp × density × tension</td></tr>
      <tr><td>Drape Index</td><td style="font-family:monospace;font-size:10px;">D = D_base × weave_mod × density^0.4 × fineness × (1 − tension×0.22)</td></tr>
      <tr><td>Stiffness</td><td style="font-family:monospace;font-size:10px;">ST = ST_base × weave_mod × density^0.6 × coarseness × tension</td></tr>
      <tr><td>Strength</td><td style="font-family:monospace;font-size:10px;">FS = (T × density × weave × cover × elong) / Ne^0.45</td></tr>
    </table>
  </div>
  ` : ''}

  <!-- PAGE 5: Costing Summary -->
  ${calcOutputs ? `
  <div class="page-break">
    <h2>Costing Summary</h2>
    <div class="calc-grid">
      <div class="calc-item" style="grid-column:span 2;text-align:center;">
        <div class="calc-label">Estimated Cost per Linear Meter</div>
        <div class="calc-value highlight" style="font-size:36px;">$${calcOutputs.cost_per_meter.toFixed(2)}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">Raw Material Cost (Warp + Weft)</div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Warp Cost Share</div>
        <div class="calc-value">${calcOutputs.warp_cost_pct}<span class="calc-unit">%</span></div>
      </div>
      <div class="calc-item">
        <div class="calc-label">Weft Cost Share</div>
        <div class="calc-value">${calcOutputs.weft_cost_pct}<span class="calc-unit">%</span></div>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    Generated by FabricAI Studio · Solerix Technologies · ${new Date().toLocaleDateString()}
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`

  printWindow.document.write(html)
  printWindow.document.close()
}

export default function PDFExportButton() {
  return (
    <button
      onClick={downloadPDF}
      className="btn-accent"
      style={{ fontSize: 12, height: 36, padding: '0 16px' }}
    >
      Download PDF
    </button>
  )
}

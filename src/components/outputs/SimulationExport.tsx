'use client'

import { useRef, useEffect, useCallback } from 'react'

// Color name → hex lookup table (20 common fabric colors)
const COLOR_MAP: Record<string, string> = {
  'ivory': '#FFFFF0', 'cream': '#FFFDD0', 'white': '#FFFFFF', 'black': '#1B1F3B',
  'navy': '#1B1F3B', 'navy blue': '#1B1F3B', 'red': '#C41E3A', 'maroon': '#800020',
  'gold': '#E8A838', 'amber': '#E8A838', 'yellow': '#F4D03F', 'orange': '#E67E22',
  'green': '#27AE60', 'olive': '#808000', 'teal': '#008080', 'blue': '#2980B9',
  'royal blue': '#2B60DE', 'pink': '#E8909C', 'magenta': '#C2185B', 'purple': '#7B1FA2',
  'grey': '#888888', 'gray': '#888888', 'silver': '#C0C0C0', 'brown': '#6D4C41',
  'beige': '#F5F5DC', 'peach': '#FFDAB9', 'coral': '#FF6F61', 'turquoise': '#40E0D0',
  'lavender': '#B388FF', 'rose': '#E8909C',
}

function resolveColor(code: string, fallback: string): string {
  if (!code) return fallback
  // If already hex
  if (code.startsWith('#')) return code
  // Lookup by name
  const lower = code.toLowerCase().trim()
  return COLOR_MAP[lower] || fallback
}

interface SimulationPreviewProps {
  matrix: number[][]
  warpColor: string
  weftColor: string
  designName: string
}

export default function SimulationPreview({ matrix, warpColor, weftColor, designName }: SimulationPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  const warpHex = resolveColor(warpColor, '#1B1F3B')
  const weftHex = resolveColor(weftColor, '#E8A838')

  const renderSimulation = useCallback((canvas: HTMLCanvasElement, size: number) => {
    if (!matrix.length || !matrix[0]?.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rows = matrix.length
    const cols = matrix[0].length

    // Tile 6x6 minimum
    const tilesX = Math.max(6, Math.ceil(size / (cols * 4)))
    const tilesY = Math.max(6, Math.ceil(size / (rows * 4)))
    const cellSize = Math.floor(size / Math.max(cols * tilesX, rows * tilesY))
    const actualCellSize = Math.max(cellSize, 2)

    const totalW = cols * tilesX * actualCellSize
    const totalH = rows * tilesY * actualCellSize

    canvas.width = totalW
    canvas.height = totalH
    canvas.style.width = `${Math.min(totalW, size)}px`
    canvas.style.height = `${Math.min(totalH, size)}px`

    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = (tx * cols + c) * actualCellSize
            const y = (ty * rows + r) * actualCellSize
            // 1 = warp up (show warp color), 0 = weft up (show weft color)
            ctx.fillStyle = matrix[r][c] === 1 ? warpHex : weftHex
            ctx.fillRect(x, y, actualCellSize, actualCellSize)
          }
        }
      }
    }
  }, [matrix, warpHex, weftHex])

  useEffect(() => {
    // Render 300px preview
    if (previewRef.current && matrix.length > 0) {
      renderSimulation(previewRef.current, 300)
    }
  }, [renderSimulation, matrix])

  const downloadPNG = () => {
    // Render full 1200px to hidden canvas
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1200
    renderSimulation(canvas, 1200)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${designName.replace(/\s+/g, '_')}_fabric_simulation.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const copyToClipboard = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1200
    renderSimulation(canvas, 1200)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        alert('Image copied to clipboard!')
      } catch {
        alert('Could not copy to clipboard. Try downloading instead.')
      }
    }, 'image/png')
  }

  if (!matrix.length || !matrix[0]?.length) {
    return (
      <div style={{
        textAlign: 'center', padding: 40,
        color: 'var(--text-3)', fontSize: 13,
      }}>
        Create a peg plan to see fabric simulation
      </div>
    )
  }

  return (
    <div>
      {/* Preview */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <div style={{
          width: 300, height: 300,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <canvas
            ref={previewRef}
            style={{ width: 300, height: 300, display: 'block', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Color Legend */}
      <div style={{
        display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16, fontSize: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: warpHex, border: '1px solid var(--border)' }} />
          <span style={{ color: 'var(--text-2)' }}>Warp</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: weftHex, border: '1px solid var(--border)' }} />
          <span style={{ color: 'var(--text-2)' }}>Weft</span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={downloadPNG} className="btn-primary" style={{ fontSize: 12, height: 36, padding: '0 16px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Download Fabric Image
        </button>
        <button onClick={copyToClipboard} className="btn-secondary" style={{ fontSize: 12, height: 36 }}>
          Copy for WhatsApp
        </button>
      </div>

      {/* Hidden full-res canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

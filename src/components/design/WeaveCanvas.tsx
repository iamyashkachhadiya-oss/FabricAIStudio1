'use client'

import { useRef, useEffect, useCallback } from 'react'

interface WeaveCanvasProps {
  matrix: number[][]
  onToggle?: (row: number, col: number) => void
  shaftCount: number
  repeatW?: number
  repeatH?: number
  readOnly?: boolean
}

const CELL_SIZE = 20
const LABEL_MARGIN = 28
const RAISED_COLOR = '#1D1D1F'
const LOWERED_COLOR = '#FFFFFF'
const GRID_COLOR = 'rgba(0,0,0,0.08)'
const REPEAT_COLOR = '#007AFF'
const LABEL_COLOR = '#86868B'

export default function WeaveCanvas({
  matrix,
  onToggle,
  shaftCount,
  repeatW,
  repeatH,
  readOnly = false,
}: WeaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rows = matrix.length
  const cols = shaftCount

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = LABEL_MARGIN + cols * CELL_SIZE + 1
    const h = LABEL_MARGIN + rows * CELL_SIZE + 1
    canvas.width = w * (window.devicePixelRatio || 1)
    canvas.height = h * (window.devicePixelRatio || 1)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Draw shaft labels (top)
    ctx.font = '600 10px "Inter", -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = LABEL_COLOR
    for (let c = 0; c < cols; c++) {
      ctx.fillText(`${c + 1}`, LABEL_MARGIN + c * CELL_SIZE + CELL_SIZE / 2, LABEL_MARGIN / 2)
    }

    // Draw pick labels (left)
    ctx.textAlign = 'right'
    for (let r = 0; r < rows; r++) {
      ctx.fillText(`${r + 1}`, LABEL_MARGIN - 6, LABEL_MARGIN + r * CELL_SIZE + CELL_SIZE / 2)
    }

    // Draw cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = LABEL_MARGIN + c * CELL_SIZE
        const y = LABEL_MARGIN + r * CELL_SIZE
        const val = matrix[r]?.[c] ?? 0

        ctx.fillStyle = val === 1 ? RAISED_COLOR : LOWERED_COLOR
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

        // Grid line
        ctx.strokeStyle = GRID_COLOR
        ctx.lineWidth = 1
        ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1)
      }
    }

    // Draw repeat boundary
    if (repeatW && repeatH && repeatW > 0 && repeatH > 0) {
      ctx.strokeStyle = REPEAT_COLOR
      ctx.lineWidth = 2
      ctx.strokeRect(
        LABEL_MARGIN,
        LABEL_MARGIN,
        repeatW * CELL_SIZE,
        repeatH * CELL_SIZE
      )
    }
  }, [matrix, cols, rows, repeatW, repeatH])

  useEffect(() => {
    draw()
  }, [draw])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !onToggle) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - LABEL_MARGIN
    const y = e.clientY - rect.top - LABEL_MARGIN

    if (x < 0 || y < 0) return

    const col = Math.floor(x / CELL_SIZE)
    const row = Math.floor(y / CELL_SIZE)

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      onToggle(row, col)
    }
  }

  return (
    <div style={{
      overflow: 'auto',
      maxWidth: cols > 20 ? 20 * CELL_SIZE + LABEL_MARGIN + 20 : undefined,
      maxHeight: rows > 30 ? 30 * CELL_SIZE + LABEL_MARGIN + 20 : undefined,
    }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{
          cursor: readOnly ? 'default' : 'crosshair',
          display: 'block',
        }}
      />
    </div>
  )
}

export function getCanvasImage(canvasRef: React.RefObject<HTMLCanvasElement | null>): string {
  if (!canvasRef.current) return ''
  return canvasRef.current.toDataURL('image/png')
}

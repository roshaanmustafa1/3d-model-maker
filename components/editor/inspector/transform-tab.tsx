'use client'

import React from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { RotateCcw, Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NumberFieldProps {
  label: string
  value: number
  onChange: (val: number) => void
  step?: number
  accentColor?: string
}

function NumberField({ label, value, onChange, step = 0.1, accentColor = 'text-zinc-400' }: NumberFieldProps) {
  const [localVal, setLocalVal] = React.useState(String(Math.round(value * 100) / 100))

  React.useEffect(() => {
    setLocalVal(String(Math.round(value * 100) / 100))
  }, [value])

  const handleBlur = () => {
    const num = parseFloat(localVal)
    if (!isNaN(num)) {
      onChange(num)
    } else {
      setLocalVal(String(Math.round(value * 100) / 100))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    }
  }

  return (
    <div className="flex items-center gap-1.5 rounded bg-[#161a22] px-2 py-1 border border-white/5 focus-within:border-emerald-500/50">
      <span className={`text-[11px] font-bold ${accentColor}`}>{label}</span>
      <input
        type="number"
        step={step}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-right font-mono text-xs text-zinc-100 outline-none"
      />
    </div>
  )
}

export function TransformTab() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const updateNodeTransform = useEditorStore((state) => state.updateNodeTransform)

  if (!node) return null

  const pos = node.transform.position
  const rot = node.transform.rotation
  const sca = node.transform.scale

  const handlePosChange = (axisIndex: 0 | 1 | 2, val: number) => {
    const newPos: [number, number, number] = [...pos]
    newPos[axisIndex] = val
    updateNodeTransform(node.id, { position: newPos }, true)
  }

  const handleRotChange = (axisIndex: 0 | 1 | 2, val: number) => {
    const newRot: [number, number, number] = [...rot]
    newRot[axisIndex] = val
    updateNodeTransform(node.id, { rotation: newRot }, true)
  }

  const handleScaleChange = (axisIndex: 0 | 1 | 2, val: number) => {
    const newScale: [number, number, number] = [...sca]
    newScale[axisIndex] = Math.max(0.001, val)
    updateNodeTransform(node.id, { scale: newScale }, true)
  }

  const handleResetTransform = () => {
    updateNodeTransform(
      node.id,
      {
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      true
    )
  }

  const handleCenterOrigin = () => {
    updateNodeTransform(
      node.id,
      {
        position: [0, pos[1], 0],
      },
      true
    )
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Position */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-zinc-400">Position (X, Y, Z)</label>
        <div className="grid grid-cols-3 gap-1.5">
          <NumberField label="X" value={pos[0]} onChange={(v) => handlePosChange(0, v)} accentColor="text-red-400" />
          <NumberField label="Y" value={pos[1]} onChange={(v) => handlePosChange(1, v)} accentColor="text-emerald-400" />
          <NumberField label="Z" value={pos[2]} onChange={(v) => handlePosChange(2, v)} accentColor="text-blue-400" />
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-zinc-400">Rotation (Degrees)</label>
        <div className="grid grid-cols-3 gap-1.5">
          <NumberField label="X" value={rot[0]} onChange={(v) => handleRotChange(0, v)} step={5} accentColor="text-red-400" />
          <NumberField label="Y" value={rot[1]} onChange={(v) => handleRotChange(1, v)} step={5} accentColor="text-emerald-400" />
          <NumberField label="Z" value={rot[2]} onChange={(v) => handleRotChange(2, v)} step={5} accentColor="text-blue-400" />
        </div>
      </div>

      {/* Scale */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-zinc-400">Scale</label>
        <div className="grid grid-cols-3 gap-1.5">
          <NumberField label="X" value={sca[0]} onChange={(v) => handleScaleChange(0, v)} accentColor="text-red-400" />
          <NumberField label="Y" value={sca[1]} onChange={(v) => handleScaleChange(1, v)} accentColor="text-emerald-400" />
          <NumberField label="Z" value={sca[2]} onChange={(v) => handleScaleChange(2, v)} accentColor="text-blue-400" />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetTransform}
          className="w-1/2 h-8 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5 hover:text-white"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCenterOrigin}
          className="w-1/2 h-8 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5 hover:text-white"
        >
          <Crosshair className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
          Center
        </Button>
      </div>
    </div>
  )
}

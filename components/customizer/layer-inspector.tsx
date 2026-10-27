'use client'

import React from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import {
  Sliders,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  Maximize2,
  Lock,
  Unlock,
  Palette,
} from 'lucide-react'

export function LayerInspector() {
  const activeZoneId = useCustomizerStore((state) => state.activeZoneId)
  const zones = useCustomizerStore((state) => state.zones)
  const activeLayerId = useCustomizerStore((state) => state.activeLayerId)
  const updateLayer = useCustomizerStore((state) => state.updateLayer)
  const recordHistory = useCustomizerStore((state) => state.recordHistory)

  const activeZone = zones[activeZoneId]
  const layer = activeZone?.layers.find((l) => l.id === activeLayerId)

  if (!layer) {
    return (
      <div className="rounded-md border border-white/5 bg-[#12151b] p-4 text-center">
        <Sliders className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
        <p className="text-xs text-zinc-400 font-medium">No Layer Selected</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          Click an element on the canvas or select a layer from the list to edit its properties.
        </p>
      </div>
    )
  }

  const handleUpdate = (updates: Record<string, unknown>) => {
    if (!activeZone) return
    updateLayer(activeZone.id, layer.id, updates)
  }

  const handleCommit = () => {
    recordHistory()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
          Layer Properties
        </label>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {layer.type}
        </span>
      </div>

      {/* Numerical Transforms */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-mono text-zinc-400">Position & Dimensions</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center rounded border border-white/10 bg-[#161a22] px-2 py-1">
            <span className="text-[10px] text-zinc-500 w-5">X</span>
            <input
              type="number"
              value={layer.x}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
              onBlur={handleCommit}
              className="w-full bg-transparent text-right text-xs text-zinc-200 outline-none"
            />
          </div>
          <div className="flex items-center rounded border border-white/10 bg-[#161a22] px-2 py-1">
            <span className="text-[10px] text-zinc-500 w-5">Y</span>
            <input
              type="number"
              value={layer.y}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
              onBlur={handleCommit}
              className="w-full bg-transparent text-right text-xs text-zinc-200 outline-none"
            />
          </div>
          <div className="flex items-center rounded border border-white/10 bg-[#161a22] px-2 py-1">
            <span className="text-[10px] text-zinc-500 w-5">W</span>
            <input
              type="number"
              value={layer.width}
              onChange={(e) => handleUpdate({ width: Math.max(10, Number(e.target.value)) })}
              onBlur={handleCommit}
              className="w-full bg-transparent text-right text-xs text-zinc-200 outline-none"
            />
          </div>
          <div className="flex items-center rounded border border-white/10 bg-[#161a22] px-2 py-1">
            <span className="text-[10px] text-zinc-500 w-5">H</span>
            <input
              type="number"
              value={layer.height}
              onChange={(e) => handleUpdate({ height: Math.max(10, Number(e.target.value)) })}
              onBlur={handleCommit}
              className="w-full bg-transparent text-right text-xs text-zinc-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Rotation & Opacity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-mono text-zinc-400">Rotation: {layer.rotation}°</label>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={layer.rotation}
          onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
          onMouseUp={handleCommit}
          className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex items-center justify-between pt-1">
          <label className="text-[10px] uppercase font-mono text-zinc-400">
            Opacity: {Math.round(layer.opacity * 100)}%
          </label>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={layer.opacity}
          onChange={(e) => handleUpdate({ opacity: Number(e.target.value) })}
          onMouseUp={handleCommit}
          className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Typography Specific Controls */}
      {layer.type === 'text' && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <label className="text-[10px] uppercase font-mono text-zinc-400">Typography Controls</label>

          {/* Edit Text Content */}
          <textarea
            value={layer.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            onBlur={handleCommit}
            rows={2}
            className="w-full rounded border border-white/10 bg-[#161a22] p-2 text-xs text-zinc-100 outline-none focus:border-emerald-500"
          />

          {/* Font Family & Size */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={layer.fontFamily}
              onChange={(e) => {
                handleUpdate({ fontFamily: e.target.value })
                handleCommit()
              }}
              className="rounded border border-white/10 bg-[#161a22] px-2 py-1 text-xs text-zinc-200 outline-none"
            >
              <option value="sans-serif">Sans-Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="Impact">Impact</option>
              <option value="Georgia">Georgia</option>
              <option value="Arial Black">Arial Black</option>
            </select>

            <div className="flex items-center rounded border border-white/10 bg-[#161a22] px-2 py-1">
              <span className="text-[10px] text-zinc-500 mr-2">Size</span>
              <input
                type="number"
                value={layer.fontSize}
                onChange={(e) => handleUpdate({ fontSize: Math.max(8, Number(e.target.value)) })}
                onBlur={handleCommit}
                className="w-full bg-transparent text-right text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>

          {/* Alignment & Weight */}
          <div className="flex items-center justify-between">
            <div className="flex rounded border border-white/10 bg-[#161a22] p-0.5">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => {
                    handleUpdate({ align })
                    handleCommit()
                  }}
                  className={`p-1.5 rounded ${
                    layer.align === align ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="h-3 w-3" />}
                  {align === 'center' && <AlignCenter className="h-3 w-3" />}
                  {align === 'right' && <AlignRight className="h-3 w-3" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] text-zinc-400">Color</label>
              <input
                type="color"
                value={layer.fill}
                onChange={(e) => handleUpdate({ fill: e.target.value })}
                onBlur={handleCommit}
                className="h-6 w-8 rounded border border-white/20 bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shape Specific Controls */}
      {layer.type === 'shape' && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <label className="text-[10px] uppercase font-mono text-zinc-400">Shape Styling</label>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">Fill Color</span>
            <input
              type="color"
              value={layer.fill}
              onChange={(e) => handleUpdate({ fill: e.target.value })}
              onBlur={handleCommit}
              className="h-6 w-8 rounded border border-white/20 bg-transparent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300">Stroke Color</span>
            <input
              type="color"
              value={layer.stroke}
              onChange={(e) => handleUpdate({ stroke: e.target.value })}
              onBlur={handleCommit}
              className="h-6 w-8 rounded border border-white/20 bg-transparent cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Stroke Width</span>
              <span>{layer.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={layer.strokeWidth}
              onChange={(e) => handleUpdate({ strokeWidth: Number(e.target.value) })}
              onMouseUp={handleCommit}
              className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import { useEditorStore } from '@/stores/editor-store'
import { FABRIC_PRESETS } from '@/engine/customization/fabric-presets'
import { Palette, Sparkles, Sliders, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

const COLOR_SWATCHES = [
  '#18181b', // Matte Black
  '#27272a', // Heavy Charcoal
  '#3f3f46', // Vintage Gray
  '#71717a', // Medium Heather
  '#f4f4f5', // Clean White
  '#ef4444', // Crimson Red
  '#f97316', // Bright Orange
  '#eab308', // Gold Mustard
  '#10b981', // Forest Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Cobalt Blue
  '#6366f1', // Indigo
  '#a855f7', // Violet
  '#ec4899', // Hot Pink
]

export function MaterialPanel() {
  const fabricColor = useCustomizerStore((state) => state.fabricColor)
  const fabricRoughness = useCustomizerStore((state) => state.fabricRoughness)
  const fabricMetalness = useCustomizerStore((state) => state.fabricMetalness)
  const fabricPresetId = useCustomizerStore((state) => state.fabricPresetId)
  const blackBulletMode = useCustomizerStore((state) => state.blackBulletMode)

  const setFabricColor = useCustomizerStore((state) => state.setFabricColor)
  const setFabricPreset = useCustomizerStore((state) => state.setFabricPreset)
  const setFabricRoughness = useCustomizerStore((state) => state.setFabricRoughness)
  const setFabricMetalness = useCustomizerStore((state) => state.setFabricMetalness)
  const setBlackBulletMode = useCustomizerStore((state) => state.setBlackBulletMode)

  const handleApplyPreset = (preset: (typeof FABRIC_PRESETS)[0]) => {
    setFabricPreset(preset)
    toast.success(`Applied ${preset.name}`)
  }

  const handleColorChange = (hex: string) => {
    setFabricColor(hex)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-emerald-400" />
          Product Material & Fabric
        </label>
      </div>

      {/* Fabric Finish Presets */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-400" /> Fabric Finish Presets
        </label>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {FABRIC_PRESETS.map((preset) => {
            const isSelected = fabricPresetId === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`w-full flex items-center justify-between rounded px-2.5 py-1.5 text-left text-xs transition-colors border ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                    : 'border-white/5 bg-[#161a22] text-zinc-300 hover:border-white/15 hover:bg-[#1a202c]'
                }`}
              >
                <span className="truncate mr-2">{preset.name}</span>
                <div
                  className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: preset.color }}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Color Palette & Custom Picker */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-mono text-zinc-400">Color Palette</label>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-zinc-400 uppercase">{fabricColor}</span>
            <input
              type="color"
              value={fabricColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-5 w-6 rounded border border-white/20 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {COLOR_SWATCHES.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`h-6 rounded border transition-transform ${
                fabricColor.toLowerCase() === color.toLowerCase()
                  ? 'border-white scale-110 shadow-sm'
                  : 'border-white/10 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Surface Physical Properties */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1">
          <Sliders className="h-3 w-3 text-emerald-400" /> Surface Properties
        </label>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>Roughness (Matte vs Sheen)</span>
            <span>{Math.round(fabricRoughness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={fabricRoughness}
            onChange={(e) => {
              const val = Number(e.target.value)
              setFabricRoughness(val)
            }}
            className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>Metalness / Specular</span>
            <span>{Math.round(fabricMetalness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={fabricMetalness}
            onChange={(e) => {
              const val = Number(e.target.value)
              setFabricMetalness(val)
            }}
            className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* BlackBullet Compatibility Mode Toggle */}
      <div className="space-y-1.5 pt-2 border-t border-white/10">
        <label className="text-[10px] uppercase font-mono text-zinc-400 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-400" /> BlackBullet Appearance Mode
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setBlackBulletMode('preserve-imported')
              toast.info('Set to Preserve Imported Appearance mode')
            }}
            className={`rounded p-2 text-left text-xs transition-colors border ${
              blackBulletMode === 'preserve-imported'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                : 'border-white/5 bg-[#161a22] text-zinc-400 hover:text-white'
            }`}
          >
            <div className="font-medium text-[11px]">Preserve Imported</div>
            <div className="text-[9px] text-zinc-500 mt-0.5">Retains baked PBR & authored maps</div>
          </button>
          <button
            onClick={() => {
              setBlackBulletMode('runtime-customization')
              toast.info('Set to Runtime Customization mode')
            }}
            className={`rounded p-2 text-left text-xs transition-colors border ${
              blackBulletMode === 'runtime-customization'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                : 'border-white/5 bg-[#161a22] text-zinc-400 hover:text-white'
            }`}
          >
            <div className="font-medium text-[11px]">Runtime Customizer</div>
            <div className="text-[9px] text-zinc-500 mt-0.5">Enables live color tinting in BB</div>
          </button>
        </div>
      </div>
    </div>
  )
}

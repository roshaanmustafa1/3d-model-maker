'use client'

import React from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Square,
} from 'lucide-react'

export function LayersPanel() {
  const activeZoneId = useCustomizerStore((state) => state.activeZoneId)
  const zones = useCustomizerStore((state) => state.zones)
  const activeLayerId = useCustomizerStore((state) => state.activeLayerId)
  const setActiveLayer = useCustomizerStore((state) => state.setActiveLayer)
  const updateLayer = useCustomizerStore((state) => state.updateLayer)
  const removeLayer = useCustomizerStore((state) => state.removeLayer)
  const reorderLayers = useCustomizerStore((state) => state.reorderLayers)
  const duplicateLayer = useCustomizerStore((state) => state.duplicateLayer)

  const activeZone = zones[activeZoneId]
  if (!activeZone) return null

  // Display top layer at top of UI list (descending zIndex)
  const layers = [...activeZone.layers].sort((a, b) => b.zIndex - a.zIndex)

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-3.5 w-3.5 text-sky-400" />
      case 'text':
        return <Type className="h-3.5 w-3.5 text-amber-400" />
      case 'shape':
      default:
        return <Square className="h-3.5 w-3.5 text-emerald-400" />
    }
  }

  const handleMoveUp = (index: number) => {
    // In our descending display, moving "up" means moving towards the top of the stack (higher zIndex)
    if (index > 0) {
      const realFrom = activeZone.layers.findIndex((l) => l.id === layers[index].id)
      const realTo = activeZone.layers.findIndex((l) => l.id === layers[index - 1].id)
      reorderLayers(activeZone.id, realFrom, realTo)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < layers.length - 1) {
      const realFrom = activeZone.layers.findIndex((l) => l.id === layers[index].id)
      const realTo = activeZone.layers.findIndex((l) => l.id === layers[index + 1].id)
      reorderLayers(activeZone.id, realFrom, realTo)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-emerald-400" />
          Active Layers ({layers.length})
        </label>
        <span className="text-[10px] text-zinc-500 font-mono">{activeZone.name}</span>
      </div>

      {layers.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 p-4 text-center">
          <p className="text-[11px] text-zinc-500">No artwork layers in this zone.</p>
          <p className="text-[10px] text-zinc-600 mt-1">Upload an image or add text from above.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {layers.map((layer, index) => {
            const isSelected = activeLayerId === layer.id
            return (
              <div
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`group flex items-center justify-between rounded p-2 text-xs transition-colors cursor-pointer border ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 bg-[#161a22] text-zinc-300 hover:border-white/15 hover:bg-[#1a202c]'
                }`}
              >
                {/* Left: Icon & Name */}
                <div className="flex items-center gap-2 truncate flex-1 mr-2">
                  <span className="shrink-0">{getLayerIcon(layer.type)}</span>
                  <span className="truncate text-xs">{layer.name}</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveUp(index)
                      }}
                      className="text-zinc-500 hover:text-white disabled:opacity-20"
                    >
                      <ChevronUp className="h-2.5 w-2.5" />
                    </button>
                    <button
                      disabled={index === layers.length - 1}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveDown(index)
                      }}
                      className="text-zinc-500 hover:text-white disabled:opacity-20"
                    >
                      <ChevronDown className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Lock Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateLayer(activeZone.id, layer.id, { locked: !layer.locked })
                    }}
                    className={`p-1 text-zinc-400 hover:text-white ${layer.locked ? 'text-amber-400' : ''}`}
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateLayer(activeZone.id, layer.id, { visible: !layer.visible })
                    }}
                    className={`p-1 text-zinc-400 hover:text-white ${!layer.visible ? 'text-zinc-600' : ''}`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateLayer(activeZone.id, layer.id)
                    }}
                    className="p-1 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Duplicate layer"
                  >
                    <Copy className="h-3 w-3" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLayer(activeZone.id, layer.id)
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400"
                    title="Delete layer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

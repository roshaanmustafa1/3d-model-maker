'use client'

import React, { useRef } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { MATERIAL_PRESETS } from '@/engine/scene/material-manager'
import { MaterialData } from '@/types/scene'
import { Palette, Upload, Trash2, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export function MaterialTab() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const materials = useEditorStore((state) => state.materials)
  const updateMaterial = useEditorStore((state) => state.updateMaterial)
  const createMaterial = useEditorStore((state) => state.createMaterial)
  const assignMaterial = useEditorStore((state) => state.assignMaterial)
  const viewMode = useEditorStore((state) => state.viewMode)
  const setViewMode = useEditorStore((state) => state.setViewMode)

  const albedoInputRef = useRef<HTMLInputElement>(null)
  const normalInputRef = useRef<HTMLInputElement>(null)

  if (!node || node.type !== 'mesh') {
    return (
      <div className="py-6 text-center text-xs text-zinc-500">
        Select a mesh object to edit its material.
      </div>
    )
  }

  const [selectedSlotIndex, setSelectedSlotIndex] = React.useState<number>(0)
  const editorMode = useEditorStore((state) => state.editorMode)
  const selectedFaceIds = useEditorStore((state) => state.selectedFaceIds)
  const addMaterialSlot = useEditorStore((state) => state.addMaterialSlot)
  const removeMaterialSlot = useEditorStore((state) => state.removeMaterialSlot)
  const assignMaterialToSelectedFaces = useEditorStore((state) => state.assignMaterialToSelectedFaces)

  const slots = React.useMemo(() => {
    if (!node || node.type !== 'mesh') return []
    return node.materialIds && node.materialIds.length > 0
      ? node.materialIds
      : [node.materialId || Object.keys(materials)[0] || '']
  }, [node, materials])

  const safeSlotIndex = Math.min(selectedSlotIndex, Math.max(0, slots.length - 1))
  const activeMaterialId = slots[safeSlotIndex] || node.materialId || Object.keys(materials)[0]
  const currentMaterial: MaterialData | undefined = materials[activeMaterialId]
  const hasMap = (slot: 'map' | 'normalMap') =>
    !!currentMaterial?.[slot] ||
    (currentMaterial?.[slot] === undefined && !!currentMaterial?.importedTextureSlots?.includes(slot))

  if (!currentMaterial) {
    return (
      <div className="space-y-3 py-4 text-center">
        <p className="text-xs text-zinc-400">No material assigned to this mesh.</p>
        <Button
          size="sm"
          className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs"
          onClick={() => {
            const newId = createMaterial(`${node.name}_Material`)
            assignMaterial(node.id, newId, safeSlotIndex)
          }}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Create Material
        </Button>
      </div>
    )
  }

  const handleTextureUpload = (type: 'map' | 'normalMap', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      updateMaterial(activeMaterialId, { [type]: dataUrl }, true)
      toast.success(`Loaded ${type === 'map' ? 'Albedo' : 'Normal'} map`)
    }
    reader.readAsDataURL(file)
  }

  const applyPreset = (key: string) => {
    const preset = MATERIAL_PRESETS[key]
    if (preset) {
      updateMaterial(activeMaterialId, preset, true)
      toast.success(`Applied ${key} preset`)
    }
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Material Slots (Milestone 2.3) */}
      <div className="space-y-2 rounded border border-white/5 bg-[#161a22] p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Material Slots ({slots.length})
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-[10px] text-zinc-400 hover:text-emerald-400"
            onClick={() => {
              const newMatId = createMaterial(`${node.name}_Mat_${slots.length + 1}`)
              addMaterialSlot(node.id, newMatId)
              setSelectedSlotIndex(slots.length)
              toast.success(`Added Material Slot ${slots.length + 1}`)
            }}
          >
            <Plus className="mr-1 h-3 w-3" /> Add Slot
          </Button>
        </div>

        {/* Slot Pills */}
        <div className="space-y-1">
          {slots.map((slotMatId, idx) => {
            const slotMat = materials[slotMatId]
            const isSelected = idx === safeSlotIndex
            return (
              <div
                key={`${slotMatId}_${idx}`}
                onClick={() => setSelectedSlotIndex(idx)}
                className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors border ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-zinc-200'
                    : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: slotMat?.color || '#888' }}
                  />
                  <span className="text-[11px] font-medium">
                    Slot {idx}: {slotMat?.name || 'Unnamed Material'}
                  </span>
                </div>
                {slots.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeMaterialSlot(node.id, idx)
                      setSelectedSlotIndex(Math.max(0, idx - 1))
                      toast.success(`Removed Material Slot ${idx}`)
                    }}
                    className="text-zinc-500 hover:text-red-400 p-0.5"
                    title="Remove slot"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <label className="block text-[11px] text-zinc-400">Assign material to active slot
          <select aria-label="Assign material to active slot" value={activeMaterialId} className="mt-1 w-full rounded bg-[#12151b] p-1.5 text-zinc-200" onChange={event => assignMaterial(node.id, event.target.value, safeSlotIndex)}>
            {Object.values(materials).map(material => <option key={material.id} value={material.id}>{material.name}</option>)}
          </select>
        </label>
        {/* Assign to Selected Faces (Edit Mode) */}
        {editorMode === 'edit' && (
          <Button
            size="sm"
            disabled={selectedFaceIds.length === 0}
            className="w-full h-7 mt-1.5 text-[11px] font-medium bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-40"
            onClick={() => {
              assignMaterialToSelectedFaces(activeMaterialId)
              toast.success(`Assigned ${currentMaterial.name} to ${selectedFaceIds.length} faces`)
            }}
          >
            Assign to Selected Faces ({selectedFaceIds.length})
          </Button>
        )}
      </div>

      {/* Material Selector & New */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-zinc-300">
          <Palette className="h-4 w-4 text-emerald-400" />
          <span>{currentMaterial.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] text-zinc-400 hover:text-emerald-400"
          onClick={() => {
            const newId = createMaterial(`${node.name}_Mat`)
            assignMaterial(node.id, newId, safeSlotIndex)
            toast.success('Created and assigned new material')
          }}
        >
          <Plus className="mr-1 h-3 w-3" /> New
        </Button>
      </div>

      {/* Quick Material Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-400" /> One-Click Presets
        </span>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => applyPreset('matteBlack')}
            className="rounded bg-[#1a1c20] p-1.5 text-center text-[10px] text-zinc-300 border border-white/5 hover:border-emerald-500/50"
          >
            Matte Dark
          </button>
          <button
            onClick={() => applyPreset('whiteCotton')}
            className="rounded bg-[#f8fafc] p-1.5 text-center text-[10px] text-zinc-900 border border-white/5 hover:border-emerald-500/50 font-medium"
          >
            Cotton
          </button>
          <button
            onClick={() => applyPreset('brushedMetal')}
            className="rounded bg-[#c0c5ce] p-1.5 text-center text-[10px] text-zinc-900 border border-white/5 hover:border-emerald-500/50 font-medium"
          >
            Steel
          </button>
          <button
            onClick={() => applyPreset('gold')}
            className="rounded bg-[#f59e0b] p-1.5 text-center text-[10px] text-zinc-950 border border-white/5 hover:border-emerald-500/50 font-medium"
          >
            Gold
          </button>
          <button
            onClick={() => applyPreset('glossyPlastic')}
            className="rounded bg-[#0284c7] p-1.5 text-center text-[10px] text-white border border-white/5 hover:border-emerald-500/50"
          >
            Glossy
          </button>
          <button
            onClick={() => applyPreset('darkFleece')}
            className="rounded bg-[#111827] p-1.5 text-center text-[10px] text-zinc-300 border border-white/5 hover:border-emerald-500/50"
          >
            Fleece
          </button>
          <button
            onClick={() => applyPreset('neonEmerald')}
            className="rounded bg-[#10b981]/20 p-1.5 text-center text-[10px] text-emerald-400 border border-emerald-500/30 hover:border-emerald-500"
          >
            Neon
          </button>
          <button
            onClick={() => applyPreset('glass')}
            className="rounded bg-[#e0f2fe]/20 p-1.5 text-center text-[10px] text-sky-200 border border-white/10 hover:border-sky-400"
          >
            Glass
          </button>
        </div>
      </div>

      {/* Base Color */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-zinc-400">Base Color</label>
        <div className="flex items-center gap-2 rounded bg-[#161a22] p-1.5 border border-white/5">
          <input
            type="color"
            value={currentMaterial.color}
            onChange={(e) => updateMaterial(activeMaterialId, { color: e.target.value })}
            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent"
          />
          <input
            type="text"
            value={currentMaterial.color}
            onChange={(e) => updateMaterial(activeMaterialId, { color: e.target.value })}
            className="w-full bg-transparent font-mono text-xs text-zinc-200 outline-none uppercase"
          />
        </div>
      </div>

      {/* Roughness & Metalness Sliders */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Roughness</span>
            <span className="font-mono text-zinc-300">{currentMaterial.roughness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentMaterial.roughness}
            onChange={(e) => updateMaterial(activeMaterialId, { roughness: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Metallic</span>
            <span className="font-mono text-zinc-300">{currentMaterial.metalness.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentMaterial.metalness}
            onChange={(e) => updateMaterial(activeMaterialId, { metalness: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Opacity</span>
            <span className="font-mono text-zinc-300">{currentMaterial.opacity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.01"
            value={currentMaterial.opacity}
            onChange={(e) => updateMaterial(activeMaterialId, { opacity: parseFloat(e.target.value), transparent: parseFloat(e.target.value) < 1 })}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* Emissive */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-zinc-400">Emissive Glow</label>
        <div className="flex items-center gap-2 rounded bg-[#161a22] p-1.5 border border-white/5">
          <input
            type="color"
            value={currentMaterial.emissive}
            onChange={(e) => updateMaterial(activeMaterialId, { emissive: e.target.value })}
            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent"
          />
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={currentMaterial.emissiveIntensity}
            onChange={(e) =>
              updateMaterial(activeMaterialId, { emissiveIntensity: parseFloat(e.target.value) })
            }
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* Texture Maps Upload */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <span className="text-[11px] font-medium text-zinc-400">Texture Maps</span>

        {/* Albedo Map */}
        <div className="flex items-center justify-between rounded bg-[#161a22] p-2 border border-white/5">
          <div>
            <div className="font-medium text-zinc-200">Base Albedo Map</div>
            <div className="text-[10px] text-zinc-500">
              {hasMap('map') ? 'Texture active' : 'None'}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              ref={albedoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleTextureUpload('map', f)
              }}
            />
            {hasMap('map') ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10"
                onClick={() => updateMaterial(activeMaterialId, { map: null })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] border-white/10 hover:bg-white/5"
                onClick={() => albedoInputRef.current?.click()}
              >
                <Upload className="mr-1 h-3 w-3" /> Upload
              </Button>
            )}
          </div>
        </div>

        {/* Normal Map */}
        <div className="flex items-center justify-between rounded bg-[#161a22] p-2 border border-white/5">
          <div>
            <div className="font-medium text-zinc-200">Normal Map</div>
            <div className="text-[10px] text-zinc-500">
              {hasMap('normalMap') ? 'Normal active' : 'None'}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              ref={normalInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleTextureUpload('normalMap', f)
              }}
            />
            {hasMap('normalMap') ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10"
                onClick={() => updateMaterial(activeMaterialId, { normalMap: null })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[11px] border-white/10 hover:bg-white/5"
                onClick={() => normalInputRef.current?.click()}
              >
                <Upload className="mr-1 h-3 w-3" /> Upload
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Wireframe</span>
          <Switch
            checked={viewMode === 'wireframe'}
            onCheckedChange={(checked) => setViewMode(checked ? 'wireframe' : 'solid')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Double-Sided</span>
          <Switch
            checked={currentMaterial.doubleSided}
            onCheckedChange={(checked) => updateMaterial(activeMaterialId, { doubleSided: checked })}
          />
        </div>
      </div>
    </div>
  )
}

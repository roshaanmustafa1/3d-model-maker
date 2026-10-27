'use client'

import React, { useState } from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import { useEditorStore } from '@/stores/editor-store'
import { DesignZone } from '@/types/customization'
import { resolveTarget } from '@/engine/customization/targets'
import {
  Layers,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function DesignZonePanel() {
  const zones = useCustomizerStore((state) => state.zones)
  const activeZoneId = useCustomizerStore((state) => state.activeZoneId)
  const setActiveZone = useCustomizerStore((state) => state.setActiveZone)
  const addZone = useCustomizerStore((state) => state.addZone)
  const updateZone = useCustomizerStore((state) => state.updateZone)
  const removeZone = useCustomizerStore((state) => state.removeZone)

  const nodes = useEditorStore((state) => state.nodes)
  const meshNodes = Object.values(nodes).filter((n) => n.type === 'mesh')

  const [isAddingZone, setIsAddingZone] = useState(false)
  const [newZoneName, setNewZoneName] = useState('')
  const [selectedMeshId, setSelectedMeshId] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(0)

  const zoneList = Object.values(zones)

  const handleCreateZone = () => {
    if (!newZoneName.trim()) return
    const id = `zone_${Date.now()}_${newZoneName.toLowerCase().replace(/\s+/g, '_')}`
    const targetMesh = nodes[selectedMeshId] || meshNodes[0]
    if (!targetMesh) { toast.error('Load a model before creating a design zone.'); return }
    const target = resolveTarget(useCustomizerStore.getState().activeProductId, targetMesh, selectedSlot)

    const newZone: DesignZone = {
      id,
      name: newZoneName.trim(),
      targetMeshNodeId: selectedMeshId || meshNodes[0]?.id || '',
      targetMeshName: targetMesh?.name || meshNodes[0]?.name,
      materialSlotIndex: selectedSlot,
      uvBounds: target.uvBounds,
      target,
      canvasWidth: 1024,
      canvasHeight: 1024,
      layers: [],
      enabled: true,
    }

    addZone(newZone)
    setActiveZone(id)
    setNewZoneName('')
    setIsAddingZone(false)
    toast.success(`Created design zone "${newZone.name}"`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-emerald-400" />
          Design Zones ({zoneList.length})
        </label>
        <button
          onClick={() => {
            setIsAddingZone(!isAddingZone)
            if (!selectedMeshId && meshNodes.length > 0) {
              setSelectedMeshId(meshNodes[0].id)
            }
          }}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
        >
          <Plus className="h-3 w-3" /> Add Zone
        </button>
      </div>

      {/* Inline Create Zone Form */}
      {isAddingZone && (
        <div className="rounded-md border border-white/10 bg-[#161a22] p-2.5 space-y-2">
          <input
            type="text"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder="Zone Name (e.g. Chest Print)..."
            className="w-full rounded border border-white/10 bg-[#0e1117] px-2 py-1 text-xs text-zinc-100 outline-none focus:border-emerald-500"
          />

          {meshNodes.length > 0 && (
            <select
              value={selectedMeshId}
              onChange={(e) => { setSelectedMeshId(e.target.value); setSelectedSlot(0) }}
              className="w-full rounded border border-white/10 bg-[#0e1117] px-2 py-1 text-xs text-zinc-200 outline-none focus:border-emerald-500"
            >
              {meshNodes.map((mesh) => (
                <option key={mesh.id} value={mesh.id}>
                  Target Mesh: {mesh.name}
                </option>
              ))}
            </select>
          )}

          <select aria-label="Target material slot" value={selectedSlot} onChange={event => setSelectedSlot(Number(event.target.value))} className="w-full rounded border border-white/10 bg-[#0e1117] px-2 py-1 text-xs">
            {(nodes[selectedMeshId]?.materialIds || [nodes[selectedMeshId]?.materialId]).map((id, slot) => <option key={slot} value={slot}>Material slot {slot}: {id || 'default'}</option>)}
          </select>

          <div className="flex justify-end gap-1.5 pt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingZone(false)}
              className="h-6 px-2 text-[11px] text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateZone}
              className="h-6 px-2.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-[11px] font-semibold"
            >
              Save Zone
            </Button>
          </div>
        </div>
      )}

      {/* Zone Buttons Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {zoneList.map((zone) => {
          const isSelected = activeZoneId === zone.id
          return (
            <div
              key={zone.id}
              onClick={() => setActiveZone(zone.id)}
              className={`group flex items-center justify-between rounded p-2 text-xs transition-colors cursor-pointer border ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                  : 'border-white/5 bg-[#161a22] text-zinc-300 hover:border-white/15 hover:bg-[#1a202c]'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="truncate">{zone.name}</span>
                {zone.layers.length > 0 && (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] font-mono text-zinc-400">
                    {zone.layers.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateZone(zone.id, { enabled: !zone.enabled })
                  }}
                  className="text-zinc-400 hover:text-white p-0.5"
                  title={zone.enabled ? 'Disable zone' : 'Enable zone'}
                >
                  {zone.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-zinc-600" />}
                </button>
                {zoneList.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeZone(zone.id)
                    }}
                    className="text-zinc-500 hover:text-red-400 p-0.5"
                    title="Delete zone"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

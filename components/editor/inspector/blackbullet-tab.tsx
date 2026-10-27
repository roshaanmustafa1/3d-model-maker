'use client'

import React from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { CustomizableZone } from '@/types/scene'
import { ShieldCheck, Tag, CheckCircle2, AlertCircle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const standardZones: { id: CustomizableZone; label: string }[] = [
  { id: 'body_front', label: 'Front Panel (Chest / Abdomen)' },
  { id: 'body_back', label: 'Back Panel' },
  { id: 'sleeve_left', label: 'Left Sleeve' },
  { id: 'sleeve_right', label: 'Right Sleeve' },
  { id: 'hood', label: 'Hood Surface' },
  { id: 'pocket_front', label: 'Front Kangaroo Pocket' },
  { id: 'collar', label: 'Neck / Collar' },
  { id: 'cuff_left', label: 'Left Cuff' },
  { id: 'cuff_right', label: 'Right Cuff' },
  { id: 'custom', label: 'Custom Zone' },
]

const semanticPresets = [
  { name: 'HoodieRoot', isGroup: true },
  { name: 'Body_Main', zone: 'body_front' as CustomizableZone },
  { name: 'Sleeve_Left', zone: 'sleeve_left' as CustomizableZone },
  { name: 'Sleeve_Right', zone: 'sleeve_right' as CustomizableZone },
  { name: 'Hood', zone: 'hood' as CustomizableZone },
  { name: 'Pocket_Front', zone: 'pocket_front' as CustomizableZone },
  { name: 'Cuff_Left', zone: 'cuff_left' as CustomizableZone },
  { name: 'Cuff_Right', zone: 'cuff_right' as CustomizableZone },
]

export function BlackBulletTab() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const updateNode = useEditorStore((state) => state.updateNode)
  const renameNode = useEditorStore((state) => state.renameNode)

  if (!node) return null

  const isCustomizable = node.isCustomizable ?? false
  const hasUVs = node.geometry?.stats.hasUVs ?? false
  const hasNormals = node.geometry?.stats.hasNormals ?? false
  const scaleValid = !node.transform.scale.some((s) => s <= 0)

  const handleCustomizableToggle = (checked: boolean) => {
    updateNode(node.id, {
      isCustomizable: checked,
      customizableZone: checked ? (node.customizableZone || 'body_front') : undefined,
    })
    toast.success(`${node.name} marked as ${checked ? 'customizable' : 'static'}`)
  }

  const handleZoneSelect = (zone: CustomizableZone) => {
    updateNode(node.id, {
      customizableZone: zone,
      isCustomizable: true,
    })
    toast.success(`Assigned zone ${zone} to ${node.name}`)
  }

  const applySemanticPreset = (preset: typeof semanticPresets[0]) => {
    renameNode(node.id, preset.name)
    if (preset.zone) {
      updateNode(node.id, {
        customizableZone: preset.zone,
        isCustomizable: true,
        semanticTag: preset.name,
      })
    }
    toast.success(`Applied semantic role "${preset.name}"`)
  }

  return (
    <div className="space-y-4 text-xs">
      {/* BlackBullet Header info */}
      <div className="rounded border border-emerald-500/20 bg-emerald-950/20 p-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-emerald-200">BlackBullet Compatibility</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
          Configure customizable design surfaces and semantic hierarchy for the BlackBullet 3D product customizer.
        </p>
      </div>

      {/* Customizable Toggle */}
      <div className="flex items-center justify-between rounded bg-[#161a22] p-2.5 border border-white/5">
        <div>
          <div className="font-medium text-zinc-200">Customizable Mesh</div>
          <div className="text-[10px] text-zinc-500">Allow users to apply artwork / colors to this part</div>
        </div>
        <Switch checked={isCustomizable} onCheckedChange={handleCustomizableToggle} />
      </div>

      {/* Zone Selector */}
      {isCustomizable && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-zinc-400">Design Placement Zone</label>
          <Select
            value={node.customizableZone || 'body_front'}
            onValueChange={(val) => handleZoneSelect(val as CustomizableZone)}
          >
            <SelectTrigger className="w-full bg-[#161a22] border-white/10 text-xs text-zinc-200">
              <SelectValue placeholder="Select surface zone" />
            </SelectTrigger>
            <SelectContent className="bg-[#161a22] border-white/10 text-zinc-200 text-xs">
              {standardZones.map((z) => (
                <SelectItem key={z.id} value={z.id} className="text-xs">
                  {z.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Semantic Naming Suggestions */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
          <Tag className="h-3 w-3 text-emerald-400" /> Standard Apparel Roles
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {semanticPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applySemanticPreset(preset)}
              className="flex items-center justify-between rounded bg-[#161a22] px-2 py-1.5 text-left text-[11px] text-zinc-300 border border-white/5 hover:border-emerald-500/50 hover:text-white"
            >
              <span>{preset.name}</span>
              <span className="text-[9px] text-zinc-500 font-mono">Apply</span>
            </button>
          ))}
        </div>
      </div>

      {/* Component Readiness Checklist */}
      <div className="rounded border border-white/5 bg-[#161a22] p-2.5 space-y-1.5">
        <span className="text-[11px] font-medium text-zinc-400">Component Readiness</span>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">UV Map Present:</span>
            {hasUVs ? (
              <span className="text-emerald-400 flex items-center text-[10px]">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Ready
              </span>
            ) : (
              <span className="text-amber-400 flex items-center text-[10px]">
                <AlertCircle className="mr-1 h-3 w-3" /> Required for Decals
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Normals Calculated:</span>
            {hasNormals ? (
              <span className="text-emerald-400 flex items-center text-[10px]">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Valid
              </span>
            ) : (
              <span className="text-red-400 flex items-center text-[10px]">
                <AlertCircle className="mr-1 h-3 w-3" /> Missing
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Scale Normalization:</span>
            {scaleValid ? (
              <span className="text-emerald-400 flex items-center text-[10px]">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Positive (1.0x)
              </span>
            ) : (
              <span className="text-red-400 flex items-center text-[10px]">
                <AlertCircle className="mr-1 h-3 w-3" /> Negative Scale
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

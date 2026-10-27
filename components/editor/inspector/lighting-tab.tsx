'use client'

import React from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { Sun, Grid, Shield, Lightbulb } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

export function LightingTab() {
  const env = useEditorStore((state) => state.environment)
  const updateEnvironment = useEditorStore((state) => state.updateEnvironment)

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center gap-2 rounded border border-white/5 bg-[#161a22] p-2.5">
        <Sun className="h-4 w-4 text-amber-400" />
        <span className="font-semibold text-zinc-200">Studio Lighting & Stage</span>
      </div>

      {/* Light Intensities */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Directional Key Light</span>
            <span className="font-mono text-zinc-300">{env.directionalIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={env.directionalIntensity}
            onChange={(e) => updateEnvironment({ directionalIntensity: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Ambient Fill Light</span>
            <span className="font-mono text-zinc-300">{env.ambientIntensity.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={env.ambientIntensity}
            onChange={(e) => updateEnvironment({ ambientIntensity: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* Stage Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-300">Ground Contact Shadows</span>
          </div>
          <Switch
            checked={env.shadows}
            onCheckedChange={(checked) => updateEnvironment({ shadows: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-300">Ground Reference Grid</span>
          </div>
          <Switch
            checked={env.grid}
            onCheckedChange={(checked) => updateEnvironment({ grid: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-300">Coordinate Axes Helper</span>
          </div>
          <Switch
            checked={env.axes}
            onCheckedChange={(checked) => updateEnvironment({ axes: checked })}
          />
        </div>
      </div>
    </div>
  )
}

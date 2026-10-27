'use client'

import React from 'react'
import {
  ProductCategory,
  GenerationSettings as SettingsType,
  ProviderCapabilities,
  GeometryQuality,
} from '@/types/ai-generator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { AlertCircle, CheckCircle2, Cpu, Sparkles, Layers, DollarSign } from 'lucide-react'

interface GenerationSettingsProps {
  providers: ProviderCapabilities[]
  selectedProviderId: string
  onProviderChange: (id: string) => void
  settings: SettingsType
  onSettingsChange: (settings: SettingsType) => void
  prompt: string
  onPromptChange: (prompt: string) => void
  disabled?: boolean
}

export function GenerationSettings({
  providers,
  selectedProviderId,
  onProviderChange,
  settings,
  onSettingsChange,
  prompt,
  onPromptChange,
  disabled,
}: GenerationSettingsProps) {
  const currentProvider = providers.find((p) => p.id === selectedProviderId)

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          3D Generation Provider
        </label>
        <Select
          value={selectedProviderId}
          onValueChange={(val) => {
            if (val) onProviderChange(val)
          }}
          disabled={disabled}
        >
          <SelectTrigger className="bg-[#161a22] border-white/10 text-xs text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#161a22] border-white/10 text-zinc-200 text-xs">
            {providers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span>{p.name}</span>
                  {p.isConfigured ? (
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">Active</span>
                  ) : (
                    <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1 rounded">Key Required</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentProvider && (
          <div className="rounded border border-white/5 bg-[#14171f] p-2 space-y-1 text-[10px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1">
                {currentProvider.isConfigured ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-amber-400" />
                )}
                {currentProvider.configurationNotice}
              </span>
            </div>
            {currentProvider.estimatedCostNotice && (
              <p className="text-zinc-500 italic">• {currentProvider.estimatedCostNotice}</p>
            )}
          </div>
        )}
      </div>

      {/* Product Category */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Product Category
        </label>
        <Select
          value={settings.category}
          onValueChange={(cat) => {
            if (cat) onSettingsChange({ ...settings, category: cat as ProductCategory })
          }}
          disabled={disabled}
        >
          <SelectTrigger className="bg-[#161a22] border-white/10 text-xs text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#161a22] border-white/10 text-zinc-200 text-xs">
            <SelectItem value="apparel">Apparel & Garments (Hoodie, T-Shirt, Jacket)</SelectItem>
            <SelectItem value="footwear">Footwear & Sneakers</SelectItem>
            <SelectItem value="hardgoods">Hardgoods & Electronics</SelectItem>
            <SelectItem value="packaging">Boxes, Bottles & Packaging</SelectItem>
            <SelectItem value="furniture">Furniture & Decor</SelectItem>
            <SelectItem value="accessories">Jewellery & Accessories</SelectItem>
            <SelectItem value="other">Custom / Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description / Prompt */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Product Details & Style Prompt
        </label>
        <textarea
          rows={2}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g. Heavyweight oversized streetwear pullover hoodie with kangaroo pocket..."
          className="w-full rounded border border-white/10 bg-[#161a22] p-2 text-xs text-zinc-200 outline-none focus:border-emerald-500"
        />
      </div>

      {/* Real-World Dimensions */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Dimensions (cm)
          </label>
          <span className="text-[10px] text-zinc-500">Target Real-World Scale</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[9px] text-zinc-500 font-mono">WIDTH</span>
            <input
              type="number"
              disabled={disabled}
              value={settings.dimensions?.width ?? 65}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  dimensions: {
                    ...settings.dimensions,
                    width: parseFloat(e.target.value) || 0,
                    unit: 'cm',
                  },
                })
              }
              className="w-full rounded border border-white/10 bg-[#161a22] p-1.5 text-center font-mono text-xs text-zinc-200"
            />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-mono">HEIGHT</span>
            <input
              type="number"
              disabled={disabled}
              value={settings.dimensions?.height ?? 75}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  dimensions: {
                    ...settings.dimensions,
                    height: parseFloat(e.target.value) || 0,
                    unit: 'cm',
                  },
                })
              }
              className="w-full rounded border border-white/10 bg-[#161a22] p-1.5 text-center font-mono text-xs text-zinc-200"
            />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 font-mono">DEPTH</span>
            <input
              type="number"
              disabled={disabled}
              value={settings.dimensions?.depth ?? 35}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  dimensions: {
                    ...settings.dimensions,
                    depth: parseFloat(e.target.value) || 0,
                    unit: 'cm',
                  },
                })
              }
              className="w-full rounded border border-white/10 bg-[#161a22] p-1.5 text-center font-mono text-xs text-zinc-200"
            />
          </div>
        </div>
      </div>

      {/* Geometry Quality & Toggles */}
      <div className="space-y-3 pt-1 border-t border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-zinc-300">Reconstruction Quality</label>
          <div className="flex gap-1">
            {(['draft', 'standard', 'high'] as GeometryQuality[]).map((q) => (
              <button
                key={q}
                type="button"
                disabled={disabled}
                onClick={() => onSettingsChange({ ...settings, geometryQuality: q })}
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                  settings.geometryQuality === q
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-[#161a22] text-zinc-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* PBR Maps Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-300">PBR Materials</span>
            <p className="text-[10px] text-zinc-500">Generate roughness, metallic & normal maps</p>
          </div>
          <Switch
            checked={settings.enablePbr}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, enablePbr: checked })}
            disabled={disabled}
          />
        </div>

        {/* Remesh Toggle & Polycount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-300">Topology Remeshing</span>
              <p className="text-[10px] text-zinc-500">Optimize triangle flow for web rendering</p>
            </div>
            <Switch
              checked={settings.shouldRemesh}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, shouldRemesh: checked })}
              disabled={disabled}
            />
          </div>

          {settings.shouldRemesh && (
            <div className="rounded bg-[#161a22] p-2 space-y-1.5 border border-white/5">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Target Polygon Budget</span>
                <span className="font-mono text-emerald-400">
                  {(settings.targetPolycount || 45000).toLocaleString()} tris
                </span>
              </div>
              <Slider
                min={5000}
                max={150000}
                step={5000}
                value={[settings.targetPolycount || 45000]}
                onValueChange={(val: any) => {
                  const num = Array.isArray(val) ? val[0] : val
                  onSettingsChange({ ...settings, targetPolycount: num })
                }}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


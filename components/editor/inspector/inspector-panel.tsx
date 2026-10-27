'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import {
  Move,
  Box,
  Palette,
  ShieldCheck,
  Map,
  Sun,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
} from 'lucide-react'
import { TransformTab } from './transform-tab'
import { GeometryTab } from './geometry-tab'
import { MaterialTab } from './material-tab'
import { BlackBulletTab } from './blackbullet-tab'
import { UVTab } from './uv-tab'
import { LightingTab } from './lighting-tab'
import { Button } from '@/components/ui/button'

type InspectorTabType = 'transform' | 'geometry' | 'material' | 'blackbullet' | 'uv' | 'lighting'

export function InspectorPanel() {
  const [activeTab, setActiveTab] = useState<InspectorTabType>('transform')

  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const toggleNodeVisibility = useEditorStore((state) => state.toggleNodeVisibility)
  const toggleNodeLock = useEditorStore((state) => state.toggleNodeLock)
  const deleteNode = useEditorStore((state) => state.deleteNode)
  const duplicateNode = useEditorStore((state) => state.duplicateNode)
  const renameNode = useEditorStore((state) => state.renameNode)

  return (
    <div className="flex h-full flex-col bg-[#111318] border-l border-white/10 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Inspector</span>
        {node && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
              onClick={() => duplicateNode(node.id)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
              onClick={() => toggleNodeLock(node.id)}
            >
              {node.locked ? (
                <Lock className="h-3 w-3 text-amber-400" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-100"
              onClick={() => toggleNodeVisibility(node.id)}
            >
              {node.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-zinc-600" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-zinc-400 hover:text-red-400"
              onClick={() => deleteNode(node.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {node ? (
        <>
          {/* Object Name Bar */}
          <div className="border-b border-white/5 bg-[#14171f] px-3 py-2 flex items-center justify-between">
            <input
              type="text"
              value={node.name}
              onChange={(e) => renameNode(node.id, e.target.value)}
              className="w-full bg-transparent font-medium text-xs text-zinc-100 outline-none focus:border-b focus:border-emerald-500"
            />
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] uppercase font-mono text-zinc-400">
              {node.type}
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 bg-[#0e1015]">
            <button
              onClick={() => setActiveTab('transform')}
              className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors flex items-center justify-center gap-1 border-b-2 ${
                activeTab === 'transform'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Move className="h-3 w-3" /> Trans
            </button>
            <button
              onClick={() => setActiveTab('geometry')}
              className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors flex items-center justify-center gap-1 border-b-2 ${
                activeTab === 'geometry'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Box className="h-3 w-3" /> Geom
            </button>
            <button
              onClick={() => setActiveTab('material')}
              className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors flex items-center justify-center gap-1 border-b-2 ${
                activeTab === 'material'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="h-3 w-3" /> Mat
            </button>
            <button
              onClick={() => setActiveTab('blackbullet')}
              className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors flex items-center justify-center gap-1 border-b-2 ${
                activeTab === 'blackbullet'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="h-3 w-3" /> BB
            </button>
            <button
              onClick={() => setActiveTab('uv')}
              className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors flex items-center justify-center gap-1 border-b-2 ${
                activeTab === 'uv'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Map className="h-3 w-3" /> UV
            </button>
            <button
              onClick={() => setActiveTab('lighting')}
              className={`flex-1 py-2 text-center text-[10px] font-medium transition-colors flex items-center justify-center gap-1 border-b-2 ${
                activeTab === 'lighting'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun className="h-3 w-3" /> Light
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'transform' && <TransformTab />}
            {activeTab === 'geometry' && <GeometryTab />}
            {activeTab === 'material' && <MaterialTab />}
            {activeTab === 'blackbullet' && <BlackBulletTab />}
            {activeTab === 'uv' && <UVTab />}
            {activeTab === 'lighting' && <LightingTab />}
          </div>
        </>
      ) : (
        /* Empty selection state: show scene lighting */
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="rounded-lg border border-white/5 bg-[#14171e] p-4 text-center">
            <Box className="mx-auto h-6 w-6 text-zinc-600 mb-2" />
            <div className="text-xs font-medium text-zinc-300">No Object Selected</div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Click an object in the viewport or scene explorer to inspect its transform, mesh, and materials.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-semibold uppercase text-zinc-400">Environment Lighting</span>
            <div className="mt-2">
              <LightingTab />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

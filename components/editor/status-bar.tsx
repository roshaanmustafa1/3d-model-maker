'use client'

import React from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import { Activity, Box, Layers, Palette, Save, Check } from 'lucide-react'

export function StatusBar() {
  const stats = useEditorStore((state) => state.stats)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const selectedNode = useEditorStore((state) =>
    selectedNodeId ? state.nodes[selectedNodeId] : null
  )
  const isDirty = useProjectStore((state) => state.isDirty)
  const lastSavedAt = useProjectStore((state) => state.lastSavedAt)

  return (
    <footer className="flex h-7 items-center justify-between border-t border-white/10 bg-[#0e1014] px-3 text-[11px] text-zinc-400 select-none">
      {/* Left side: Selection info & Save status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>{selectedNode ? selectedNode.name : 'No selection'}</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1 text-zinc-500">
          {isDirty ? (
            <span className="flex items-center text-amber-400 gap-1">
              <Save className="h-3 w-3" /> Unsaved changes
            </span>
          ) : (
            <span className="flex items-center text-zinc-500 gap-1">
              <Check className="h-3 w-3 text-emerald-500" />{' '}
              {lastSavedAt ? `Saved at ${lastSavedAt}` : 'Saved'}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Real calculated stats & FPS */}
      <div className="flex items-center gap-3 font-mono">
        <div className="flex items-center gap-1" title="Total Scene Vertices">
          <span className="text-zinc-500">Verts:</span>
          <span className="text-zinc-200">{stats.totalVertices.toLocaleString()}</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1" title="Total Scene Triangles / Polygons">
          <span className="text-zinc-500">Tris:</span>
          <span className="text-zinc-200">{stats.totalTriangles.toLocaleString()}</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1" title="Total Mesh Objects">
          <Box className="h-3 w-3 text-zinc-500" />
          <span className="text-zinc-200">{stats.meshCount}</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        <div className="flex items-center gap-1" title="Total PBR Materials">
          <Palette className="h-3 w-3 text-zinc-500" />
          <span className="text-zinc-200">{stats.materialCount}</span>
        </div>

        <div className="h-3 w-px bg-white/10" />

        {/* Real Smoothed FPS */}
        <div className="flex items-center gap-1 font-semibold text-emerald-400" title="Render Viewport FPS">
          <Activity className="h-3 w-3" />
          <span>{stats.fps} FPS</span>
        </div>
      </div>
    </footer>
  )
}

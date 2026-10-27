'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import {
  Map,
  Download,
  ArrowLeft,
  Layers,
  Box,
  RotateCw,
  Move,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBufferGeometry, getCustomGeometry } from '@/engine/scene/primitive-factory'
import { getTopologyForNode } from '@/engine/topology/topology-cache'
import { detectUvIslands } from '@/engine/topology/uv-unwrapper'
import saveAs from 'file-saver'
import { toast } from 'sonner'
import { UVPreparationTools } from '@/components/editor/inspector/uv-preparation-tools'
import { UVTargetSelector } from './uv-target-selector'

export function UVInspectorView() {
  const setActiveWorkspace = useEditorStore((state) => state.setActiveWorkspace)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const nodes = useEditorStore((state) => state.nodes)
  const materials = useEditorStore((state) => state.materials)
  const applyUVProjection = useEditorStore((state) => state.applyUVProjection)
  const transformSelectedUVs = useEditorStore((state) => state.transformSelectedUVs)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showTextureOverlay, setShowTextureOverlay] = useState(true)
  const [selectedIslandId, setSelectedIslandId] = useState<number | null>(null)

  const node = selectedNodeId ? nodes[selectedNodeId] : null
  const material = node?.materialId ? materials[node.materialId] : null

  // Resolve current active BufferGeometry
  const geom = useMemo(() => {
    if (!node || node.type !== 'mesh' || !node.geometry) return null
    return node.geometry.type === 'custom' && node.geometry.customGeometryKey
      ? getCustomGeometry(node.geometry.customGeometryKey)
      : createBufferGeometry(node.geometry.type, node.geometry.params)
  }, [node])

  // Topological UV Islands analysis
  const uvIslands = useMemo(() => {
    if (!node || !geom) return []
    try {
      const graph = getTopologyForNode(node.id, geom)
      return detectUvIslands(graph)
    } catch {
      return []
    }
  }, [node, geom])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Background
    ctx.fillStyle = '#0a0c10'
    ctx.fillRect(0, 0, width, height)

    // Render applied material texture if present & toggled
    if (showTextureOverlay && material?.map) {
      const img = new Image()
      img.src = material.map
      if (img.complete) {
        ctx.drawImage(img, 0, 0, width, height)
        drawUVWireframe(ctx, width, height)
      } else {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          drawUVWireframe(ctx, width, height)
        }
      }
    } else {
      drawUVWireframe(ctx, width, height)
    }
  }, [node, showTextureOverlay, material?.map, geom])

  const drawUVWireframe = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 2D UV Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
    ctx.lineWidth = 1
    const gridSize = 64
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    if (!geom || !geom.attributes.uv) return

    const uv = geom.attributes.uv
    const index = geom.index
    const numTriangles = index ? index.count / 3 : uv.count / 3

    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 1.2
    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'

    for (let i = 0; i < numTriangles; i++) {
      const i0 = index ? index.getX(i * 3) : i * 3
      const i1 = index ? index.getX(i * 3 + 1) : i * 3 + 1
      const i2 = index ? index.getX(i * 3 + 2) : i * 3 + 2

      const u0 = uv.getX(i0) * width
      const v0 = (1 - uv.getY(i0)) * height
      const u1 = uv.getX(i1) * width
      const v1 = (1 - uv.getY(i1)) * height
      const u2 = uv.getX(i2) * width
      const v2 = (1 - uv.getY(i2)) * height

      ctx.beginPath()
      ctx.moveTo(u0, v0)
      ctx.lineTo(u1, v1)
      ctx.lineTo(u2, v2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }

  const handleExportUV = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${node?.name || 'mesh'}_UV_Layout.png`)
        toast.success('Exported high-resolution UV layout PNG')
      }
    })
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#0d0f14] text-zinc-100 select-none">
      {/* Header Bar */}
      <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#12151b] px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveWorkspace('editor')}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to 3D Studio
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold">Professional UV Editor & Unwrapping Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTextureOverlay(!showTextureOverlay)}
            className="h-7 border-white/10 bg-[#161a22] text-xs text-zinc-300 hover:bg-white/5"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
            {showTextureOverlay ? 'Hide Texture' : 'Show Texture'}
          </Button>
          <Button
            size="sm"
            onClick={handleExportUV}
            className="h-7 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export UV PNG
          </Button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar / UV Projection & Transforms */}
        <div className="w-80 border-r border-white/10 bg-[#12151b] p-4 flex flex-col gap-4 overflow-y-auto">
          <UVTargetSelector />
          <UVPreparationTools />
          {/* Target Mesh Summary */}
          <div className="rounded border border-white/5 bg-[#161a22] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Target Mesh:</span>
              <span className="font-semibold text-zinc-200">{node?.name || 'None'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">UV Coordinates:</span>
              {node?.geometry?.stats.hasUVs ? (
                <span className="inline-flex items-center text-emerald-400 font-medium">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Ready (Channel 0)
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-400 font-medium">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Missing UVs
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Detected UV Islands:</span>
              <span className="font-mono text-zinc-200">{uvIslands.length}</span>
            </div>
          </div>

          {/* UV Unwrapping Projections */}
          <div className="rounded border border-white/5 bg-[#161a22] p-3 space-y-2.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Projection Unwrapping
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start text-xs border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-white/5"
                onClick={() => {
                  applyUVProjection('box')
                  toast.success('Applied automatic Box Projection')
                }}
              >
                <Box className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                Box Projection (All Sides)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start text-xs border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-white/5"
                onClick={() => {
                  applyUVProjection('planar', 'y')
                  toast.success('Applied Top/Bottom Planar Projection (Y-Axis)')
                }}
              >
                <Compass className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                Planar Projection (Top / Y-Axis)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start text-xs border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-white/5"
                onClick={() => {
                  applyUVProjection('planar', 'z')
                  toast.success('Applied Front/Back Planar Projection (Z-Axis)')
                }}
              >
                <Compass className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                Planar Projection (Front / Z-Axis)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 justify-start text-xs border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-white/5"
                onClick={() => {
                  applyUVProjection('cylindrical', 'y')
                  toast.success('Applied Cylindrical Projection (Y-Axis)')
                }}
              >
                <RotateCw className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                Cylindrical Projection (Sleeves / Body)
              </Button>
            </div>
          </div>

          {/* UV Transformations */}
          <div className="rounded border border-white/5 bg-[#161a22] p-3 space-y-2.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              UV Transforms & Layout
            </span>
            {/* Pan / Move */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400">Pan UVs (±0.05)</span>
              <div className="grid grid-cols-4 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(-0.05, 0)}
                >
                  ← U
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(0.05, 0)}
                >
                  U →
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(0, 0.05)}
                >
                  ↑ V
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(0, -0.05)}
                >
                  ↓ V
                </Button>
              </div>
            </div>

            {/* Scale UVs */}
            <div className="space-y-1 pt-1 border-t border-white/5">
              <span className="text-[10px] text-zinc-400">Scale UVs</span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(0, 0, 1.1, 1.1)}
                >
                  <Maximize2 className="mr-1 h-3 w-3" /> 1.1x Larger
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(0, 0, 0.9, 0.9)}
                >
                  <Minimize2 className="mr-1 h-3 w-3" /> 0.9x Smaller
                </Button>
              </div>
            </div>

            {/* Rotate UVs */}
            <div className="space-y-1 pt-1 border-t border-white/5">
              <span className="text-[10px] text-zinc-400">Rotate UVs</span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(0, 0, 1, 1, 90)}
                >
                  <RotateCw className="mr-1 h-3 w-3" /> +90° CW
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] border-white/10 bg-zinc-900/60 hover:bg-white/5"
                  onClick={() => transformSelectedUVs(0, 0, 1, 1, -90)}
                >
                  <RotateCw className="mr-1 h-3 w-3 -scale-x-100" /> -90° CCW
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Center 2D UV Canvas Viewer */}
        <div className="flex flex-1 items-center justify-center p-6 overflow-hidden bg-[#0a0c10]">
          <div className="flex flex-col items-center gap-3">
            <div className="relative rounded-xl border border-white/15 bg-[#12151b] p-2 shadow-2xl">
              <canvas
                ref={canvasRef}
                width={700}
                height={700}
                className="rounded-lg border border-white/5 bg-[#0a0c10]"
              />
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>
                Coordinates: <strong className="text-zinc-200">[0.0, 1.0] Normalized Space</strong>
              </span>
              <span>•</span>
              <span>
                Texture: <strong className="text-zinc-200">{material?.map ? 'Active Map' : 'None'}</strong>
              </span>
              <span>•</span>
              <span>
                Canvas: <strong className="text-zinc-200 font-mono">700 × 700 px</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

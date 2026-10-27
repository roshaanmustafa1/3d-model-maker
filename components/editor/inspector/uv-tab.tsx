'use client'

import React from 'react'
import * as THREE from 'three'
import { useEditorStore } from '@/stores/editor-store'
import { Map, Download, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCustomGeometry, createBufferGeometry, calculateGeometryStats } from '@/engine/scene/primitive-factory'
import { getTopologyForNode } from '@/engine/topology/topology-cache'
import { inspectUVDiagnostics } from '@/engine/topology/uv-unwrapper'
import { toast } from 'sonner'
import saveAs from 'file-saver'
import { UVPreparationTools } from './uv-preparation-tools'

export function UVTab() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const updateNode = useEditorStore((state) => state.updateNode)
  const setActiveWorkspace = useEditorStore((state) => state.setActiveWorkspace)

  const hasUVs = node?.geometry?.stats.hasUVs

  const geom = React.useMemo(() => {
    if (!node || node.type !== 'mesh' || !node.geometry) return null
    return createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)
  }, [node?.type, node?.geometry?.type, node?.geometry?.params, node?.geometry?.customGeometryKey])

  const uvDiag = React.useMemo(() => {
    if (!node || !geom) return null
    try {
      const graph = getTopologyForNode(node.id, geom)
      return inspectUVDiagnostics(graph, geom, node.isCustomizable)
    } catch {
      return null
    }
  }, [node, geom])

  if (!node || node.type !== 'mesh' || !node.geometry) return <div className="py-6 text-center text-xs text-zinc-500">Select a mesh object to view UV mapping.</div>

  const handleGenerateBoxUVs = () => {
    useEditorStore.getState().applyUVProjection('box')
    toast.success('Generated box UVs. Inspect overlaps before customization.')
  }

  const handleExportUVLayout = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#0d0f14'
    ctx.fillRect(0, 0, 1024, 1024)

    // Grid
    ctx.strokeStyle = '#1e2430'
    ctx.lineWidth = 1
    for (let i = 0; i < 1024; i += 64) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 1024)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(1024, i)
      ctx.stroke()
    }

    // Draw UV triangles
    let geom = node.geometry?.type === 'custom' && node.geometry?.customGeometryKey
      ? getCustomGeometry(node.geometry.customGeometryKey)
      : createBufferGeometry(node.geometry!.type, node.geometry!.params)

    if (geom && geom.attributes.uv) {
      const uv = geom.attributes.uv
      const index = geom.index

      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 1.2

      const numTriangles = index ? index.count / 3 : uv.count / 3

      for (let i = 0; i < numTriangles; i++) {
        const i0 = index ? index.getX(i * 3) : i * 3
        const i1 = index ? index.getX(i * 3 + 1) : i * 3 + 1
        const i2 = index ? index.getX(i * 3 + 2) : i * 3 + 2

        const u0 = uv.getX(i0) * 1024
        const v0 = (1 - uv.getY(i0)) * 1024
        const u1 = uv.getX(i1) * 1024
        const v1 = (1 - uv.getY(i1)) * 1024
        const u2 = uv.getX(i2) * 1024
        const v2 = (1 - uv.getY(i2)) * 1024

        ctx.beginPath()
        ctx.moveTo(u0, v0)
        ctx.lineTo(u1, v1)
        ctx.lineTo(u2, v2)
        ctx.closePath()
        ctx.stroke()
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${node.name}_UV_Layout.png`)
        toast.success(`Exported UV layout for ${node.name}`)
      }
    })
  }

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center gap-2 rounded border border-white/5 bg-[#161a22] p-2.5">
        <Map className="h-4 w-4 text-emerald-400" />
        <span className="font-semibold text-zinc-200">UV Coordinates</span>
      </div>

      <div className="rounded border border-white/5 bg-[#161a22] p-3 space-y-2.5">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          UV Channel Diagnostics
        </span>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">UV Coordinates:</span>
            {uvDiag?.hasUVs ? (
              <span className="inline-flex items-center text-emerald-400 font-medium">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Present & Active
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-400 font-medium">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Coordinate Validity:</span>
            {uvDiag?.isValid ? (
              <span className="inline-flex items-center text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> 100% Finite Values
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-400 font-mono text-[10px]">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Non-Finite UVs
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500">UV Islands:</span>
            <span className="font-mono text-zinc-200">
              {uvDiag?.islandCount ?? 0} Connected Charts
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Seam Information:</span>
            <span className="font-mono text-zinc-300">
              {uvDiag?.hasBoundarySeams ? 'Boundary Chart Seams' : 'Uncut Continuous UV'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Overlap Diagnostics:</span>
            {uvDiag?.overlapDetected ? (
              <span className="text-amber-400 font-mono text-[10px]">Overlapping Charts</span>
            ) : (
              <span className="text-emerald-400 font-mono text-[10px]">Clean / No Major Overlap</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-zinc-400 font-medium">UV Readiness:</span>
            {uvDiag?.customizableZoneReady ? (
              <span className="inline-flex items-center text-emerald-400 font-semibold text-[10px]">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Ready for Customizer
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-400 text-[10px]">
                {uvDiag?.overlapDetected ? 'Resolve UV overlaps' : uvDiag?.hasUVs && uvDiag.isValid ? 'Define a customization zone' : 'Requires UV preparation'}
              </span>
            )}
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 leading-relaxed pt-1">
          {uvDiag?.summary}
        </p>
      </div>

      {/* Actions */}
      <UVPreparationTools />
      <div className="space-y-2">
        {!hasUVs && (
          <Button
            size="sm"
            onClick={handleGenerateBoxUVs}
            className="w-full h-8 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-medium"
          >
            Auto-Generate Box UVs
          </Button>
        )}

        {hasUVs && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportUVLayout}
            className="w-full h-8 border-white/10 bg-[#161a22] text-zinc-200 hover:bg-white/5 text-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
            Export UV Layout Image (PNG)
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveWorkspace('uv')}
          className="w-full h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs"
        >
          Open in UV Lab <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

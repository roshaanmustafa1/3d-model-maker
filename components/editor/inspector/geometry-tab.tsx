'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useEditorStore } from '@/stores/editor-store'
import {
  Box,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FlipVertical,
  Pencil,
  CircleDot,
  Slash,
  Square,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  createBufferGeometry,
  calculateGeometryStats,
  getCustomGeometry,
  registerCustomGeometry,
} from '@/engine/scene/primitive-factory'
import { getTopologyForNode } from '@/engine/topology/topology-cache'
import { getTopologyStats } from '@/engine/topology/topology-graph'
import { toast } from 'sonner'
import { MeshPreparationTools } from './mesh-preparation-tools'

export function GeometryTab() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const updateNode = useEditorStore((state) => state.updateNode)
  const recalculateSceneStats = useEditorStore((state) => state.recalculateSceneStats)
  const diagnosticOverlay = useEditorStore((state) => state.diagnosticOverlay)
  const setDiagnosticOverlay = useEditorStore((state) => state.setDiagnosticOverlay)
  const safeRepairMesh = useEditorStore((state) => state.safeRepairMesh)

  const editorMode = useEditorStore((state) => state.editorMode)
  const toggleEditorMode = useEditorStore((state) => state.toggleEditorMode)
  const selectionSubMode = useEditorStore((state) => state.selectionSubMode)
  const setSelectionSubMode = useEditorStore((state) => state.setSelectionSubMode)
  const selectedVertexIds = useEditorStore((state) => state.selectedVertexIds)
  const selectedEdgeIds = useEditorStore((state) => state.selectedEdgeIds)
  const selectedFaceIds = useEditorStore((state) => state.selectedFaceIds)

  // Active Three.js BufferGeometry
  const geom = useMemo(() => {
    if (!node || node.type !== 'mesh' || !node.geometry) return null
    return createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)
  }, [node?.type, node?.geometry?.type, node?.geometry?.params, node?.geometry?.customGeometryKey])

  // Topological Graph & Detailed Metrics
  const topologyStats = useMemo(() => {
    if (!node || !geom) return null
    try {
      const graph = getTopologyForNode(node.id, geom)
      return getTopologyStats(graph)
    } catch {
      return null
    }
  }, [node, geom])

  if (!node || node.type !== 'mesh' || !node.geometry) {
    return (
      <div className="py-6 text-center text-xs text-zinc-500">
        Selected object is a group or has no mesh geometry.
      </div>
    )
  }

  const { type, params, stats } = node.geometry

  const handleParamChange = (paramKey: string, value: number) => {
    const updatedParams = { ...params, [paramKey]: value }
    const updatedGeom = createBufferGeometry(type, updatedParams)
    const newStats = calculateGeometryStats(updatedGeom)

    updateNode(node.id, {
      geometry: {
        ...node.geometry!,
        params: updatedParams,
        customGeometryKey: undefined,
        stats: newStats,
      },
    })
    recalculateSceneStats()
  }

  const handleRecalculateNormals = () => {
    if (geom) {
      geom.computeVertexNormals()
      const newStats = calculateGeometryStats(geom)
      updateNode(node.id, {
        geometry: { ...node.geometry!, stats: newStats },
      })
      toast.success(`Recalculated vertex normals for ${node.name}`)
    }
  }

  const handleFlipNormals = () => {
    if (!geom) return
    const norm = geom.attributes.normal
    if (!norm) return

    for (let i = 0; i < norm.count; i++) {
      norm.setXYZ(i, -norm.getX(i), -norm.getY(i), -norm.getZ(i))
    }
    norm.needsUpdate = true

    if (geom.index) {
      const idx = geom.index
      for (let i = 0; i < idx.count; i += 3) {
        const temp = idx.getX(i)
        idx.setX(i, idx.getX(i + 1))
        idx.setX(i + 1, temp)
      }
      idx.needsUpdate = true
    }

    toast.success(`Flipped surface normals on ${node.name}`)
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Geometry Header & Edit Mode Toggle */}
      <div className="flex items-center justify-between rounded border border-white/5 bg-[#161a22] p-2.5">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-zinc-200 capitalize">{type} Primitive</span>
        </div>
        <Button
          size="sm"
          className={`h-7 text-xs font-medium gap-1 ${
            editorMode === 'edit'
              ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
              : 'bg-white/10 text-zinc-200 hover:bg-white/15'
          }`}
          onClick={toggleEditorMode}
        >
          <Pencil className="h-3 w-3" />
          {editorMode === 'edit' ? 'Exit Edit Mode' : 'Edit Geometry'}
        </Button>
      </div>

      {/* Edit Mode Sub-selection Controls */}
      {editorMode === 'edit' && (
        <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              Edit Mode Active
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">[Tab to exit]</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <Button
              variant={selectionSubMode === 'vertex' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs gap-1 ${
                selectionSubMode === 'vertex'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'border-white/10 bg-[#161a22] text-zinc-300'
              }`}
              onClick={() => setSelectionSubMode('vertex')}
            >
              <CircleDot className="h-3 w-3" />
              Vertex (1)
            </Button>
            <Button
              variant={selectionSubMode === 'edge' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs gap-1 ${
                selectionSubMode === 'edge'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'border-white/10 bg-[#161a22] text-zinc-300'
              }`}
              onClick={() => setSelectionSubMode('edge')}
            >
              <Slash className="h-3 w-3" />
              Edge (2)
            </Button>
            <Button
              variant={selectionSubMode === 'face' ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs gap-1 ${
                selectionSubMode === 'face'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'border-white/10 bg-[#161a22] text-zinc-300'
              }`}
              onClick={() => setSelectionSubMode('face')}
            >
              <Square className="h-3 w-3" />
              Face (3)
            </Button>
          </div>

          <div className="text-[11px] text-zinc-400 font-mono pt-1">
            Selected:{' '}
            <span className="text-amber-400 font-bold">
              {selectionSubMode === 'vertex'
                ? `${selectedVertexIds.length} vertices`
                : selectionSubMode === 'edge'
                ? `${selectedEdgeIds.length} edges`
                : `${selectedFaceIds.length} faces`}
            </span>
          </div>

          {/* Modeling Operations Toolbar */}
          <div className="pt-2 border-t border-amber-500/20 space-y-2">
            <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider block">
              Mesh Modeling Operators
            </span>

            {/* Extrude & Inset Controls */}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedFaceIds.length === 0}
                className="h-7 text-[11px] border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 disabled:opacity-40"
                onClick={() => {
                  useEditorStore.getState().extrudeSelectedFaces(0.2, false)
                  toast.success(`Extruded ${selectedFaceIds.length} faces by 0.2m`)
                }}
              >
                Extrude Faces
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedFaceIds.length === 0}
                className="h-7 text-[11px] border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 disabled:opacity-40"
                onClick={() => {
                  useEditorStore.getState().insetSelectedFaces(0.2, 0)
                  toast.success(`Inset ${selectedFaceIds.length} faces`)
                }}
              >
                Inset Faces
              </Button>
            </div>

            {/* Subdivide & Flip Normals */}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedFaceIds.length === 0}
                className="h-7 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5 disabled:opacity-40"
                onClick={() => {
                  useEditorStore.getState().subdivideSelectedFaces()
                  toast.success(`Subdivided ${selectedFaceIds.length} faces`)
                }}
              >
                Subdivide (4x)
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedFaceIds.length === 0}
                className="h-7 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5 disabled:opacity-40"
                onClick={() => {
                  useEditorStore.getState().flipSelectedNormals()
                  toast.success(`Flipped normals on ${selectedFaceIds.length} faces`)
                }}
              >
                Flip Selected
              </Button>
            </div>

            {/* Merge & Weld (Vertices) */}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedVertexIds.length < 2}
                className="h-7 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5 disabled:opacity-40"
                onClick={() => {
                  useEditorStore.getState().mergeSelectedVertices('center')
                  toast.success(`Merged ${selectedVertexIds.length} vertices to center`)
                }}
              >
                Merge to Center
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedVertexIds.length < 2}
                className="h-7 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5 disabled:opacity-40"
                onClick={() => {
                  useEditorStore.getState().mergeSelectedVertices('distance', 0.005)
                  toast.success(`Welded coincident vertices within 5mm`)
                }}
              >
                Weld (&lt; 5mm)
              </Button>
            </div>

            {/* Separate & Delete */}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedFaceIds.length === 0}
                className="h-7 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5 disabled:opacity-40"
                onClick={() => {
                  const parts = useEditorStore.getState().separateSelectedMesh('selected')
                  toast.success(`Separated selection into ${parts.length} objects`)
                }}
              >
                Separate Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  selectedVertexIds.length === 0 &&
                  selectedEdgeIds.length === 0 &&
                  selectedFaceIds.length === 0
                }
                className="h-7 text-[11px] border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-40"
                onClick={() => {
                  useEditorStore.getState().deleteSelectedTopologyElements()
                  toast.success(`Deleted selected topology elements`)
                }}
              >
                Delete Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      <MeshPreparationTools />
      <div className="rounded border border-white/5 bg-[#161a22] p-3 space-y-2.5">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Topology & Mesh Metrics
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-zinc-500">GPU Vertices:</span>{' '}
            <span className="font-mono text-zinc-200">{stats.vertexCount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-zinc-500">Unique Vertices:</span>{' '}
            <span className="font-mono text-emerald-400">
              {topologyStats?.uniqueVertices.toLocaleString() ?? stats.vertexCount}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Total Edges:</span>{' '}
            <span className="font-mono text-zinc-200">
              {topologyStats?.totalEdges.toLocaleString() ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Total Faces:</span>{' '}
            <span className="font-mono text-zinc-200">
              {topologyStats?.totalFaces.toLocaleString() ?? stats.triangleCount}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Open Boundaries:</span>{' '}
            <span className={`font-mono ${(topologyStats?.boundaryEdges ?? 0) > 0 ? 'text-cyan-400' : 'text-zinc-300'}`}>
              {topologyStats?.boundaryEdges.toLocaleString() ?? 0}
            </span>
            {(topologyStats?.boundaryEdges ?? 0) > 0 && (
              <span className="block text-[9px] text-zinc-500 leading-tight">
                (Neck, sleeves, hem openings)
              </span>
            )}
          </div>
          <div>
            <span className="text-zinc-500">Non-Manifold:</span>{' '}
            <span className={`font-mono ${(topologyStats?.nonManifoldEdges ?? 0) > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
              {topologyStats?.nonManifoldEdges.toLocaleString() ?? 0}
            </span>
            {(topologyStats?.nonManifoldEdges ?? 0) > 0 && (
              <span className="block text-[9px] text-rose-400/80 leading-tight">
                (Internal seam folds)
              </span>
            )}
          </div>
          <div>
            <span className="text-zinc-500">Degenerate Faces:</span>{' '}
            <span className={`font-mono ${(topologyStats?.degenerateFaces ?? 0) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {topologyStats?.degenerateFaces.toLocaleString() ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">Normals:</span>{' '}
            {stats.hasNormals ? (
              <span className="inline-flex items-center text-emerald-400">
                <CheckCircle2 className="mr-0.5 h-3 w-3" /> Valid
              </span>
            ) : (
              <span className="inline-flex items-center text-red-400">
                <AlertTriangle className="mr-0.5 h-3 w-3" /> Missing
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">UV Coordinates:</span>{' '}
            {stats.hasUVs ? (
              <span className="inline-flex items-center text-emerald-400">
                <CheckCircle2 className="mr-0.5 h-3 w-3" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-400">
                <AlertTriangle className="mr-0.5 h-3 w-3" /> Missing
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">UV Seams:</span>{' '}
            {stats.hasUVs ? (
              <span className="inline-flex items-center text-zinc-300">
                Chart Adjacency
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-400">
                <AlertTriangle className="mr-0.5 h-3 w-3" /> None
              </span>
            )}
          </div>
        </div>

        {topologyStats?.surfaceArea !== undefined && topologyStats.surfaceArea > 0 && (
          <div className="text-[10px] text-zinc-400 font-mono pt-1">
            Surface Area: <span className="text-zinc-200">{topologyStats.surfaceArea.toFixed(3)} m²</span>
          </div>
        )}

        {stats.boundingBox && (
          <div className="pt-1.5 border-t border-white/5 text-[10px] text-zinc-400 font-mono">
            Bounding Box: {stats.boundingBox.size[0].toFixed(2)}m × {stats.boundingBox.size[1].toFixed(2)}m ×{' '}
            {stats.boundingBox.size[2].toFixed(2)}m
          </div>
        )}
      </div>

      {/* Visual Diagnostics Mode */}
      <div className="rounded border border-cyan-500/20 bg-cyan-950/10 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" />
            Visual Diagnostics
          </span>
          <Button
            size="sm"
            variant="outline"
            className={`h-6 text-[10px] px-2 ${
              diagnosticOverlay.enabled
                ? 'bg-cyan-500 text-zinc-950 font-bold border-cyan-400'
                : 'border-white/10 bg-[#161a22] text-zinc-300'
            }`}
            onClick={() => setDiagnosticOverlay({ enabled: !diagnosticOverlay.enabled })}
          >
            {diagnosticOverlay.enabled ? 'Diagnostics Active' : 'Enable Visualizer'}
          </Button>
        </div>

        {diagnosticOverlay.enabled && (
          <div className="space-y-1.5 pt-1 text-[11px]">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={diagnosticOverlay.showBoundaryEdges}
                onChange={(e) => setDiagnosticOverlay({ showBoundaryEdges: e.target.checked })}
                className="rounded accent-cyan-400"
              />
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Boundary Edges ({topologyStats?.boundaryEdges ?? 0}) — Open Garment Openings</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={diagnosticOverlay.showNonManifoldEdges}
                onChange={(e) => setDiagnosticOverlay({ showNonManifoldEdges: e.target.checked })}
                className="rounded accent-red-400"
              />
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Non-Manifold Edges ({topologyStats?.nonManifoldEdges ?? 0})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={diagnosticOverlay.showDegenerateFaces}
                onChange={(e) => setDiagnosticOverlay({ showDegenerateFaces: e.target.checked })}
                className="rounded accent-amber-400"
              />
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Degenerate Faces ({topologyStats?.degenerateFaces ?? 0})</span>
            </label>
          </div>
        )}

        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-zinc-400 max-w-[180px] leading-tight">
            Garment openings (neck, sleeves, hem) are intentional and kept open.
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={(topologyStats?.degenerateFaces ?? 0) === 0}
            className="h-7 text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 disabled:opacity-40"
            onClick={() => {
              const res = safeRepairMesh({ removeDegenerate: true, weldCoincident: false })
              toast.success(`Safe repair completed: cleaned ${res.removedDegenerate} degenerate face(s). Openings preserved.`)
            }}
          >
            Safe Repair
          </Button>
        </div>
      </div>

      {/* Surface Normals & Geometry Tools */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-medium text-zinc-400">Surface Normals</label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculateNormals}
            className="w-1/2 h-8 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
            Recalculate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlipNormals}
            className="w-1/2 h-8 text-[11px] border-white/10 bg-[#161a22] text-zinc-300 hover:bg-white/5"
          >
            <FlipVertical className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
            Flip Normals
          </Button>
        </div>
      </div>
    </div>
  )
}

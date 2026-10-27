'use client'

import React from 'react'
import {
  MousePointer,
  Move,
  RotateCw,
  Maximize2,
  Grid as GridIcon,
  Sun,
  Layers,
  Compass,
  Box,
  Pencil,
  CircleDot,
  Slash,
  Square,
  Eye,
  Network,
} from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { CameraViewPreset } from '@/types/editor'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

interface ViewportOverlayProps {
  onResetCamera?: (preset?: CameraViewPreset) => void
}

export function ViewportOverlay({ onResetCamera }: ViewportOverlayProps) {
  const transformMode = useEditorStore((state) => state.transformMode)
  const transformSpace = useEditorStore((state) => state.transformSpace)
  const viewMode = useEditorStore((state) => state.viewMode)
  const env = useEditorStore((state) => state.environment)

  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const isMeshSelected = !!node && node.type === 'mesh'

  const editorMode = useEditorStore((state) => state.editorMode)
  const selectionSubMode = useEditorStore((state) => state.selectionSubMode)
  const selectedVertexIds = useEditorStore((state) => state.selectedVertexIds)
  const selectedEdgeIds = useEditorStore((state) => state.selectedEdgeIds)
  const selectedFaceIds = useEditorStore((state) => state.selectedFaceIds)
  const overlayVisible = useEditorStore((state) => state.editModeOverlayVisible)

  const setEditorMode = useEditorStore((state) => state.setEditorMode)
  const setSelectionSubMode = useEditorStore((state) => state.setSelectionSubMode)
  const setEditModeOverlayVisible = useEditorStore((state) => state.setEditModeOverlayVisible)
  const selectAllSubElements = useEditorStore((state) => state.selectAllSubElements)
  const clearSubSelection = useEditorStore((state) => state.clearSubSelection)

  const setTransformMode = useEditorStore((state) => state.setTransformMode)
  const setTransformSpace = useEditorStore((state) => state.setTransformSpace)
  const setViewMode = useEditorStore((state) => state.setViewMode)
  const updateEnvironment = useEditorStore((state) => state.updateEnvironment)
  const showTopologyOverlay = useEditorStore((state) => state.showTopologyOverlay)
  const setShowTopologyOverlay = useEditorStore((state) => state.setShowTopologyOverlay)

  const selectionCount =
    selectionSubMode === 'vertex'
      ? selectedVertexIds.length
      : selectionSubMode === 'edge'
      ? selectedEdgeIds.length
      : selectedFaceIds.length

  const subModeLabel =
    selectionSubMode === 'vertex'
      ? 'Vertices'
      : selectionSubMode === 'edge'
      ? 'Edges'
      : 'Faces'

  return (
    <TooltipProvider delay={200}>
      <div className="pointer-events-none absolute inset-x-0 top-3 flex items-center justify-between px-4 z-10">
        {/* Left Toolbar: Modeling Modes & Transform Gizmos */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#12151b]/95 p-1 shadow-xl backdrop-blur-md">
          {/* Object Mode / Edit Mode Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className={`h-8 gap-1.5 px-2.5 rounded flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                    editorMode === 'edit'
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'bg-white/10 text-zinc-200 hover:bg-white/15'
                  }`}
                >
                  {editorMode === 'edit' ? (
                    <>
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit Mode</span>
                    </>
                  ) : (
                    <>
                      <Box className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Object Mode</span>
                    </>
                  )}
                  <span className="ml-1 text-[10px] font-mono opacity-60">[Tab]</span>
                </button>
              }
            />
            <DropdownMenuContent align="start" className="w-44 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem
                className={editorMode === 'object' ? 'text-emerald-400 bg-emerald-500/10' : ''}
                onClick={() => setEditorMode('object')}
              >
                <Box className="h-4 w-4 mr-2" />
                Object Mode <span className="ml-auto font-mono text-[10px] text-zinc-400">[Tab]</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!isMeshSelected}
                className={editorMode === 'edit' ? 'text-amber-400 bg-amber-500/10' : ''}
                onClick={() => setEditorMode('edit')}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Mode <span className="ml-auto font-mono text-[10px] text-zinc-400">[Tab]</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Mode Sub-selection Tools */}
          {editorMode === 'edit' && (
            <>
              <div className="h-4 w-px bg-white/10 mx-0.5" />

              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        selectionSubMode === 'vertex'
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                      }`}
                      onClick={() => setSelectionSubMode('vertex')}
                    >
                      <CircleDot className="h-4 w-4" />
                    </button>
                  }
                />
                <TooltipContent side="bottom" className="text-xs">
                  Vertex Select <span className="text-zinc-400 font-mono">[1]</span>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        selectionSubMode === 'edge'
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                      }`}
                      onClick={() => setSelectionSubMode('edge')}
                    >
                      <Slash className="h-4 w-4" />
                    </button>
                  }
                />
                <TooltipContent side="bottom" className="text-xs">
                  Edge Select <span className="text-zinc-400 font-mono">[2]</span>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        selectionSubMode === 'face'
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                      }`}
                      onClick={() => setSelectionSubMode('face')}
                    >
                      <Square className="h-4 w-4" />
                    </button>
                  }
                />
                <TooltipContent side="bottom" className="text-xs">
                  Face Select <span className="text-zinc-400 font-mono">[3]</span>
                </TooltipContent>
              </Tooltip>

              {/* Selection status badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 text-[11px] font-mono text-zinc-300">
                <span className={selectionCount > 0 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                  {selectionCount}
                </span>
                <span className="text-zinc-400">{subModeLabel}</span>
              </div>
            </>
          )}

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Transform Gizmos: Select, Move, Rotate, Scale */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    transformMode === 'select'
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                  onClick={() => setTransformMode('select')}
                >
                  <MousePointer className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Select Mode <span className="text-zinc-400 font-mono">[Q]</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    transformMode === 'translate'
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                  onClick={() => setTransformMode('translate')}
                >
                  <Move className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Move / Translate <span className="text-zinc-400 font-mono">[W]</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    transformMode === 'rotate'
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                  onClick={() => setTransformMode('rotate')}
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Rotate <span className="text-zinc-400 font-mono">[E]</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    transformMode === 'scale'
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                  onClick={() => setTransformMode('scale')}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Scale <span className="text-zinc-400 font-mono">[R]</span>
            </TooltipContent>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-white/10" />

          {/* Coordinate Space Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-mono uppercase text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            onClick={() => setTransformSpace(transformSpace === 'world' ? 'local' : 'world')}
          >
            {transformSpace}
          </Button>
        </div>

        {/* Right Toolbar: View modes, camera presets, grid & shadow toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#12151b]/95 p-1 shadow-xl backdrop-blur-md">
          {/* Shading View Mode */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="h-8 gap-1.5 px-2.5 rounded flex items-center justify-center text-xs text-zinc-300 hover:text-zinc-100 hover:bg-white/5 cursor-pointer">
                  <Layers className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="capitalize">{viewMode}</span>
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-36 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem
                className={viewMode === 'solid' ? 'text-emerald-400 bg-emerald-500/10' : ''}
                onClick={() => setViewMode('solid')}
              >
                Solid Material
              </DropdownMenuItem>
              <DropdownMenuItem
                className={viewMode === 'wireframe' ? 'text-emerald-400 bg-emerald-500/10' : ''}
                onClick={() => setViewMode('wireframe')}
              >
                Wireframe
              </DropdownMenuItem>
              <DropdownMenuItem
                className={viewMode === 'normal' ? 'text-emerald-400 bg-emerald-500/10' : ''}
                onClick={() => setViewMode('normal')}
              >
                Normal Shading
              </DropdownMenuItem>
              <DropdownMenuItem
                className={viewMode === 'material' ? 'text-emerald-400 bg-emerald-500/10' : ''}
                onClick={() => setViewMode('material')}
              >
                Material Preview
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Show Topology Overlay Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    showTopologyOverlay
                      ? 'text-emerald-400 bg-emerald-500/15'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                  onClick={() => setShowTopologyOverlay(!showTopologyOverlay)}
                >
                  <Network className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Toggle Mesh Topology Wireframe
            </TooltipContent>
          </Tooltip>

          {/* Camera View Presets */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="h-8 w-8 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 cursor-pointer">
                  <Compass className="h-4 w-4" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-40 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem onClick={() => onResetCamera?.('perspective')}>
                Perspective <span className="ml-auto font-mono text-[10px] text-zinc-400">[0]</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => onResetCamera?.('front')}>
                Front <span className="ml-auto font-mono text-[10px] text-zinc-400">[1]</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetCamera?.('right')}>
                Right <span className="ml-auto font-mono text-[10px] text-zinc-400">[3]</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetCamera?.('top')}>
                Top <span className="ml-auto font-mono text-[10px] text-zinc-400">[7]</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetCamera?.('back')}>Back</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetCamera?.('left')}>Left</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetCamera?.('bottom')}>Bottom</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Mode Overlays Settings Dropdown */}
          {editorMode === 'edit' && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="h-8 w-8 rounded flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-white/5 cursor-pointer">
                    <Eye className="h-4 w-4" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-44 bg-[#161a22] border-white/10 text-zinc-200">
                <DropdownMenuLabel className="text-[10px] uppercase text-zinc-400 font-mono">
                  Overlays
                </DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={overlayVisible.vertices}
                  onCheckedChange={(v) => setEditModeOverlayVisible({ vertices: !!v })}
                >
                  Show Vertices
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={overlayVisible.edges}
                  onCheckedChange={(v) => setEditModeOverlayVisible({ edges: !!v })}
                >
                  Show Edges
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={overlayVisible.faces}
                  onCheckedChange={(v) => setEditModeOverlayVisible({ faces: !!v })}
                >
                  Show Face Highlights
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="h-4 w-px bg-white/10" />

          {/* Grid Toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    env.grid ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  onClick={() => updateEnvironment({ grid: !env.grid })}
                >
                  <GridIcon className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Toggle Grid
            </TooltipContent>
          </Tooltip>

          {/* Shadows Toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  className={`h-8 w-8 rounded flex items-center justify-center transition-colors cursor-pointer ${
                    env.shadows ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  onClick={() => updateEnvironment({ shadows: !env.shadows })}
                >
                  <Sun className="h-4 w-4" />
                </button>
              }
            />
            <TooltipContent side="bottom" className="text-xs">
              Toggle Shadows
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

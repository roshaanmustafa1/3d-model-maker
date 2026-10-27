'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/stores/editor-store'
import { useCustomizerStore } from '@/stores/customizer-store'
import { useProjectStore } from '@/stores/project-store'
import { TexturePipeline } from './texture-pipeline'
import { bindProduct } from '@/engine/customization/targets'
import { inspectModelForCustomization } from '@/engine/customization/zone-mapper'
import { CATALOG_PRODUCTS } from '@/engine/customization/product-catalog'

// Sub-components
import { ProductLibrary } from './product-library'
import { DesignZonePanel } from './design-zone-panel'
import { ArtworkToolbar } from './artwork-toolbar'
import { LayersPanel } from './layers-panel'
import { LayerInspector } from './layer-inspector'
import { MaterialPanel } from './material-panel'
import { PreviewControls } from './preview-controls'
import { ExportDialog } from './export-dialog'
import {
  Shirt,
  ArrowLeft,
  Download,
  Save,
  Undo2,
  Redo2,
  Maximize2,
  Minimize2,
  Layers,
  Palette,
  Sliders,
  Compass,
  Upload,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  FileBox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Dynamic imports for client-only components
const ArtworkCanvas = dynamic(
  () => import('./artwork-canvas').then((m) => m.ArtworkCanvas),
  { ssr: false }
)

const ViewportCanvas = dynamic(
  () => import('@/components/viewport/viewport-canvas').then((m) => m.ViewportCanvas),
  { ssr: false }
)

type LeftNavTab = 'library' | 'zones' | 'artwork' | 'layers'
type RightNavTab = 'properties' | 'materials'

export function ProductCustomizerView() {
  const setActiveWorkspace = useEditorStore((state) => state.setActiveWorkspace)
  const loadImportedScene = useEditorStore((state) => state.loadImportedScene)
  const updateMaterial = useEditorStore((state) => state.updateMaterial)
  const materials = useEditorStore((state) => state.materials)
  const nodes = useEditorStore((state) => state.nodes)

  const saveCurrentProject = useProjectStore((state) => state.saveCurrentProject)
  const isSaving = useProjectStore((state) => state.isSaving)
  const lastSavedAt = useProjectStore((state) => state.lastSavedAt)

  // Customizer Store
  const productName = useCustomizerStore((state) => state.productName)
  const productCategory = useCustomizerStore((state) => state.productCategory)
  const activeZoneId = useCustomizerStore((state) => state.activeZoneId)
  const zones = useCustomizerStore((state) => state.zones)
  const fabricColor = useCustomizerStore((state) => state.fabricColor)
  const fabricRoughness = useCustomizerStore((state) => state.fabricRoughness)
  const fabricMetalness = useCustomizerStore((state) => state.fabricMetalness)
  const textureResolution = useCustomizerStore((state) => state.textureResolution)
  const undo = useCustomizerStore((state) => state.undo)
  const redo = useCustomizerStore((state) => state.redo)
  const historyIndex = useCustomizerStore((state) => state.historyIndex)
  const history = useCustomizerStore((state) => state.history)
  const hasUnsavedChanges = useCustomizerStore((state) => state.hasUnsavedChanges)
  const activeLayerId = useCustomizerStore((state) => state.activeLayerId)

  // Layout UI states
  const [leftTab, setLeftTab] = useState<LeftNavTab>('artwork')
  const [rightTab, setRightTab] = useState<RightNavTab>('properties')
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [splitViewMode, setSplitViewMode] = useState<'split' | 'canvas-focused' | '3d-focused'>('split')

  // Auto-switch right tab when layer is selected
  useEffect(() => {
    if (activeLayerId) {
      setRightTab('properties')
    }
  }, [activeLayerId])

  useEffect(() => {
    if (Object.values(nodes).some(node => node.type === 'mesh')) return
    const item = CATALOG_PRODUCTS[0]
    const scene = item.generateScene()
    loadImportedScene(scene)
    useCustomizerStore.getState().loadProduct(bindProduct(item.product, scene.nodes))
  }, [nodes, loadImportedScene])

  const handleSaveProject = async () => {
    try {
      await saveCurrentProject()
      toast.success('Project saved to IndexedDB persistent storage!')
    } catch (err) {
      toast.error('Save failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const activeZone = zones[activeZoneId]
  const diagnostics = useMemo(() => inspectModelForCustomization(nodes, materials, Object.values(zones)), [nodes, materials, zones])

  return (
    <div className="flex h-full w-full flex-col bg-[#0d0f14] text-zinc-100 select-none overflow-hidden font-sans">
      <TexturePipeline />
      {/* Subheader Toolbar */}
      <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#12151b] px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveWorkspace('editor')}
            className="h-8 px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 3D Modeling Studio
          </Button>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20">
              <Shirt className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white">{productName}</span>
              <span className="text-[10px] text-zinc-400 uppercase font-mono ml-2">
                {productCategory}
              </span>
            </div>
          </div>
        </div>

        {/* Undo / Redo & Save Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 border-r border-white/10 pr-2 mr-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={historyIndex <= 0}
              onClick={undo}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={historyIndex >= history.length - 1}
              onClick={redo}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={handleSaveProject}
            className="h-7 border-white/10 bg-[#161a22] text-xs text-zinc-200 hover:bg-white/5 gap-1.5"
          >
            <Save className="h-3.5 w-3.5 text-emerald-400" />
            {isSaving ? 'Saving...' : 'Save Project'}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExportDialogOpen(true)}
            className="h-7 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" /> Export GLB
          </Button>
        </div>
      </div>

      {/* Main Customizer Layout: 3 Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Navigation Tabs & Tools */}
        <div className="w-80 shrink-0 border-r border-white/10 bg-[#12151b] flex flex-col overflow-hidden">
          {/* Tabs Header */}
          <div className="flex border-b border-white/10 bg-[#0e1117]">
            <button
              onClick={() => setLeftTab('artwork')}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                leftTab === 'artwork'
                  ? 'border-emerald-500 text-emerald-300 bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Upload className="h-3 w-3" /> Artwork
            </button>
            <button
              onClick={() => setLeftTab('layers')}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                leftTab === 'layers'
                  ? 'border-emerald-500 text-emerald-300 bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="h-3 w-3" /> Layers
            </button>
            <button
              onClick={() => setLeftTab('zones')}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                leftTab === 'zones'
                  ? 'border-emerald-500 text-emerald-300 bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Compass className="h-3 w-3" /> Zones
            </button>
            <button
              onClick={() => setLeftTab('library')}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                leftTab === 'library'
                  ? 'border-emerald-500 text-emerald-300 bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileBox className="h-3 w-3" /> Library
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {leftTab === 'artwork' && <ArtworkToolbar />}
            {leftTab === 'layers' && <LayersPanel />}
            {leftTab === 'zones' && <DesignZonePanel />}
            {leftTab === 'library' && <ProductLibrary onClose={() => setLeftTab('artwork')} />}
          </div>
        </div>

        {/* Center Canvas Viewport */}
        <div className="flex-1 relative flex flex-col bg-[#0e1117] overflow-hidden">
          {/* View Mode Switcher Header */}
          <div className="absolute top-3 left-4 z-10 flex items-center gap-1 rounded-md bg-[#12151b]/90 backdrop-blur-md p-1 border border-white/10 shadow-lg text-xs">
            <button
              onClick={() => setSplitViewMode('split')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                splitViewMode === 'split' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Split View (2D + 3D)
            </button>
            <button
              onClick={() => setSplitViewMode('canvas-focused')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                splitViewMode === 'canvas-focused' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              2D Design Canvas
            </button>
            <button
              onClick={() => setSplitViewMode('3d-focused')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                splitViewMode === '3d-focused' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              3D Product Preview
            </button>
          </div>

          {/* Viewport Contents: Split View or Focused */}
          <div className="flex-1 flex overflow-hidden">
            {/* 2D Design Canvas Container */}
            {(splitViewMode === 'split' || splitViewMode === 'canvas-focused') && (
              <div
                className={`relative flex items-center justify-center border-r border-white/10 bg-[#0b0d12] ${
                  splitViewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}
              >
                <ArtworkCanvas />
              </div>
            )}

            {/* 3D WebGL Viewport Container */}
            {(splitViewMode === 'split' || splitViewMode === '3d-focused') && (
              <div
                className={`relative flex-1 bg-[#0d0f14] ${
                  splitViewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}
              >
                <ViewportCanvas />
              </div>
            )}
          </div>

          {/* Floating Camera & Studio Lighting Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <PreviewControls />
          </div>
        </div>

        {/* Right Panel: Layer Inspector & Materials */}
        <div className="w-80 shrink-0 border-l border-white/10 bg-[#12151b] flex flex-col overflow-hidden">
          {/* Right Tabs Header */}
          <div className="flex border-b border-white/10 bg-[#0e1117]">
            <button
              onClick={() => setRightTab('properties')}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                rightTab === 'properties'
                  ? 'border-emerald-500 text-emerald-300 bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="h-3 w-3" /> Layer Inspector
            </button>
            <button
              onClick={() => setRightTab('materials')}
              className={`flex-1 py-2 text-[11px] font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                rightTab === 'materials'
                  ? 'border-emerald-500 text-emerald-300 bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Palette className="h-3 w-3" /> Material & Finish
            </button>
          </div>

          {/* Right Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {rightTab === 'properties' && <LayerInspector />}
            {rightTab === 'materials' && <MaterialPanel />}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex h-7 items-center justify-between border-t border-white/10 bg-[#0e1117] px-4 text-[11px] text-zinc-400 font-mono shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Zone:</span>
            <span className="text-emerald-400 font-semibold">{activeZone?.name || 'None'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Bake Resolution:</span>
            <span className="text-zinc-300">{textureResolution} x {textureResolution}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">UV Status:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {diagnostics.isReadyForArtwork ? 'Mapped' : 'Review required'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSavedAt && (
            <span className="text-zinc-500 text-[10px]">Saved at {lastSavedAt}</span>
          )}
          <span className="text-zinc-500" title={diagnostics.overlapWarnings.join('\n')}>{diagnostics.isReadyForArtwork ? 'UV targets verified' : diagnostics.overlapWarnings[0] || 'UV mapping required'}</span>
        </div>
      </div>

      {/* Export GLB Modal */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </div>
  )
}

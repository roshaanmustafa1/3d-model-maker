'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import { TopNav } from './top-nav'
import { SceneExplorer } from './scene-explorer'
import { InspectorPanel } from './inspector/inspector-panel'
import { PreparationWorkflow } from './preparation-workflow'
import { StatusBar } from './status-bar'
import { ExportModal } from './modals/export-modal'
import { ImportModal } from './modals/import-modal'
import { ValidationModal } from './modals/validation-modal'
import { ProductCustomizerView } from '@/components/customizer/product-customizer-view'
import { AIGeneratorView } from '@/components/generator/ai-generator-view'
import { UVInspectorView } from '@/components/uv/uv-inspector-view'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

// Client-only Dynamic 3D Viewport
const ViewportCanvas = dynamic(
  () => import('@/components/viewport/viewport-canvas').then((m) => m.ViewportCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0d0f14] text-zinc-500">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <span className="text-xs font-mono text-zinc-400">Initializing Three.js WebGL Engine...</span>
        </div>
      </div>
    ),
  }
)

export function EditorLayout() {
  const activeWorkspace = useEditorStore((state) => state.activeWorkspace)
  const setTransformMode = useEditorStore((state) => state.setTransformMode)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const deleteNode = useEditorStore((state) => state.deleteNode)
  const duplicateNode = useEditorStore((state) => state.duplicateNode)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const editorMode = useEditorStore((state) => state.editorMode)
  const toggleEditorMode = useEditorStore((state) => state.toggleEditorMode)
  const setSelectionSubMode = useEditorStore((state) => state.setSelectionSubMode)
  const selectAllSubElements = useEditorStore((state) => state.selectAllSubElements)
  const clearSubSelection = useEditorStore((state) => state.clearSubSelection)
  const clearObjectSelection = useEditorStore((state) => state.clearObjectSelection)
  const setEditorMode = useEditorStore((state) => state.setEditorMode)
  const openModal = useEditorStore((state) => state.openModal)
  const saveCurrentProject = useProjectStore((state) => state.saveCurrentProject)

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (useEditorStore.getState().activeWorkspace === 'customizer' && !((e.ctrlKey || e.metaKey) && e.key === 's')) return
      // Ignore when typing inside input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return
      }


      // Mode Switch: Tab key
      if (e.key === 'Tab') {
        e.preventDefault()
        toggleEditorMode()
        return
      }

      // Escape key: deselects in Object Mode, clears sub-selection or cancels active mode in Edit Mode
      if (e.key === 'Escape') {
        e.preventDefault()
        if (editorMode === 'edit') {
          const state = useEditorStore.getState()
          if (
            state.selectedVertexIds.length > 0 ||
            state.selectedEdgeIds.length > 0 ||
            state.selectedFaceIds.length > 0
          ) {
            clearSubSelection()
          } else {
            setEditorMode('object')
          }
        } else {
          clearObjectSelection()
        }
        return
      }

      // Edit Mode Shortcuts: 1, 2, 3, A
      if (editorMode === 'edit') {
        if (e.key === '1') {
          e.preventDefault()
          setSelectionSubMode('vertex')
          return
        }
        if (e.key === '2') {
          e.preventDefault()
          setSelectionSubMode('edge')
          return
        }
        if (e.key === '3') {
          e.preventDefault()
          setSelectionSubMode('face')
          return
        }
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault()
          if (e.altKey) {
            clearSubSelection()
          } else {
            selectAllSubElements()
          }
          return
        }
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }

      // Save Project
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveCurrentProject().then(() => toast.success('Project saved to IndexedDB')).catch((error) => toast.error(error.message))
        return
      }

      // Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (selectedNodeId) duplicateNode(selectedNodeId)
        return
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          e.preventDefault()
          deleteNode(selectedNodeId)
        }
        return
      }

      // Gizmo Transform Modes: W, E, R, Q
      if (e.key.toLowerCase() === 'w') {
        setTransformMode('translate')
      } else if (e.key.toLowerCase() === 'e') {
        setTransformMode('rotate')
      } else if (e.key.toLowerCase() === 'r') {
        setTransformMode('scale')
      } else if (e.key.toLowerCase() === 'q') {
        setTransformMode('select')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, saveCurrentProject, duplicateNode, deleteNode, selectedNodeId, setTransformMode, editorMode, toggleEditorMode, setSelectionSubMode, selectAllSubElements, clearSubSelection])

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0d0f12] text-zinc-100 select-none">
      {/* Top Header Navigation */}
      <TopNav />
      <PreparationWorkflow />

      {/* Workspace Switcher Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeWorkspace === 'editor' && (
          <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
            {/* Left Panel: Scene Explorer */}
            <ResizablePanel defaultSize="20%" minSize="14%" maxSize="30%">
              <SceneExplorer />
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-white/10 hover:bg-emerald-500/50 transition-colors" />

            {/* Center Viewport: 3D Viewport */}
            <ResizablePanel defaultSize="55%" minSize="30%">
              <ViewportCanvas />
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-white/10 hover:bg-emerald-500/50 transition-colors" />

            {/* Right Panel: Context Inspector */}
            <ResizablePanel defaultSize="25%" minSize="18%" maxSize="38%">
              <InspectorPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {activeWorkspace === 'customizer' && <ProductCustomizerView />}
        {activeWorkspace === 'generator' && <AIGeneratorView />}
        {activeWorkspace === 'uv' && <UVInspectorView />}
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals */}
      <ExportModal />
      <ImportModal />
      <ValidationModal />
    </div>
  )
}

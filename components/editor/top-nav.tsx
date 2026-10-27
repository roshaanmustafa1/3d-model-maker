'use client'

import React from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import {
  Box,
  Undo2,
  Redo2,
  Download,
  Upload,
  Save,
  ShieldCheck,
  Sparkles,
  Shirt,
  Map,
  Plus,
  Circle,
  Cylinder,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { WorkspaceType } from '@/types/editor'
import { GeometryType } from '@/types/scene'

export function TopNav() {
  const activeWorkspace = useEditorStore((state) => state.activeWorkspace)
  const setActiveWorkspace = useEditorStore((state) => state.setActiveWorkspace)
  const openModal = useEditorStore((state) => state.openModal)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const canUndo = useEditorStore((state) => state.history.past.length > 0)
  const canRedo = useEditorStore((state) => state.history.future.length > 0)
  const addPrimitive = useEditorStore((state) => state.addPrimitive)
  const addEmptyGroup = useEditorStore((state) => state.addEmptyGroup)
  const resetScene = useEditorStore((state) => state.resetScene)
  const duplicateNode = useEditorStore((state) => state.duplicateNode)
  const deleteNode = useEditorStore((state) => state.deleteNode)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const setViewMode = useEditorStore((state) => state.setViewMode)

  const currentProject = useProjectStore((state) => state.currentProject)
  const saveCurrentProject = useProjectStore((state) => state.saveCurrentProject)
  const createNewProject = useProjectStore((state) => state.createNewProject)
  const openSavedProject = useProjectStore((state) => state.openSavedProject)
  const recentProjects = useProjectStore((state) => state.recentProjects)

  const handleSave = () => {
    saveCurrentProject().then(() => toast.success('Project saved to IndexedDB')).catch((error) => toast.error(error.message))
  }

  const handleAdd = (type: GeometryType) => {
    addPrimitive(type)
    toast.success(`Added ${type}`)
  }

  return (
    <header className="flex h-12 w-full items-center justify-between border-b border-white/10 bg-[#0e1014] px-3 select-none">
      {/* Left: Brand Logo & Main Menus */}
      <div className="flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Box className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
              3D Model Maker{' '}
              <span className="text-[9px] font-mono text-emerald-400 font-semibold px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                STUDIO
              </span>
            </span>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center gap-0.5 text-xs text-zinc-300">
          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="h-7 px-2.5 text-xs rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer outline-none">File</button>} />
            <DropdownMenuContent align="start" className="w-48 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem onClick={() => createNewProject('New 3D Project')}>
                New Project <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSave}>
                Save Project <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
              </DropdownMenuItem>
              {recentProjects.slice(0, 10).map((project) => (
                <DropdownMenuItem key={project.id} onClick={() => openSavedProject(project.id).then(() => toast.success('Saved project opened')).catch((error) => toast.error(error.message))}>
                  Open: {project.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => openModal('import')}>
                <Upload className="mr-2 h-4 w-4 text-zinc-400" /> Import Asset...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openModal('export')}>
                <Download className="mr-2 h-4 w-4 text-emerald-400" /> Export Model...
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={resetScene} className="text-red-400 focus:text-red-300">
                Reset Scene
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="h-7 px-2.5 text-xs rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer outline-none">Edit</button>} />
            <DropdownMenuContent align="start" className="w-48 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem onClick={undo} disabled={!canUndo}>
                Undo <DropdownMenuShortcut>Ctrl+Z</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={redo} disabled={!canRedo}>
                Redo <DropdownMenuShortcut>Ctrl+Y</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => selectedNodeId && duplicateNode(selectedNodeId)}
                disabled={!selectedNodeId}
              >
                Duplicate <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => selectedNodeId && deleteNode(selectedNodeId)}
                disabled={!selectedNodeId}
                className="text-red-400 focus:text-red-300"
              >
                Delete <DropdownMenuShortcut>Del</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="h-7 px-2.5 text-xs rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer outline-none">Add</button>} />
            <DropdownMenuContent align="start" className="w-44 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem onClick={() => handleAdd('box')}>
                <Box className="mr-2 h-4 w-4 text-emerald-400" /> Box
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdd('sphere')}>
                <Circle className="mr-2 h-4 w-4 text-sky-400" /> Sphere
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdd('cylinder')}>
                <Cylinder className="mr-2 h-4 w-4 text-purple-400" /> Cylinder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdd('cone')}>
                <Box className="mr-2 h-4 w-4 text-amber-400" /> Cone
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdd('torus')}>
                <Circle className="mr-2 h-4 w-4 text-pink-400" /> Torus
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdd('plane')}>
                <Box className="mr-2 h-4 w-4 text-zinc-400" /> Plane
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={addEmptyGroup}>
                <Plus className="mr-2 h-4 w-4 text-zinc-400" /> Empty Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="h-7 px-2.5 text-xs rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer outline-none">View</button>} />
            <DropdownMenuContent align="start" className="w-40 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem onClick={() => setViewMode('solid')}>Solid Shading</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('wireframe')}>Wireframe</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('normal')}>Surface Normals</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tools Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button className="h-7 px-2.5 text-xs rounded-lg hover:bg-white/5 text-zinc-300 cursor-pointer outline-none">Tools</button>} />
            <DropdownMenuContent align="start" className="w-56 bg-[#161a22] border-white/10 text-zinc-200">
              <DropdownMenuItem onClick={() => openModal('validator')}>
                <ShieldCheck className="mr-2 h-4 w-4 text-emerald-400" /> BlackBullet Validator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveWorkspace('uv')}>
                <Map className="mr-2 h-4 w-4 text-sky-400" /> UV Diagnostics Lab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveWorkspace('customizer')}>
                <Shirt className="mr-2 h-4 w-4 text-purple-400" /> Product Customizer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveWorkspace('generator')}>
                <Sparkles className="mr-2 h-4 w-4 text-amber-400" /> AI Image-to-3D
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Undo / Redo buttons */}
        <div className="flex items-center gap-0.5 border-l border-white/10 pl-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white disabled:opacity-30"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Center: Workspaces Navigation Tabs */}
      <div className="flex items-center rounded-lg border border-white/10 bg-[#14171e] p-0.5">
        <button
          onClick={() => setActiveWorkspace('editor')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
            activeWorkspace === 'editor'
              ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Box className="h-3.5 w-3.5" />
          <span>3D Studio</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('customizer')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
            activeWorkspace === 'customizer'
              ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Shirt className="h-3.5 w-3.5" />
          <span>Customizer</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('generator')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
            activeWorkspace === 'generator'
              ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Generator</span>
        </button>

        <button
          onClick={() => setActiveWorkspace('uv')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
            activeWorkspace === 'uv'
              ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          <span>UV Lab</span>
        </button>

        <button
          onClick={() => openModal('validator')}
          className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Validator</span>
        </button>
      </div>

      {/* Right: Quick Action Buttons (Save, Import, Export) */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          className="h-7 border-white/10 bg-[#161a22] text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
        >
          <Save className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
          Save
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => openModal('import')}
          className="h-7 border-white/10 bg-[#161a22] text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
        >
          <Upload className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
          Import
        </Button>

        <Button
          size="sm"
          onClick={() => openModal('export')}
          className="h-7 gap-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold px-3 shadow-sm cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Export GLB
        </Button>
      </div>
    </header>
  )
}

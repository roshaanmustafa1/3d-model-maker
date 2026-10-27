'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import {
  Search,
  Plus,
  Box,
  Folder,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
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
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { GeometryType } from '@/types/scene'

interface SceneNodeItemProps {
  nodeId: string
  depth?: number
  searchQuery: string
}

function SceneNodeItem({ nodeId, depth = 0, searchQuery }: SceneNodeItemProps) {
  const node = useEditorStore((state) => state.nodes[nodeId])
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const selectedNodeIds = useEditorStore((state) => state.selectedNodeIds)
  const selectObject = useEditorStore((state) => state.selectObject)
  const toggleObjectSelection = useEditorStore((state) => state.toggleObjectSelection)
  const toggleNodeVisibility = useEditorStore((state) => state.toggleNodeVisibility)
  const toggleNodeLock = useEditorStore((state) => state.toggleNodeLock)
  const deleteNode = useEditorStore((state) => state.deleteNode)
  const duplicateNode = useEditorStore((state) => state.duplicateNode)
  const renameNode = useEditorStore((state) => state.renameNode)

  const [expanded, setExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(node?.name || '')

  if (!node) return null

  // Search filter
  const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase())
  if (searchQuery && !matchesSearch && node.children.length === 0) {
    return null
  }

  const isSelected = selectedNodeId === nodeId || selectedNodeIds.includes(nodeId)
  const hasChildren = node.children.length > 0

  const handleRenameSubmit = () => {
    if (editName.trim()) {
      renameNode(node.id, editName.trim())
    }
    setIsEditing(false)
  }

  const getNodeIcon = () => {
    if (node.type === 'group') return <Folder className="h-3.5 w-3.5 text-amber-400 shrink-0" />
    if (node.geometry?.type === 'sphere') return <Circle className="h-3.5 w-3.5 text-sky-400 shrink-0" />
    if (node.geometry?.type === 'cylinder') return <Cylinder className="h-3.5 w-3.5 text-purple-400 shrink-0" />
    return <Box className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
  }

  return (
    <div>
      <div
        className={`group flex items-center justify-between py-1 px-2 text-xs transition-colors rounded cursor-pointer ${
          isSelected
            ? 'bg-emerald-500/15 text-emerald-300 font-medium'
            : 'text-zinc-300 hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={(e) => {
          if (e.shiftKey) {
            toggleObjectSelection(node.id, true)
          } else {
            selectObject(node.id)
          }
        }}
        onDoubleClick={() => {
          setIsEditing(true)
          setEditName(node.name)
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-1">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className="text-zinc-500 hover:text-zinc-300 p-0.5"
            >
              {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <span className="w-3" />
          )}

          {getNodeIcon()}

          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit()
                if (e.key === 'Escape') setIsEditing(false)
              }}
              className="bg-[#1a1f29] px-1 py-0.5 text-xs text-white rounded border border-emerald-500 outline-none w-32"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate text-xs">{node.name}</span>
          )}

          {node.isCustomizable && (
            <span title={`Customizable: ${node.customizableZone}`}>
              <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleNodeVisibility(node.id)
            }}
            className="text-zinc-400 hover:text-zinc-100 p-0.5"
            title="Toggle Visibility"
          >
            {node.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-zinc-600" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleNodeLock(node.id)
            }}
            className="text-zinc-400 hover:text-zinc-100 p-0.5"
            title="Lock Node"
          >
            {node.locked ? <Lock className="h-3 w-3 text-amber-400" /> : <Unlock className="h-3 w-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              duplicateNode(node.id)
            }}
            className="text-zinc-400 hover:text-zinc-100 p-0.5"
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteNode(node.id)
            }}
            className="text-zinc-400 hover:text-red-400 p-0.5"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((childId) => (
            <SceneNodeItem
              key={childId}
              nodeId={childId}
              depth={depth + 1}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function SceneExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const rootNodeIds = useEditorStore((state) => state.rootNodeIds)
  const addPrimitive = useEditorStore((state) => state.addPrimitive)
  const addEmptyGroup = useEditorStore((state) => state.addEmptyGroup)
  const clearObjectSelection = useEditorStore((state) => state.clearObjectSelection)

  const handleAdd = (type: GeometryType) => {
    addPrimitive(type)
  }

  return (
    <div
      className="flex h-full flex-col bg-[#111318] border-r border-white/10 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          clearObjectSelection()
        }
      }}
    >
      {/* Header with Title and Add Object Menu */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Scene Explorer
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                className="h-7 gap-1 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs px-2.5 font-medium shadow-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48 bg-[#161a22] border-white/10 text-zinc-200">
            <DropdownMenuLabel className="text-[10px] uppercase text-zinc-400">
              3D Primitives
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleAdd('box')}>
              <Box className="mr-2 h-4 w-4 text-emerald-400" /> Box / Cube
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
              <Circle className="mr-2 h-4 w-4 text-pink-400" /> Torus / Ring
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAdd('plane')}>
              <Box className="mr-2 h-4 w-4 text-zinc-400" /> Plane
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={addEmptyGroup}>
              <Folder className="mr-2 h-4 w-4 text-amber-400" /> Empty Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Bar */}
      <div className="border-b border-white/5 p-2">
        <div className="flex items-center gap-1.5 rounded bg-[#161a22] px-2 py-1 border border-white/5">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter meshes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
          />
        </div>
      </div>

      {/* Tree Node List */}
      <div
        className="flex-1 overflow-y-auto p-1 space-y-0.5"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            clearObjectSelection()
          }
        }}
      >
        {rootNodeIds.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-600">
            No objects in scene.<br />Click "+ Add" to create geometry.
          </div>
        ) : (
          rootNodeIds.map((nodeId) => (
            <SceneNodeItem key={nodeId} nodeId={nodeId} searchQuery={searchQuery} />
          ))
        )}
      </div>
    </div>
  )
}

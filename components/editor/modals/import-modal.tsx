'use client'

import React, { useState, useRef } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { importModelFile } from '@/engine/loaders/model-importer'
import { Upload, FileUp, X, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ImportModal() {
  const activeModal = useEditorStore((state) => state.activeModal)
  const openModal = useEditorStore((state) => state.openModal)
  const loadImportedScene = useEditorStore((state) => state.loadImportedScene)

  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (activeModal !== 'import') return null

  const handleProcessFile = async (file: File) => {
    setIsLoading(true)
    try {
      const result = await importModelFile(file)
      loadImportedScene(result)
      toast.success(
        `Imported "${result.modelName}" (${result.rootNodeIds.length} root components, ${
          Object.keys(result.nodes).length
        } nodes)`
      )
      openModal(null)
    } catch (err) {
      toast.error(`Import failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleProcessFile(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm select-none">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12151b] p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-zinc-100">Import 3D Asset</h2>
          </div>
          <button onClick={() => openModal(null)} className="text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-white/15 bg-[#161a22] hover:border-emerald-500/50 hover:bg-[#1a1f29]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf,.obj,.stl"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleProcessFile(file)
            }}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <span className="text-xs text-zinc-300 font-medium">Parsing 3D Geometry...</span>
            </div>
          ) : (
            <>
              <div className="rounded-full bg-emerald-500/10 p-3 mb-2">
                <FileUp className="h-6 w-6 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">
                Click to browse or drag & drop model
              </span>
              <p className="mt-1 text-[11px] text-zinc-500">
                Supports standard <strong className="text-zinc-400">.GLB</strong>,{' '}
                <strong className="text-zinc-400">.GLTF</strong>,{' '}
                <strong className="text-zinc-400">.OBJ</strong>, and{' '}
                <strong className="text-zinc-400">.STL</strong>
              </p>
            </>
          )}
        </div>

        {/* Formats info */}
        <div className="rounded bg-[#161a22] p-3 text-[11px] text-zinc-400 space-y-1 border border-white/5">
          <div className="font-medium text-zinc-300">Compatibility Note:</div>
          <p>
            GLB files will retain mesh hierarchy, PBR materials, and UV layouts for BlackBullet customization.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal(null)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import { useEditorStore } from '@/stores/editor-store'
import { exportCustomizedProductGLB, CustomizerExportResult } from '@/engine/customization/customization-exporter'
import { saveAs } from 'file-saver'
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  FileBox,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { TextureResolution, BlackBulletAppearanceMode } from '@/types/customization'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const exportProjectData = useCustomizerStore((state) => state.exportProjectData)
  const textureResolution = useCustomizerStore((state) => state.textureResolution)
  const setTextureResolution = useCustomizerStore((state) => state.setTextureResolution)
  const blackBulletMode = useCustomizerStore((state) => state.blackBulletMode)
  const setBlackBulletMode = useCustomizerStore((state) => state.setBlackBulletMode)

  const nodes = useEditorStore((state) => state.nodes)
  const rootNodeIds = useEditorStore((state) => state.rootNodeIds)
  const materials = useEditorStore((state) => state.materials)
  const productName = useCustomizerStore((state) => state.productName)

  const [isExporting, setIsExporting] = useState(false)
  const [includeSidecar, setIncludeSidecar] = useState(true)
  const [lastResult, setLastResult] = useState<CustomizerExportResult | null>(null)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    setLastResult(null)
    const toastId = toast.loading('Baking artwork textures & generating GLB asset...')

    try {
      const project = exportProjectData()
      project.textureResolution = textureResolution
      project.blackBulletMode = blackBulletMode

      const result = await exportCustomizedProductGLB(
        nodes,
        rootNodeIds,
        materials,
        project,
        {
          resolution: textureResolution,
          includeSidecarJson: includeSidecar,
        }
      )

      setLastResult(result)
      toast.dismiss(toastId)

      // Download GLB binary
      const fileName = `${productName.toLowerCase().replace(/\s+/g, '_')}_customized.glb`
      saveAs(result.blob, fileName)

      // Optionally download sidecar project JSON
      if (includeSidecar) {
        const sidecarBlob = new Blob([JSON.stringify(project, null, 2)], {
          type: 'application/json',
        })
        saveAs(sidecarBlob, `${productName.toLowerCase().replace(/\s+/g, '_')}_project.json`)
      }

      toast.success(`Successfully exported ${fileName} (${(result.byteSize / 1024).toFixed(1)} KB)`)
    } catch (err) {
      toast.dismiss(toastId)
      toast.error('Export failed: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#12151b] p-5 shadow-2xl text-zinc-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold">Export Customized 3D Product</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resolution Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">Texture Bake Resolution</label>
          <div className="grid grid-cols-3 gap-2">
            {([1024, 2048, 4096] as TextureResolution[]).map((res) => (
              <button
                key={res}
                onClick={() => setTextureResolution(res)}
                className={`rounded border p-2 text-center text-xs transition-colors ${
                  textureResolution === res
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                    : 'border-white/10 bg-[#161a22] text-zinc-400 hover:text-white'
                }`}
              >
                {res} x {res}
                <div className="text-[10px] text-zinc-500">
                  {res === 1024 ? 'Standard Web' : res === 2048 ? 'High Fidelity' : 'Ultra 4K'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* BlackBullet Compatibility Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> BlackBullet Integration Profile
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBlackBulletMode('preserve-imported')}
              className={`rounded border p-2 text-left text-xs transition-colors ${
                blackBulletMode === 'preserve-imported'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                  : 'border-white/10 bg-[#161a22] text-zinc-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-xs">Preserve Imported</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Baked PBR color & graphics preserved as authored.
              </div>
            </button>

            <button
              onClick={() => setBlackBulletMode('runtime-customization')}
              className={`rounded border p-2 text-left text-xs transition-colors ${
                blackBulletMode === 'runtime-customization'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                  : 'border-white/10 bg-[#161a22] text-zinc-400 hover:text-white'
              }`}
            >
              <div className="font-semibold text-xs">Runtime Customizer</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                White-tint base map for live fabric tinting in BlackBullet.
              </div>
            </button>
          </div>
        </div>

        {/* Sidecar Project JSON Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="sidecar"
            checked={includeSidecar}
            onChange={(e) => setIncludeSidecar(e.target.checked)}
            className="rounded border-white/20 accent-emerald-500"
          />
          <label htmlFor="sidecar" className="text-xs text-zinc-300 cursor-pointer">
            Include sidecar project document (<span className="font-mono text-zinc-400">.json</span>) for future re-editing
          </label>
        </div>

        {/* Verification Summary if completed */}
        {lastResult && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> GLB Verification Passed
            </div>
            <div className="text-[11px] text-zinc-300 font-mono">
              Meshes: {lastResult.reloadedMeshCount} | Triangles:{' '}
              {lastResult.reloadedTriangleCount.toLocaleString()} | UVs: Verified | Resolution:{' '}
              {lastResult.bakedTextureResolution}px
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs text-zinc-400">
            Close
          </Button>
          <Button
            size="sm"
            disabled={isExporting}
            onClick={handleExport}
            className="h-8 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? 'Baking & Exporting...' : 'Export GLB Asset'}
          </Button>
        </div>
      </div>
    </div>
  )
}

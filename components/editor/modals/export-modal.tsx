'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { exportSceneToGLB, ExportVerificationResult } from '@/engine/exporters/glb-exporter'
import { exportSceneToOBJ } from '@/engine/exporters/obj-exporter'
import { exportSceneToSTL } from '@/engine/exporters/stl-exporter'
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import saveAs from 'file-saver'
import { toast } from 'sonner'

export function ExportModal() {
  const activeModal = useEditorStore((state) => state.activeModal)
  const openModal = useEditorStore((state) => state.openModal)
  const nodes = useEditorStore((state) => state.nodes)
  const rootNodeIds = useEditorStore((state) => state.rootNodeIds)
  const materials = useEditorStore((state) => state.materials)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)

  const [format, setFormat] = useState<'glb' | 'gltf' | 'obj' | 'stl'>('glb')
  const [scope, setScope] = useState<'scene' | 'selected'>('scene')
  const [preset, setPreset] = useState<'blackbullet' | 'standard'>('blackbullet')
  const [onlyVisible, setOnlyVisible] = useState(true)
  const [fileName, setFileName] = useState('model_export')

  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<ExportVerificationResult | null>(null)
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null)

  if (activeModal !== 'export') return null

  const handleRunExportAndVerify = async () => {
    setIsVerifying(true)
    setVerificationResult(null)
    setGeneratedBlob(null)

    const filterId = scope === 'selected' ? (selectedNodeId || undefined) : undefined

    try {
      if (format === 'glb' || format === 'gltf') {
        const result = await exportSceneToGLB(
          nodes,
          rootNodeIds,
          materials,
          filterId,
          {
            binary: format === 'glb',
            onlyVisible,
          }
        )
        setVerificationResult(result)
        setGeneratedBlob(result.blob)

        if (result.verified) {
          toast.success('GLB generated and verified successfully!')
        } else {
          toast.warning(`GLB generated with ${result.issues.length} verification warning(s).`)
        }
      } else if (format === 'obj') {
        const blob = exportSceneToOBJ(nodes, rootNodeIds, materials, filterId)
        setGeneratedBlob(blob)
        toast.success('OBJ geometry exported successfully!')
      } else if (format === 'stl') {
        const blob = exportSceneToSTL(nodes, rootNodeIds, materials, filterId, true)
        setGeneratedBlob(blob)
        toast.success('Binary STL model exported successfully!')
      }
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDownload = () => {
    if (!generatedBlob) return
    const ext = format === 'glb' ? 'glb' : format === 'gltf' ? 'gltf' : format === 'obj' ? 'obj' : 'stl'
    saveAs(generatedBlob, `${fileName || 'model'}.${ext}`)
    toast.success(`Downloaded ${fileName}.${ext}`)
    openModal(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#12151b] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-zinc-100">Export 3D Model</h2>
          </div>
          <button
            onClick={() => openModal(null)}
            className="text-zinc-500 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options Form */}
        <div className="space-y-4 text-xs">
          {/* File Name */}
          <div className="space-y-1.5">
            <label className="text-zinc-400">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#161a22] px-3 py-1.5 font-mono text-xs text-zinc-100 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Format & Preset */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-400">Output Format</label>
              <Select value={format} onValueChange={(val: any) => setFormat(val)}>
                <SelectTrigger className="bg-[#161a22] border-white/10 text-xs text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161a22] border-white/10 text-zinc-200 text-xs">
                  <SelectItem value="glb">GLB (Binary glTF - Recommended)</SelectItem>
                  <SelectItem value="gltf">glTF (JSON Embedded)</SelectItem>
                  <SelectItem value="obj">OBJ (Wavefront Geometry)</SelectItem>
                  <SelectItem value="stl">STL (3D Printing Mesh)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400">Compatibility Preset</label>
              <Select value={preset} onValueChange={(val: any) => setPreset(val)}>
                <SelectTrigger className="bg-[#161a22] border-white/10 text-xs text-zinc-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161a22] border-white/10 text-zinc-200 text-xs">
                  <SelectItem value="blackbullet">BlackBullet Compatible</SelectItem>
                  <SelectItem value="standard">Standard WebGL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Scope */}
          <div className="space-y-1.5">
            <label className="text-zinc-400">Export Scope</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setScope('scene')}
                className={`flex-1 rounded border py-1.5 text-xs transition-colors ${
                  scope === 'scene'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium'
                    : 'border-white/10 bg-[#161a22] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Entire Scene ({rootNodeIds.length} roots)
              </button>
              <button
                type="button"
                onClick={() => setScope('selected')}
                disabled={!selectedNodeId}
                className={`flex-1 rounded border py-1.5 text-xs transition-colors ${
                  scope === 'selected'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium'
                    : 'border-white/10 bg-[#161a22] text-zinc-400 hover:text-zinc-200'
                } ${!selectedNodeId ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Selected Object Only
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between rounded bg-[#161a22] p-2.5 border border-white/5">
            <span className="text-zinc-300">Exclude Hidden Objects</span>
            <Switch checked={onlyVisible} onCheckedChange={setOnlyVisible} />
          </div>

          {/* Verification Results Panel */}
          {verificationResult && (
            <div
              className={`rounded-lg border p-3 space-y-2 text-xs ${
                verificationResult.verified
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {verificationResult.verified ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                  Round-Trip Verification: {verificationResult.verified ? 'PASSED' : 'COMPLETED WITH WARNINGS'}
                </span>
                <span className="text-[10px] font-mono">
                  {(verificationResult.byteSize / 1024).toFixed(1)} KB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                <div>
                  <span className="text-zinc-500">Verified Meshes:</span>{' '}
                  <span className="font-mono">{verificationResult.reloadedMeshCount}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Verified Triangles:</span>{' '}
                  <span className="font-mono">{verificationResult.reloadedTriangleCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500">UV Coordinates:</span>{' '}
                  <span>{verificationResult.uvCheckPassed ? 'Pass' : 'Missing'}</span>
                </div>
                <div>
                  <span className="text-zinc-500">PBR Materials:</span>{' '}
                  <span>{verificationResult.hasMaterials ? 'Embedded' : 'None'}</span>
                </div>
              </div>

              {verificationResult.issues.length + verificationResult.warnings.length > 0 && (
                <div className="mt-2 text-[10px] text-amber-300/80 space-y-0.5 border-t border-amber-500/20 pt-1">
                  {[...verificationResult.issues, ...verificationResult.warnings].map((issue, idx) => (
                    <div key={idx}>• {issue}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal(null)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>

          {!generatedBlob ? (
            <Button
              size="sm"
              disabled={isVerifying}
              onClick={handleRunExportAndVerify}
              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold gap-1.5"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying File...
                </>
              ) : (
                <>Generate & Verify {format.toUpperCase()}</>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Download {fileName}.{format}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

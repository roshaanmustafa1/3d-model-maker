'use client'

import React, { useEffect, useState } from 'react'
import {
  MeshProcessingPreset,
  MeshProcessingOptions,
  GenerationJob,
} from '@/types/ai-generator'
import { ProcessingReport } from '@/engine/processing/mesh-processor'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Wand2,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

interface ProcessingPanelProps {
  job: GenerationJob
  onProcessingComplete: (processedGlbUrl: string, report: ProcessingReport) => void
}

interface BlenderStatus {
  available: boolean
  executablePath?: string
  version?: string
  message: string
}

const PRESET_DESCRIPTIONS: Record<
  MeshProcessingPreset,
  { title: string; description: string; expectedModifications: string[] }
> = {
  web_optimized: {
    title: 'Web & Mobile Optimized',
    description: 'Removes degenerate triangles and recalculates normals. Automatic decimation is not implemented.',
    expectedModifications: [
      'Eliminate zero-area & degenerate triangles',
      'Recalculate vertex normals for smooth shading',
      'Center pivot and ground at Y = 0',
      'Inspect triangle budget; simplify externally if required',
    ],
  },
  customizer_preparation: {
    title: 'Product Customizer Preparation',
    description: 'Generates missing UV coordinates. Inspect orientation and define design zones manually.',
    expectedModifications: [
      'Generate Box/Planar UV coordinates for unmapped meshes',
      'Recalculate normals for fabric shading',
      'Inspect orientation manually in Modeling Studio',
      'Center pivot at origin',
    ],
  },
  blackbullet_garment_preparation: {
    title: 'BlackBullet Garment Standard',
    description: 'Prepares missing UVs and normals. Runtime compatibility requires verified region mappings.',
    expectedModifications: [
      'Generate UVs for unmapped meshes; inspect overlaps manually',
      'Inspect Y-up orientation and chest alignment manually',
      'Register front/back regions and atlas UVs manually',
      'Recalculate smooth normals',
    ],
  },
  preserve_high_detail: {
    title: 'Preserve High Detail',
    description: 'Maintains 100% of the original AI-generated geometry and vertex positions without decimation.',
    expectedModifications: [
      'Zero polygon decimation (100% source fidelity retained)',
      'Only center pivot and fix missing normals',
    ],
  },
  preview_optimized: {
    title: 'Preview Optimization',
    description: 'Fast alignment and viewport centering for preview inspection.',
    expectedModifications: ['Center pivot', 'Recalculate missing normals'],
  },
}

export function ProcessingPanel({ job, onProcessingComplete }: ProcessingPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<MeshProcessingPreset>('web_optimized')
  const [isProcessing, setIsProcessing] = useState(false)
  const [blenderStatus, setBlenderStatus] = useState<BlenderStatus | null>(null)
  const [useBlender, setUseBlender] = useState(false)

  useEffect(() => {
    fetch('/api/ai/blender/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status) {
          setBlenderStatus(data.status)
          if (data.status.available) {
            setUseBlender(true)
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleApplyProcessing = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/ai/jobs/${encodeURIComponent(job.id)}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: selectedPreset,
          useBlenderWorker: useBlender && blenderStatus?.available,
        }),
      })

      const data = await res.json()
      if (data.success && data.processedGlbUrl) {
        toast.success(`Applied "${PRESET_DESCRIPTIONS[selectedPreset].title}" processing!`)
        onProcessingComplete(data.processedGlbUrl, data.report)
      } else {
        toast.error(data.error || 'Mesh processing failed.')
      }
    } catch (err) {
      toast.error('Failed to communicate with processing pipeline.')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentPresetInfo = PRESET_DESCRIPTIONS[selectedPreset]

  return (
    <div className="rounded-xl border border-white/10 bg-[#12151b] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Automated Mesh Processing
          </h4>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-zinc-400">Processing Preset</label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              'web_optimized',
              'customizer_preparation',
              'blackbullet_garment_preparation',
              'preserve_high_detail',
            ] as MeshProcessingPreset[]
          ).map((preset) => {
            const info = PRESET_DESCRIPTIONS[preset]
            const isSelected = selectedPreset === preset

            return (
              <button
                key={preset}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                className={`rounded-lg border p-2.5 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-white/10 bg-[#161a22] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold">{info.title}</div>
                <div className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                  {info.description}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Expected Modifications Preview (Section 12 requirement) */}
      <div className="rounded-lg bg-[#161a22] p-3 space-y-2 border border-white/5">
        <span className="text-[11px] font-semibold text-zinc-300">Expected Operations:</span>
        <ul className="space-y-1 text-[11px] text-zinc-400">
          {currentPresetInfo.expectedModifications.map((op, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{op}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Blender Worker Status */}
      <div className="rounded-lg border border-white/5 bg-[#14171f] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-zinc-400" />
            <div>
              <span className="text-xs font-semibold text-zinc-200">Blender Processing Engine</span>
              <p className="text-[10px] text-zinc-500">
                {blenderStatus?.available
                  ? blenderStatus.version
                  : 'Headless Blender executable not detected on host'}
              </p>
            </div>
          </div>

          {blenderStatus?.available ? (
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-400">
              Connected
            </span>
          ) : (
            <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase text-zinc-500">
              Three.js Core
            </span>
          )}
        </div>

        {!blenderStatus?.available && (
          <p className="text-[10px] text-zinc-500 italic">
            • Safe Three.js computational geometry fallback active. Advanced Smart UV unwrap requires Blender.
          </p>
        )}
      </div>

      {/* Apply Button */}
      <Button
        size="sm"
        disabled={isProcessing}
        onClick={handleApplyProcessing}
        className="w-full h-9 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing Mesh Asset...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" /> Apply {currentPresetInfo.title}
          </>
        )}
      </Button>
    </div>
  )
}

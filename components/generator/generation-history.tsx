'use client'

import React from 'react'
import { GenerationJob } from '@/types/ai-generator'
import {
  Clock,
  Box,
  Trash2,
  Download,
  FolderOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GenerationHistoryProps {
  jobs: GenerationJob[]
  selectedJobId?: string
  onSelectJob: (job: GenerationJob) => void
  onDeleteJob: (jobId: string) => void
  onOpenInStudio: (job: GenerationJob) => void
  onOpenInCustomizer: (job: GenerationJob) => void
}

export function GenerationHistory({
  jobs,
  selectedJobId,
  onSelectJob,
  onDeleteJob,
  onOpenInStudio,
  onOpenInCustomizer,
}: GenerationHistoryProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-[#12151b]/40 p-8 text-center text-zinc-500 space-y-1">
        <Clock className="mx-auto h-6 w-6 text-zinc-600 mb-2" />
        <p className="text-xs font-semibold text-zinc-400">No Generation History Yet</p>
        <p className="text-[11px] text-zinc-500">
          Generated 3D assets will be preserved here across sessions and page refreshes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Durable Generation History ({jobs.length})
        </h4>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {jobs.map((job) => {
          const isSelected = selectedJobId === job.id
          const hasProcessed = !!job.processedGlbUrl
          const referenceThumb = job.images?.[0]?.dataUrl
          const formattedDate = new Date(job.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className={`rounded-xl border p-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-white/10 bg-[#12151b] hover:border-white/20 hover:bg-[#141720]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Reference Thumbnail */}
                <div className="relative h-14 w-14 rounded-lg bg-[#161a22] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                  {referenceThumb ? (
                    <img src={referenceThumb} alt="thumb" className="h-full w-full object-cover" />
                  ) : (
                    <Box className="h-6 w-6 text-zinc-600" />
                  )}
                  {hasProcessed && (
                    <span className="absolute bottom-0 right-0 rounded-tl bg-emerald-500 px-1 text-[8px] font-bold text-zinc-950">
                      PROC
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 capitalize truncate">
                      {job.category || 'Apparel'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{formattedDate}</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {job.prompt || 'AI 3D Model Reconstruction'}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 uppercase">
                        {job.provider || 'demo'}
                      </span>
                      {job.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Ready
                        </span>
                      ) : job.status === 'failed' ? (
                        <span className="flex items-center gap-1 text-[10px] text-red-400">
                          <XCircle className="h-3 w-3" /> Failed
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono">
                          {job.progress}%
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {job.status === 'completed' && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenInStudio(job)}
                            title="Open in 3D Studio"
                            className="h-6 w-6 text-zinc-400 hover:text-white"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenInCustomizer(job)}
                            title="Open in Product Customizer"
                            className="h-6 w-6 text-zinc-400 hover:text-emerald-400"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteJob(job.id)}
                        title="Delete from history"
                        className="h-6 w-6 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

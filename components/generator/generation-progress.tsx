'use client'

import React from 'react'
import { GenerationJob } from '@/types/ai-generator'
import { CheckCircle2, Loader2, AlertCircle, XCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GenerationProgressProps {
  job: GenerationJob
  onCancel?: () => void
  onRetry?: () => void
}

export function GenerationProgress({ job, onCancel, onRetry }: GenerationProgressProps) {
  const isCompleted = job.status === 'completed'
  const isFailed = job.status === 'failed'
  const isCanceled = job.status === 'canceled'
  const isActive = !isCompleted && !isFailed && !isCanceled

  return (
    <div className="rounded-xl border border-white/10 bg-[#12151b] p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : isCanceled ? (
            <XCircle className="h-4 w-4 text-zinc-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}

          <span className="font-semibold text-zinc-200 uppercase tracking-wide">
            {job.status === 'processing'
              ? 'Generating 3D Asset'
              : job.status === 'downloading'
              ? 'Downloading & Ingesting'
              : job.status === 'completed'
              ? 'Reconstruction Completed'
              : job.status === 'failed'
              ? 'Generation Failed'
              : job.status}
          </span>
        </div>

        <span className="font-mono text-xs font-bold text-emerald-400">{job.progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-[#1c212c] overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isFailed
              ? 'bg-red-500'
              : isCanceled
              ? 'bg-zinc-600'
              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`}
          style={{ width: `${job.progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[80%]">
          {job.stageMessage || 'Processing generation pipeline...'}
        </p>

        {isActive && onCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-6 text-[10px] text-zinc-400 hover:text-red-400"
          >
            Cancel
          </Button>
        )}

        {isFailed && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 text-[10px] text-emerald-400 hover:text-emerald-300 gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </Button>
        )}
      </div>

      {job.error && (
        <div className="rounded bg-red-950/20 border border-red-500/20 p-2 text-[11px] text-red-300">
          {job.error}
        </div>
      )}
    </div>
  )
}

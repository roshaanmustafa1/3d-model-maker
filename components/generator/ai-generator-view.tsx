'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { useCustomizerStore } from '@/stores/customizer-store'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Download,
  Loader2,
  Box,
  Wand2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  ReferenceImage,
  GeminiAnalysisResult,
  GenerationJob,
  GenerationSettings as SettingsType,
  ProviderCapabilities,
} from '@/types/ai-generator'
import { ReferenceUploader } from './reference-uploader'
import { GenerationSettings } from './generation-settings'
import { GenerationProgress } from './generation-progress'
import { GeneratedModelPreview } from './generated-model-preview'
import { QualityReport } from './quality-report'
import { ProcessingPanel } from './processing-panel'
import { GenerationHistory } from './generation-history'
import { parseGLTF } from '@/engine/loaders/model-importer'
import { LocalGlbHandoff } from './local-glb-handoff'

export function AIGeneratorView() {
  const setActiveWorkspace = useEditorStore((state) => state.setActiveWorkspace)
  const loadImportedScene = useEditorStore((state) => state.loadImportedScene)
  const loadCustomModel = useCustomizerStore((state) => state.loadCustomModel)

  // State
  const [images, setImages] = useState<ReferenceImage[]>([])
  const [prompt, setPrompt] = useState('Heavyweight oversized streetwear hoodie with front kangaroo pocket')
  const [providers, setProviders] = useState<ProviderCapabilities[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string>('demo')

  const [settings, setSettings] = useState<SettingsType>({
    category: 'apparel',
    geometryQuality: 'standard',
    shouldTexture: true,
    enablePbr: true,
    shouldRemesh: true,
    targetPolycount: 45000,
    dimensions: { width: 65, height: 75, depth: 35, unit: 'cm' },
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null)
  const [jobs, setJobs] = useState<GenerationJob[]>([])

  const [activeRightTab, setActiveRightTab] = useState<'quality' | 'processing' | 'history'>('quality')

  // Load initial jobs & providers on mount
  useEffect(() => {
    fetch('/api/ai/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.providers) {
            setProviders(data.providers)
            // Choose meshy if configured, otherwise demo
            const meshy = data.providers.find((p: ProviderCapabilities) => p.id === 'meshy' && p.isConfigured)
            if (meshy) setSelectedProviderId('meshy')
          }
          if (data.jobs && data.jobs.length > 0) {
            setJobs(data.jobs)
            setActiveJob(data.jobs[0])
            if (data.jobs[0].images && data.jobs[0].images.length > 0) {
              setImages(data.jobs[0].images)
            }
            if (data.jobs[0].settings) {
              setSettings(data.jobs[0].settings)
            }
          }
        }
      })
      .catch((err) => console.error('Error fetching jobs:', err))
  }, [])

  // Poll active job while in active states
  useEffect(() => {
    if (!activeJob) return
    const isTerminal =
      activeJob.status === 'completed' || activeJob.status === 'failed' || activeJob.status === 'canceled'
    if (isTerminal) return

    const interval = setInterval(() => {
      fetch(`/api/ai/jobs/${encodeURIComponent(activeJob.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.job) {
            setActiveJob(data.job)
            setJobs((prev) => prev.map((j) => (j.id === data.job.id ? data.job : j)))

            if (data.job.status === 'completed') {
              setIsGenerating(false)
              toast.success('AI 3D Model Generation Succeeded!')
            } else if (data.job.status === 'failed') {
              setIsGenerating(false)
              toast.error(data.job.error || 'Generation failed.')
            }
          }
        })
        .catch(() => {})
    }, 1500)

    return () => clearInterval(interval)
  }, [activeJob?.id, activeJob?.status])

  // 1. Analyze reference photos with Gemini
  const handleAnalyze = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one reference photo before analyzing.')
      return
    }

    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/ai/analyze-reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: settings.category,
          prompt,
          dimensions: settings.dimensions,
          images,
        }),
      })

      const data = await res.json()
      if (data.success && data.analysis) {
        setAnalysis(data.analysis)
        toast.success(
          data.isFallback
            ? 'Structural vision analysis complete (Rule-based vision engine).'
            : 'Gemini 2.5 Flash structural vision analysis complete!'
        )
      } else {
        toast.error('Failed to complete AI vision analysis.')
      }
    } catch {
      toast.error('Failed to communicate with vision service.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 2. Start 3D Generation
  const handleStartGeneration = async () => {
    if (images.length === 0) {
      toast.error('Upload at least one reference photograph to reconstruct 3D geometry.')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          category: settings.category,
          quality: settings.geometryQuality,
          dimensions: settings.dimensions,
          images,
          settings,
          providerId: selectedProviderId,
        }),
      })

      const data = await res.json()
      if (data.success && data.job) {
        setActiveJob(data.job)
        setJobs((prev) => [data.job, ...prev])
        toast.info(`3D Generation job started with ${selectedProviderId.toUpperCase()}`)
      } else {
        setIsGenerating(false)
        toast.error(data.error || 'Failed to start generation job.')
      }
    } catch (err) {
      setIsGenerating(false)
      toast.error('Error submitting generation job: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // 3. Cancel Active Job
  const handleCancelJob = async () => {
    if (!activeJob) return
    try {
      const res = await fetch(`/api/ai/jobs/${encodeURIComponent(activeJob.id)}?action=cancel`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success && data.job) {
        setActiveJob(data.job)
        setIsGenerating(false)
        toast.info('Job cancelled.')
      }
    } catch {
      toast.error('Failed to cancel job.')
    }
  }

  // 4. Delete Job from History
  const handleDeleteJob = async (jobId: string) => {
    try {
      await fetch(`/api/ai/jobs/${encodeURIComponent(jobId)}`, { method: 'DELETE' })
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      if (activeJob?.id === jobId) {
        setActiveJob(jobs.find((j) => j.id !== jobId) || null)
      }
      toast.success('Removed job from history.')
    } catch {
      toast.error('Failed to delete job.')
    }
  }

  // 5. Load into 3D Studio
  const handleOpenInStudio = async (job: GenerationJob) => {
    const glbUrl = job.processedGlbUrl || job.resultGlbUrl
    if (!glbUrl) {
      toast.error('No GLB asset is available for this job.')
      return
    }

    try {
      toast.loading('Importing generated asset into 3D Studio...', { id: 'studio-load' })
      const res = await fetch(glbUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = await res.arrayBuffer()

      const result = await parseGLTF(buffer, job.category || 'AI_Generated_Asset')
      loadImportedScene(result)
      setActiveWorkspace('editor')
      toast.dismiss('studio-load')
      toast.success(`Loaded ${result.modelName} into 3D Studio!`)
    } catch (err) {
      toast.dismiss('studio-load')
      toast.error('Failed to load into studio: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // 6. Open in Product Customizer
  const handleOpenInCustomizer = async (job: GenerationJob) => {
    const glbUrl = job.processedGlbUrl || job.resultGlbUrl
    if (!glbUrl) {
      toast.error('No GLB asset is available for this job.')
      return
    }

    if (job.qualityReport && !job.qualityReport.isCustomizerCompatible) {
      toast.warning(
        'Model may require UV preparation before artwork placement. Run the "Product Customizer Preparation" preset first.',
        { duration: 5000 }
      )
    }

    try {
      toast.loading('Preparing asset for Product Customizer...', { id: 'customizer-load' })
      const res = await fetch(glbUrl)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = await res.arrayBuffer()

      const result = await parseGLTF(buffer, job.category || 'AI_Generated_Product')
      loadImportedScene(result)

      const meshNodes = Object.values(result.nodes).filter((n) => n.type === 'mesh')
      loadCustomModel(
        result.modelName,
        job.category === 'apparel' ? 'hoodie' : 'other',
        meshNodes.map((m) => ({
          id: m.id,
          name: m.name,
          customizableZone: m.customizableZone,
        }))
      )

      setActiveWorkspace('customizer')
      toast.dismiss('customizer-load')
      toast.success('Opened in Product Customizer!')
    } catch (err) {
      toast.dismiss('customizer-load')
      toast.error('Failed to open in customizer: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  // 7. Export GLB
  const handleExportGlb = (job: GenerationJob) => {
    const glbUrl = job.processedGlbUrl || job.resultGlbUrl
    if (!glbUrl) return

    const a = document.createElement('a')
    a.href = glbUrl
    a.download = `${job.category || 'generated-model'}_${job.id}.glb`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Downloading GLB asset...')
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#0d0f14] text-zinc-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#12151b] px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveWorkspace('editor')}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to 3D Studio
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold">AI Image-to-3D Studio & Asset Pipeline</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-400">
            Phase 4 Production Pipeline
          </span>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT COLUMN: Reference Photos & Generation Specifications (3.5 cols) */}
        <div className="col-span-4 border-r border-white/10 bg-[#101319] p-4 overflow-y-auto space-y-4">
          <LocalGlbHandoff />
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              1. Reference Images
            </h3>
            <p className="text-[11px] text-zinc-400">
              Upload multi-angle reference photos for 3D reconstruction.
            </p>
          </div>

          <ReferenceUploader
            images={images}
            onImagesChange={setImages}
            disabled={isGenerating}
          />

          <Button
            size="sm"
            disabled={isAnalyzing || images.length === 0}
            onClick={handleAnalyze}
            className="w-full h-8 bg-[#161a24] border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold gap-1.5"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing Reference Geometry...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Analyze with Gemini Vision
              </>
            )}
          </Button>

          <div className="pt-2 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-3">
              2. Generation Specifications
            </h3>
            <GenerationSettings
              providers={providers}
              selectedProviderId={selectedProviderId}
              onProviderChange={setSelectedProviderId}
              settings={settings}
              onSettingsChange={setSettings}
              prompt={prompt}
              onPromptChange={setPrompt}
              disabled={isGenerating}
            />
          </div>

          <div className="pt-3">
            <Button
              size="sm"
              disabled={isGenerating || images.length === 0}
              onClick={handleStartGeneration}
              className="w-full h-10 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold gap-2 shadow-lg shadow-emerald-500/10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Synthesizing 3D Geometry...
                </>
              ) : (
                <>
                  <Box className="h-4 w-4" /> Generate 3D Model Asset
                </>
              )}
            </Button>
          </div>
        </div>

        {/* CENTER COLUMN: 3D Model Preview Viewport & Progress (5 cols) */}
        <div className="col-span-5 flex flex-col p-4 space-y-3 bg-[#0d0f14] overflow-hidden">
          {/* Progress Tracker when active */}
          {activeJob && (
            <GenerationProgress
              job={activeJob}
              onCancel={handleCancelJob}
              onRetry={handleStartGeneration}
            />
          )}

          {/* 3D Viewport */}
          <div className="flex-1 min-h-[360px] relative">
            <GeneratedModelPreview
              originalModelUrl={activeJob?.resultGlbUrl}
              processedModelUrl={activeJob?.processedGlbUrl}
              modelName={activeJob?.category}
              triangleCount={activeJob?.qualityReport?.triangleCount}
              vertexCount={activeJob?.qualityReport?.vertexCount}
            />
          </div>

          {/* Bottom Action Bar */}
          {activeJob?.status === 'completed' && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#12151b] p-3 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleOpenInStudio(activeJob)}
                  className="h-8 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-bold gap-1.5"
                >
                  <FolderOpen className="h-3.5 w-3.5" /> Open in 3D Studio
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenInCustomizer(activeJob)}
                  className="h-8 border-white/10 bg-[#161a22] text-zinc-200 hover:text-white text-xs font-semibold gap-1.5"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" /> Open in Customizer
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleExportGlb(activeJob)}
                className="h-8 text-xs text-zinc-400 hover:text-white gap-1"
              >
                <Download className="h-3.5 w-3.5" /> Export GLB
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Quality Reports, Processing & History (3 cols) */}
        <div className="col-span-3 border-l border-white/10 bg-[#101319] p-4 overflow-y-auto space-y-4">
          {/* Tab Navigation */}
          <div className="flex rounded-lg border border-white/10 bg-[#12151b] p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveRightTab('quality')}
              className={`flex-1 rounded py-1 transition-colors ${
                activeRightTab === 'quality'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Quality & Gates
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('processing')}
              className={`flex-1 rounded py-1 transition-colors ${
                activeRightTab === 'processing'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mesh Processing
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('history')}
              className={`flex-1 rounded py-1 transition-colors ${
                activeRightTab === 'history'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              History ({jobs.length})
            </button>
          </div>

          {/* Tab 1: Quality & Diagnostics */}
          {activeRightTab === 'quality' && (
            <div className="space-y-4">
              {/* Gemini Structural Vision Card */}
              {analysis && (
                <div className="rounded-xl border border-white/10 bg-[#12151b] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Gemini Vision
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      {analysis.symmetry}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] text-zinc-500">Detected Components:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.detectedObjects.map((obj, i) => (
                        <span key={i} className="rounded bg-[#161a22] px-1.5 py-0.5 text-[10px] text-zinc-300">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysis.hiddenSurfacesWarning?.length > 0 && (
                    <div className="rounded bg-amber-950/20 border border-amber-500/20 p-2 space-y-1 text-[11px]">
                      <div className="flex items-center gap-1 text-amber-400 font-semibold text-[10px]">
                        <ShieldAlert className="h-3.5 w-3.5" /> Hidden Surfaces Uncertainty (
                        {analysis.hiddenGeometryUncertainty?.toUpperCase() || 'MEDIUM'})
                      </div>
                      <p className="text-zinc-400 text-[10px]">
                        • {analysis.hiddenSurfacesWarning[0]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Quality & Gates Diagnostics */}
              <QualityReport report={activeJob?.qualityReport} />
            </div>
          )}

          {/* Tab 2: Automated Mesh Processing */}
          {activeRightTab === 'processing' && (
            <div className="space-y-4">
              {activeJob ? (
                <ProcessingPanel
                  job={activeJob}
                  onProcessingComplete={(processedGlbUrl, report) => {
                    const updated = {
                      ...activeJob,
                      processedGlbUrl,
                    }
                    setActiveJob(updated)
                    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)))
                  }}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#12151b]/40 p-6 text-center text-zinc-500 text-xs">
                  Generate or select a 3D asset first to run mesh processing operations.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Durable History */}
          {activeRightTab === 'history' && (
            <GenerationHistory
              jobs={jobs}
              selectedJobId={activeJob?.id}
              onSelectJob={(job) => {
                setActiveJob(job)
                if (job.images && job.images.length > 0) {
                  setImages(job.images)
                }
              }}
              onDeleteJob={handleDeleteJob}
              onOpenInStudio={handleOpenInStudio}
              onOpenInCustomizer={handleOpenInCustomizer}
            />
          )}
        </div>
      </div>
    </div>
  )
}

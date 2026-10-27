'use client'

import React, { useState } from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import { useEditorStore } from '@/stores/editor-store'
import { CameraViewPreset, StudioLightingPreset } from '@/types/customization'
import {
  Camera,
  Sun,
  Eye,
  RotateCw,
  Image as ImageIcon,
  Download,
  Maximize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function PreviewControls() {
  const cameraPreset = useCustomizerStore((state) => state.cameraPreset)
  const setCameraPreset = useCustomizerStore((state) => state.setCameraPreset)
  const studioLighting = useCustomizerStore((state) => state.studioLighting)
  const setStudioLighting = useCustomizerStore((state) => state.setStudioLighting)

  const setEditorCameraPreset = useEditorStore((state) => state.setCameraPreset)
  const [autoRotate, setAutoRotate] = useState(false)

  const handleCameraChange = (preset: CameraViewPreset) => {
    setCameraPreset(preset)
    // Synchronize camera controls in viewport
    setEditorCameraPreset(preset as any)
    toast.info(`Camera aligned to ${preset.toUpperCase()} view`)
  }

  const handleTakeScreenshot = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) {
      toast.error('Viewport canvas not found')
      return
    }

    try {
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `customizer_preview_${Date.now()}.png`
      link.href = dataUrl
      link.click()
      toast.success('Downloaded clean product preview screenshot!')
    } catch {
      toast.error('Failed to capture canvas screenshot')
    }
  }

  return (
    <div className="flex items-center gap-1.5 bg-[#12151b] p-1.5 rounded-lg border border-white/10 shadow-lg text-xs">
      {/* Camera Angle Presets */}
      <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5 mr-1">
        {(['perspective', 'front', 'back', 'left', 'right', 'top', 'fit', 'reset'] as const).map((view) => (
          <button
            key={view}
            onClick={() => handleCameraChange(view)}
            className={`px-2 py-1 rounded capitalize text-[11px] font-medium transition-colors ${
              cameraPreset === view
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {view === 'fit' ? 'Fit Product' : view === 'reset' ? 'Reset Camera' : view}
          </button>
        ))}
      </div>

      {/* Studio Lighting Presets */}
      <div className="flex items-center gap-1 border-r border-white/10 pr-1.5 mr-1">
        <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0 ml-1" />
        {(['neutral', 'soft-white', 'dark', 'warm'] as const).map((light) => (
          <button
            key={light}
            onClick={() => {
              setStudioLighting(light)
              toast.info(`Studio lighting: ${light}`)
            }}
            className={`px-1.5 py-0.5 rounded capitalize text-[10px] font-mono transition-colors ${
              studioLighting === light
                ? 'bg-white/15 text-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {light.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Screenshot Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleTakeScreenshot}
        className="h-7 px-2 text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 gap-1"
        title="Capture high-resolution screenshot"
      >
        <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
        Screenshot
      </Button>
    </div>
  )
}

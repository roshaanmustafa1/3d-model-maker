'use client'

import React, { useState, useRef } from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import { validateArtworkFile } from '@/engine/customization/upload-validation'
import {
  Upload,
  Type,
  Square,
  Circle as CircleIcon,
  Star as StarIcon,
  Triangle,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ShapeType } from '@/types/customization'

export function ArtworkToolbar() {
  const activeZoneId = useCustomizerStore((state) => state.activeZoneId)
  const addLayer = useCustomizerStore((state) => state.addLayer)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [textInput, setTextInput] = useState('CUSTOM TEXT')

  const handleFileUpload = (file: File) => {
    if (!activeZoneId) { toast.error('Please select an active design zone first.'); return }
    const zoneId = activeZoneId
    const productId = useCustomizerStore.getState().activeProductId
    validateArtworkFile(file).then(asset => {
      if (useCustomizerStore.getState().activeProductId !== productId) throw new Error('The product changed while the upload was being decoded.')
      const ratio = asset.width / asset.height
      const width = ratio >= 1 ? 500 : 500 * ratio
      const height = ratio >= 1 ? 500 / ratio : 500
      addLayer(zoneId, { name: file.name.replace(/\.[^/.]+$/, ''), type: 'image', assetId: crypto.randomUUID(), src: asset.src, mimeType: file.type, originalWidth: asset.width, originalHeight: asset.height, isSvg: asset.isSvg, x: Math.round(500 - width / 2), y: Math.round(500 - height / 2), width, height, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1, visible: true, locked: false })
      toast.success(asset.isSvg ? 'Added SVG vector graphic to active zone!' : 'Added artwork image to active zone!')
    }).catch(error => toast.error('Upload failed: ' + error.message))
  }

  const handleAddText = () => {
    if (!activeZoneId) {
      toast.error('Please select an active design zone first.')
      return
    }
    if (!textInput.trim()) return

    addLayer(activeZoneId, {
      name: `Text "${textInput.slice(0, 12)}"`,
      type: 'text',
      text: textInput.trim(),
      fontFamily: 'sans-serif',
      fontSize: 54,
      fontWeight: 'bold',
      fontStyle: 'normal',
      fill: '#ffffff',
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.2,
      x: 300,
      y: 460,
      width: 400,
      height: 80,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
    })
    toast.success('Added typography layer!')
  }

  const handleAddShape = (shapeType: ShapeType) => {
    if (!activeZoneId) {
      toast.error('Please select an active design zone first.')
      return
    }

    addLayer(activeZoneId, {
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
      type: 'shape',
      shapeType,
      fill: '#10b981',
      stroke: '#ffffff',
      strokeWidth: 2,
      cornerRadius: shapeType === 'rectangle' ? 12 : undefined,
      x: 350,
      y: 350,
      width: 300,
      height: 300,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
    })
    toast.success(`Added ${shapeType} shape!`)
  }

  return (
    <div className="space-y-4">
      {/* Upload Graphics Button */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Upload Artwork
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFileUpload(f)
            e.target.value = ''
          }}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-8 border-white/10 bg-[#161a22] text-xs text-zinc-200 hover:bg-white/5 hover:border-emerald-500/40 gap-1.5"
        >
          <Upload className="h-3.5 w-3.5 text-emerald-400" />
          Upload Image or SVG
        </Button>
      </div>

      {/* Typography Creator */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Typography
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddText()
            }}
            placeholder="Text to add..."
            className="w-full rounded border border-white/10 bg-[#161a22] px-2.5 py-1 text-xs text-zinc-100 outline-none focus:border-emerald-500"
          />
          <Button
            size="sm"
            onClick={handleAddText}
            className="h-8 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs px-3 font-semibold"
          >
            <Type className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Shapes Creator */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Add Shape
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => handleAddShape('rectangle')}
            className="flex items-center justify-center rounded border border-white/5 bg-[#161a22] py-2 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-colors"
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAddShape('circle')}
            className="flex items-center justify-center rounded border border-white/5 bg-[#161a22] py-2 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-colors"
            title="Circle"
          >
            <CircleIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAddShape('star')}
            className="flex items-center justify-center rounded border border-white/5 bg-[#161a22] py-2 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-colors"
            title="Star"
          >
            <StarIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleAddShape('triangle')}
            className="flex items-center justify-center rounded border border-white/5 bg-[#161a22] py-2 text-zinc-400 hover:text-white hover:border-emerald-500/50 transition-colors"
            title="Triangle"
          >
            <Triangle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

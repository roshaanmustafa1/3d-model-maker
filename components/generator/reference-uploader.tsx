'use client'

import React, { useRef, useState } from 'react'
import { ReferenceImage, ReferenceView } from '@/types/ai-generator'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ReferenceUploaderProps {
  images: ReferenceImage[]
  onImagesChange: (images: ReferenceImage[]) => void
  disabled?: boolean
}

const VIEW_SLOTS: { view: ReferenceView; label: string; description: string; required?: boolean }[] = [
  { view: 'front', label: 'Front View', description: 'Primary reference facing forward', required: true },
  { view: 'back', label: 'Back View', description: 'Rear surface & details' },
  { view: 'left', label: 'Left Side', description: 'Left profile angle' },
  { view: 'right', label: 'Right Side', description: 'Right profile angle' },
  { view: 'detail', label: 'Detail / Angle', description: 'Close-up texture or perspective' },
]

export function ReferenceUploader({ images, onImagesChange, disabled }: ReferenceUploaderProps) {
  const [activeSlot, setActiveSlot] = useState<ReferenceView>('front')
  const [dragOverSlot, setDragOverSlot] = useState<ReferenceView | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndAddImage = async (file: File, view: ReferenceView) => {
    // 1. File size check (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      toast.error(`File "${file.name}" exceeds the 20MB maximum size limit.`)
      return
    }

    // 2. MIME type check
    const validMimes = ['image/png', 'image/jpeg', 'image/webp']
    if (!validMimes.includes(file.type)) {
      toast.error('Invalid image type. Please upload PNG, JPEG, or WebP files.')
      return
    }

    // 3. File signature validation
    try {
      const buffer = await file.slice(0, 16).arrayBuffer()
      const bytes = new Uint8Array(buffer)

      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
      const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
      const isWebp =
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 && // 'RIFF'
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50 // 'WEBP'

      if (!isPng && !isJpg && !isWebp) {
        toast.error('Corrupted file signature. The uploaded file is not a valid PNG, JPEG, or WebP image.')
        return
      }

      // 4. Image decoding validation
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          if (img.naturalWidth < 64 || img.naturalHeight < 64) {
            toast.warning('Image resolution is very low (<64px). Model quality may be reduced.')
          }

          const newImage: ReferenceImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            view,
            dataUrl,
            name: file.name,
            size: file.size,
            mimeType: file.type,
          }

          const filtered = images.filter((i) => i.view !== view)
          onImagesChange([...filtered, newImage])
          toast.success(`Added ${view} reference photo (${img.naturalWidth}×${img.naturalHeight}px)`)
        }
        img.onerror = () => {
          toast.error('Failed to decode image data.')
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    } catch (err) {
      toast.error('Error reading image file: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndAddImage(file, activeSlot)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemove = (view: ReferenceView, e: React.MouseEvent) => {
    e.stopPropagation()
    onImagesChange(images.filter((i) => i.view !== view))
    toast.info(`Removed ${view} reference image`)
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-2 gap-2.5">
        {VIEW_SLOTS.map((slot) => {
          const image = images.find((i) => i.view === slot.view)
          const isDragOver = dragOverSlot === slot.view

          return (
            <div
              key={slot.view}
              onClick={() => {
                if (disabled) return
                setActiveSlot(slot.view)
                fileInputRef.current?.click()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (!disabled) setDragOverSlot(slot.view)
              }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverSlot(null)
                if (disabled) return
                const file = e.dataTransfer.files?.[0]
                if (file) validateAndAddImage(file, slot.view)
              }}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-2 text-center transition-all cursor-pointer ${
                slot.view === 'front' ? 'col-span-2' : ''
              } ${
                image
                  ? 'border-emerald-500/50 bg-[#161a22]'
                  : isDragOver
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-white/10 bg-[#14171e] hover:border-emerald-500/30 hover:bg-[#161a24]'
              }`}
            >
              {image ? (
                <div className="relative w-full group">
                  <img
                    src={image.dataUrl}
                    alt={slot.label}
                    className={`w-full rounded object-contain ${
                      slot.view === 'front' ? 'h-32' : 'h-20'
                    }`}
                  />
                  <div className="mt-1 flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {slot.label}
                    </span>
                    <span className="text-[9px] text-zinc-500">{(image.size / 1024).toFixed(0)} KB</span>
                  </div>

                  {!disabled && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleRemove(slot.view, e)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-zinc-400 hover:text-red-400 hover:bg-black/80 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-2 space-y-1">
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-zinc-400">
                    <Upload className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[11px] font-semibold text-zinc-200">
                    + {slot.label} {slot.required && <span className="text-emerald-400">*</span>}
                  </div>
                  <p className="text-[9px] text-zinc-500">{slot.description}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {images.length === 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-950/20 border border-amber-500/20 rounded p-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Upload at least a front photograph. Multi-view photos produce higher fidelity 3D geometry.</span>
        </div>
      )}
    </div>
  )
}

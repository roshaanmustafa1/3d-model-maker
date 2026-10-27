'use client'

import React, { useRef } from 'react'
import { useCustomizerStore } from '@/stores/customizer-store'
import { useEditorStore } from '@/stores/editor-store'
import { CATALOG_PRODUCTS } from '@/engine/customization/product-catalog'
import { importModelFile } from '@/engine/loaders/model-importer'
import {
  Shirt,
  Box,
  Cylinder,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ProductCategory } from '@/types/customization'
import { bindProduct } from '@/engine/customization/targets'

interface ProductLibraryProps {
  onClose?: () => void
}

export function ProductLibrary({ onClose }: ProductLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeProductId = useCustomizerStore((state) => state.activeProductId)
  const loadProduct = useCustomizerStore((state) => state.loadProduct)
  const loadCustomModel = useCustomizerStore((state) => state.loadCustomModel)

  const loadImportedScene = useEditorStore((state) => state.loadImportedScene)

  const handleSelectCatalogProduct = (item: (typeof CATALOG_PRODUCTS)[0]) => {
    try {
      const sceneData = item.generateScene()
      loadImportedScene(sceneData)

      loadProduct(bindProduct(item.product, sceneData.nodes))
      toast.success(`Loaded ${item.product.name}`)
      onClose?.()
    } catch (err) {
      toast.error('Failed to initialize product: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleImportCustomGLB = async (file: File) => {
    try {
      toast.loading('Analyzing 3D model geometry & UVs...', { id: 'import-loading' })
      const result = await importModelFile(file)
      loadImportedScene(result)

      const meshNodes = Object.values(result.nodes).filter((n) => n.type === 'mesh')
      let category: ProductCategory = 'other'
      const lower = file.name.toLowerCase()
      if (lower.includes('shirt') || lower.includes('tee')) category = 't-shirt'
      else if (lower.includes('hoodie')) category = 'hoodie'
      else if (lower.includes('bottle')) category = 'bottle'
      else if (lower.includes('box')) category = 'box'

      loadCustomModel(
        result.modelName,
        category,
        meshNodes.map((m) => ({
          id: m.id,
          name: m.name,
          customizableZone: m.customizableZone,
        }))
      )

      const missingUVs = meshNodes.filter((m) => !m.geometry?.stats.hasUVs)
      toast.dismiss('import-loading')

      if (missingUVs.length > 0) {
        toast.warning(
          `Model imported with ${missingUVs.length} mesh(es) lacking UVs. Artwork placement may require UV unwrapping.`,
          { duration: 6000 }
        )
      } else {
        toast.success(`Successfully imported ${result.modelName} with verified UV mapping!`)
      }

      onClose?.()
    } catch (err) {
      toast.dismiss('import-loading')
      toast.error('Import failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const getProductIcon = (category: ProductCategory) => {
    switch (category) {
      case 't-shirt':
      case 'hoodie':
      case 'jacket':
        return <Shirt className="h-5 w-5 text-emerald-400" />
      case 'bottle':
        return <Cylinder className="h-5 w-5 text-sky-400" />
      case 'box':
      default:
        return <Box className="h-5 w-5 text-amber-400" />
    }
  }

  return (
    <div className="space-y-4 text-zinc-100">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Product Studio Library</h3>
          <p className="text-xs text-zinc-400">Select a verified customizable product or import custom 3D assets</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf,.obj"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImportCustomGLB(file)
          }}
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 border-white/15 bg-[#181c24] text-xs text-zinc-200 hover:bg-white/10 gap-1.5"
        >
          <Upload className="h-3.5 w-3.5 text-emerald-400" />
          Import Custom GLB/glTF
        </Button>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {CATALOG_PRODUCTS.map((item) => {
          const isSelected = activeProductId === item.product.id
          return (
            <div
              key={item.product.id}
              onClick={() => handleSelectCatalogProduct(item)}
              className={`group relative rounded-lg border p-3.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                  : 'border-white/10 bg-[#161a22] hover:border-white/20 hover:bg-[#1a202c]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-[#12151b]">
                    {getProductIcon(item.product.category)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">
                      {item.product.category}
                    </span>
                  </div>
                </div>

                {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              </div>

              <p className="mt-2.5 text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                {item.product.description}
              </p>

              <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span className="rounded bg-white/5 px-1.5 py-0.5 border border-white/10">
                  {item.product.defaultZones.length} Design Zones
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> UV Verified
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

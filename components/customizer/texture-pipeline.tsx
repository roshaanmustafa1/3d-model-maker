'use client'
import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { useCustomizerStore } from '@/stores/customizer-store'
import { useDerivedMaterialStore } from '@/stores/derived-material-store'
import { composeMaterials, disposeComposedTargets, ComposedTarget } from '@/engine/customization/material-composition'
import { clearArtworkImageCache } from '@/engine/customization/texture-composer'
import { toast } from 'sonner'

export function TexturePipeline() {
  const owned = useRef<ComposedTarget[]>([])
  const nodes = useEditorStore(state => state.nodes)
  const materials = useEditorStore(state => state.materials)
  const zones = useCustomizerStore(state => state.zones)
  const overrides = useCustomizerStore(state => state.partMaterials)
  const resolution = useCustomizerStore(state => state.textureResolution)
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      composeMaterials(nodes, materials, useCustomizerStore.getState().exportProjectData(), resolution).then(targets => {
        if (cancelled) { disposeComposedTargets(targets); return }
        const previous = owned.current
        owned.current = targets
        useDerivedMaterialStore.getState().publish(targets)
        disposeComposedTargets(previous)
      }).catch(error => { if (!cancelled) toast.error(error.message) })
    }, 40)
    return () => {
      cancelled = true; clearTimeout(timer)
    }
  }, [nodes, materials, zones, overrides, resolution])
  useEffect(() => () => {
    useDerivedMaterialStore.getState().publish([])
    disposeComposedTargets(owned.current)
    owned.current = []
    clearArtworkImageCache()
  }, [])
  return null
}

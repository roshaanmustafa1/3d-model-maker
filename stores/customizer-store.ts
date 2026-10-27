import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  ArtworkLayer,
  NewArtworkLayer,
  DesignZone,
  CustomizableProduct,
  CustomizationProject,
  ProductCategory,
  FabricPreset,
  TextureResolution,
  BlackBulletAppearanceMode,
  CameraViewPreset,
  StudioLightingPreset,
} from '@/types/customization'
import { CATALOG_PRODUCTS } from '@/engine/customization/product-catalog'
import { FABRIC_PRESETS, getFabricPresetById } from '@/engine/customization/fabric-presets'
import { useEditorStore } from './editor-store'
import type { MaterialData, SceneNode } from '@/types/scene'
import { resolveTarget, bindZones } from '@/engine/customization/targets'

interface HistorySnapshot {
  partMaterials?: Record<string, Partial<MaterialData>>
  zones: Record<string, DesignZone>
  activeZoneId: string
  fabricColor: string
  fabricRoughness: number
  fabricMetalness: number
}

export interface CustomizerState {
  partMaterials: Record<string, Partial<MaterialData>>
  // Active product & meta
  activeProductId: string
  productName: string
  productCategory: ProductCategory
  sourceType: 'preset' | 'imported' | 'project'

  // Zones & Layers
  zones: Record<string, DesignZone>
  activeZoneId: string
  activeLayerId: string | null
  clipboardLayer: ArtworkLayer | null

  // Fabric & Materials
  fabricColor: string
  fabricRoughness: number
  fabricMetalness: number
  fabricPresetId?: string

  // Studio & Viewport
  cameraPreset: CameraViewPreset
  studioLighting: StudioLightingPreset
  textureResolution: TextureResolution
  blackBulletMode: BlackBulletAppearanceMode

  // UI state
  is2DCanvasExpanded: boolean
  isBaking: boolean
  hasUnsavedChanges: boolean

  // Undo / Redo
  history: HistorySnapshot[]
  historyIndex: number

  // Actions
  loadProduct: (product: CustomizableProduct) => void
  loadCustomModel: (name: string, category: ProductCategory, meshNodes: Array<{ id: string; name: string; customizableZone?: string }>) => void
  setActiveZone: (zoneId: string) => void
  addZone: (zone: DesignZone) => void
  updateZone: (zoneId: string, updates: Partial<DesignZone>) => void
  removeZone: (zoneId: string) => void

  // Layer actions
  addLayer: (zoneId: string, layer: NewArtworkLayer) => string
  updateLayer: (zoneId: string, layerId: string, updates: Partial<ArtworkLayer>) => void
  removeLayer: (zoneId: string, layerId: string) => void
  reorderLayers: (zoneId: string, fromIndex: number, toIndex: number) => void
  duplicateLayer: (zoneId: string, layerId: string) => string | null
  setActiveLayer: (layerId: string | null) => void
  copyLayer: (zoneId: string, layerId: string) => void
  pasteLayer: (zoneId: string) => string | null

  // Surface & Material actions
  setFabricColor: (color: string) => void
  setFabricPreset: (preset: FabricPreset) => void
  setFabricRoughness: (roughness: number) => void
  setFabricMetalness: (metalness: number) => void

  // Studio controls
  setCameraPreset: (preset: CameraViewPreset) => void
  setStudioLighting: (preset: StudioLightingPreset) => void
  setTextureResolution: (res: TextureResolution) => void
  setBlackBulletMode: (mode: BlackBulletAppearanceMode) => void
  toggle2DCanvasExpanded: () => void
  setIsBaking: (baking: boolean) => void

  // Undo / Redo
  undo: () => void
  redo: () => void
  recordHistory: () => void

  // Project persistence
  exportProjectData: () => CustomizationProject
  importProjectData: (project: CustomizationProject) => void
}

const defaultProduct = CATALOG_PRODUCTS[0].product
const defaultFabric = FABRIC_PRESETS[0]

const initialZones: Record<string, DesignZone> = {}
for (const zone of defaultProduct.defaultZones) {
  initialZones[zone.id] = { ...zone }
}

export const useCustomizerStore = create<CustomizerState>()(
  immer((set, get) => ({
    partMaterials: {},
    activeProductId: defaultProduct.id,
    productName: defaultProduct.name,
    productCategory: defaultProduct.category,
    sourceType: 'preset',

    zones: initialZones,
    activeZoneId: defaultProduct.defaultZones[0]?.id || 'body_front',
    activeLayerId: null,
    clipboardLayer: null,

    fabricColor: defaultFabric.color,
    fabricRoughness: defaultFabric.roughness,
    fabricMetalness: defaultFabric.metalness,
    fabricPresetId: defaultFabric.id,

    cameraPreset: 'perspective',
    studioLighting: 'neutral',
    textureResolution: 1024,
    blackBulletMode: 'preserve-imported',

    is2DCanvasExpanded: false,
    isBaking: false,
    hasUnsavedChanges: false,

    history: [
      {
        zones: JSON.parse(JSON.stringify(initialZones)),
        activeZoneId: defaultProduct.defaultZones[0]?.id || 'body_front',
        fabricColor: defaultFabric.color,
        fabricRoughness: defaultFabric.roughness,
        fabricMetalness: defaultFabric.metalness,
      },
    ],
    historyIndex: 0,

    recordHistory: () => {
      set((state) => {
        const snapshot: HistorySnapshot = {
          partMaterials: JSON.parse(JSON.stringify(state.partMaterials)),
          zones: JSON.parse(JSON.stringify(state.zones)),
          activeZoneId: state.activeZoneId,
          fabricColor: state.fabricColor,
          fabricRoughness: state.fabricRoughness,
          fabricMetalness: state.fabricMetalness,
        }

        // Truncate forward history if recording after undo
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(snapshot)
        if (newHistory.length > 30) newHistory.shift()

        state.history = newHistory
        state.historyIndex = newHistory.length - 1
        state.hasUnsavedChanges = true
      })
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex--
          const snap = state.history[state.historyIndex]
          state.partMaterials = JSON.parse(JSON.stringify(snap.partMaterials || {}))
          state.zones = JSON.parse(JSON.stringify(snap.zones))
          state.activeZoneId = snap.activeZoneId
          state.fabricColor = snap.fabricColor
          state.fabricRoughness = snap.fabricRoughness
          state.fabricMetalness = snap.fabricMetalness
        }
      })
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex++
          const snap = state.history[state.historyIndex]
          state.partMaterials = JSON.parse(JSON.stringify(snap.partMaterials || {}))
          state.zones = JSON.parse(JSON.stringify(snap.zones))
          state.activeZoneId = snap.activeZoneId
          state.fabricColor = snap.fabricColor
          state.fabricRoughness = snap.fabricRoughness
          state.fabricMetalness = snap.fabricMetalness
        }
      })
    },

    loadProduct: (product) => {
      set((state) => {
        state.partMaterials = {}
        state.activeProductId = product.id
        state.productName = product.name
        state.productCategory = product.category
        state.sourceType = product.sourceType

        const newZones: Record<string, DesignZone> = {}
        for (const zone of product.defaultZones) {
          newZones[zone.id] = { ...zone, layers: [] }
        }
        state.zones = newZones
        state.activeZoneId = product.defaultZones[0]?.id || 'body_front'
        state.activeLayerId = null

        if (product.defaultFabricPreset) {
          const fab = getFabricPresetById(product.defaultFabricPreset)
          if (fab) {
            state.fabricColor = fab.color
            state.fabricRoughness = fab.roughness
            state.fabricMetalness = fab.metalness
            state.fabricPresetId = fab.id
          }
        }

        const active = newZones[state.activeZoneId]
        const activeNode = active && useEditorStore.getState().nodes[active.targetMeshNodeId]
        const source = activeNode && useEditorStore.getState().materials[activeNode.materialId || '']
        if (source) { state.fabricColor = source.color; state.fabricRoughness = source.roughness; state.fabricMetalness = source.metalness }

        state.history = [
          {
            zones: JSON.parse(JSON.stringify(newZones)),
            activeZoneId: state.activeZoneId,
            fabricColor: state.fabricColor,
            fabricRoughness: state.fabricRoughness,
            fabricMetalness: state.fabricMetalness,
          },
        ]
        state.historyIndex = 0
        state.hasUnsavedChanges = false
      })
    },

    loadCustomModel: (name, category, meshNodes) => {
      set((state) => {
        state.partMaterials = {}
        state.activeProductId = `custom_${Date.now()}`
        state.productName = name
        state.productCategory = category
        state.sourceType = 'imported'

        const newZones: Record<string, DesignZone> = {}
        meshNodes.forEach((node, index) => {
          const actualNode = useEditorStore.getState().nodes[node.id] || { ...node, type: 'mesh' } as SceneNode
          const slots = Math.max(1, actualNode.materialIds?.length || 0)
          for (let slot = 0; slot < slots; slot++) {
            const requestedId = node.customizableZone || 'zone_' + index + '_' + node.name.toLowerCase().replace(/\s+/g, '_')
            const zoneId = newZones[requestedId] || slot ? requestedId + '_' + index + '_' + slot : requestedId
            const target = resolveTarget(state.activeProductId, actualNode, slot)
            newZones[zoneId] = { id: zoneId, name: node.name + (slots > 1 ? ' / material ' + slot : ''), targetMeshNodeId: node.id, targetMeshName: node.name, materialSlotIndex: slot, uvBounds: target.uvBounds, target, canvasWidth: 1024, canvasHeight: 1024, layers: [], enabled: true }
          }
        })

        state.zones = newZones
        const firstZoneId = Object.keys(newZones)[0] || 'body_front'
        state.activeZoneId = firstZoneId
        state.activeLayerId = null
        const firstNode = useEditorStore.getState().nodes[newZones[firstZoneId]?.targetMeshNodeId]
        const firstSource = firstNode && useEditorStore.getState().materials[firstNode.materialId || '']
        if (firstSource) { state.fabricColor = firstSource.color; state.fabricRoughness = firstSource.roughness; state.fabricMetalness = firstSource.metalness; state.fabricPresetId = undefined }

        state.history = [
          {
            zones: JSON.parse(JSON.stringify(newZones)),
            activeZoneId: firstZoneId,
            fabricColor: state.fabricColor,
            fabricRoughness: state.fabricRoughness,
            fabricMetalness: state.fabricMetalness,
          },
        ]
        state.historyIndex = 0
        state.hasUnsavedChanges = false
      })
    },

    setActiveZone: (zoneId) => {
      set((state) => {
        if (state.zones[zoneId]) {
          state.activeZoneId = zoneId
          state.activeLayerId = null
          const zone = state.zones[zoneId]
          const node = useEditorStore.getState().nodes[zone.targetMeshNodeId]
          const source = node && useEditorStore.getState().materials[node.materialIds?.[zone.materialSlotIndex] || node.materialId || '']
          const override = state.partMaterials[`${zone.targetMeshNodeId}:${zone.materialSlotIndex}`]
          if (source) {
            state.fabricColor = override?.color || source.color
            state.fabricRoughness = override?.roughness ?? source.roughness
            state.fabricMetalness = override?.metalness ?? source.metalness
          }
        }
      })
    },

    addZone: (zone) => {
      set((state) => {
        state.zones[zone.id] = zone
      })
      get().recordHistory()
    },

    updateZone: (zoneId, updates) => {
      set((state) => {
        if (state.zones[zoneId]) {
          state.zones[zoneId] = { ...state.zones[zoneId], ...updates }
        }
      })
      get().recordHistory()
    },

    removeZone: (zoneId) => {
      set((state) => {
        delete state.zones[zoneId]
        if (state.activeZoneId === zoneId) {
          state.activeZoneId = Object.keys(state.zones)[0] || ''
        }
      })
      get().recordHistory()
    },

    addLayer: (zoneId, layerData) => {
      const id = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      set((state) => {
        const zone = state.zones[zoneId]
        if (!zone) return

        const maxZ = zone.layers.reduce((max, l) => Math.max(max, l.zIndex), 0)
        const newLayer = {
          ...layerData,
          id,
          zIndex: maxZ + 1,
        } as ArtworkLayer

        zone.layers.push(newLayer)
        state.activeLayerId = id
      })
      get().recordHistory()
      return id
    },

    updateLayer: (zoneId, layerId, updates) => {
      set((state) => {
        const zone = state.zones[zoneId]
        if (!zone) return
        const idx = zone.layers.findIndex((l) => l.id === layerId)
        if (idx !== -1) {
          zone.layers[idx] = { ...zone.layers[idx], ...updates } as ArtworkLayer
        }
      })
      // Debounce or record history only on deliberate commits where appropriate
    },

    removeLayer: (zoneId, layerId) => {
      set((state) => {
        const zone = state.zones[zoneId]
        if (!zone) return
        zone.layers = zone.layers.filter((l) => l.id !== layerId)
        if (state.activeLayerId === layerId) {
          state.activeLayerId = null
        }
      })
      get().recordHistory()
    },

    reorderLayers: (zoneId, fromIndex, toIndex) => {
      set((state) => {
        const zone = state.zones[zoneId]
        if (!zone) return
        const [moved] = zone.layers.splice(fromIndex, 1)
        if (moved) {
          zone.layers.splice(toIndex, 0, moved)
          zone.layers.forEach((l, i) => {
            l.zIndex = i + 1
          })
        }
      })
      get().recordHistory()
    },

    duplicateLayer: (zoneId, layerId) => {
      let newId: string | null = null
      set((state) => {
        const zone = state.zones[zoneId]
        if (!zone) return
        const original = zone.layers.find((l) => l.id === layerId)
        if (!original) return

        newId = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const maxZ = zone.layers.reduce((max, l) => Math.max(max, l.zIndex), 0)
        const clone = {
          ...JSON.parse(JSON.stringify(original)),
          id: newId,
          name: `${original.name} (Copy)`,
          x: original.x + 20,
          y: original.y + 20,
          zIndex: maxZ + 1,
        }
        zone.layers.push(clone)
        state.activeLayerId = newId
      })
      if (newId) get().recordHistory()
      return newId
    },

    setActiveLayer: (layerId) => {
      set((state) => {
        state.activeLayerId = layerId
      })
    },

    copyLayer: (zoneId, layerId) => {
      set((state) => {
        const zone = state.zones[zoneId]
        const layer = zone?.layers.find((l) => l.id === layerId)
        if (layer) {
          state.clipboardLayer = JSON.parse(JSON.stringify(layer))
        }
      })
    },

    pasteLayer: (zoneId) => {
      let pastedId: string | null = null
      set((state) => {
        if (!state.clipboardLayer) return
        const zone = state.zones[zoneId]
        if (!zone) return

        pastedId = `layer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        const maxZ = zone.layers.reduce((max, l) => Math.max(max, l.zIndex), 0)
        const clone = {
          ...JSON.parse(JSON.stringify(state.clipboardLayer)),
          id: pastedId,
          name: `${state.clipboardLayer.name} (Pasted)`,
          x: state.clipboardLayer.x + 25,
          y: state.clipboardLayer.y + 25,
          zIndex: maxZ + 1,
        }
        zone.layers.push(clone)
        state.activeLayerId = pastedId
      })
      if (pastedId) get().recordHistory()
      return pastedId
    },

    setFabricColor: (color) => {
      set((state) => {
        state.fabricColor = color
        const zone = state.zones[state.activeZoneId]
        if (zone) {
          const key = `${zone.targetMeshNodeId}:${zone.materialSlotIndex}`
          state.partMaterials[key] = { ...state.partMaterials[key], color }
        }
      })
      get().recordHistory()
    },

    setFabricPreset: (preset) => {
      set((state) => {
        state.fabricColor = preset.color
        state.fabricRoughness = preset.roughness
        state.fabricMetalness = preset.metalness
        state.fabricPresetId = preset.id
        const zone = state.zones[state.activeZoneId]
        if (zone) state.partMaterials[`${zone.targetMeshNodeId}:${zone.materialSlotIndex}`] = { color: preset.color, roughness: preset.roughness, metalness: preset.metalness }
      })
      get().recordHistory()
    },

    setFabricRoughness: (roughness) => {
      set((state) => {
        state.fabricRoughness = roughness
        const zone = state.zones[state.activeZoneId]
        if (zone) { const key = `${zone.targetMeshNodeId}:${zone.materialSlotIndex}`; state.partMaterials[key] = { ...state.partMaterials[key], roughness } }
      })
      get().recordHistory()
    },

    setFabricMetalness: (metalness) => {
      set((state) => {
        state.fabricMetalness = metalness
        const zone = state.zones[state.activeZoneId]
        if (zone) { const key = `${zone.targetMeshNodeId}:${zone.materialSlotIndex}`; state.partMaterials[key] = { ...state.partMaterials[key], metalness } }
      })
      get().recordHistory()
    },

    setCameraPreset: (preset) => {
      set((state) => {
        state.cameraPreset = preset
      })
    },

    setStudioLighting: (preset) => {
      set((state) => {
        state.studioLighting = preset
      })
    },

    setTextureResolution: (res) => {
      set((state) => {
        state.textureResolution = res
      })
    },

    setBlackBulletMode: (mode) => {
      set((state) => {
        state.blackBulletMode = mode
      })
    },

    toggle2DCanvasExpanded: () => {
      set((state) => {
        state.is2DCanvasExpanded = !state.is2DCanvasExpanded
      })
    },

    setIsBaking: (baking) => {
      set((state) => {
        state.isBaking = baking
      })
    },

    exportProjectData: () => {
      const state = get()
      return {
        id: `custom_proj_${Date.now()}`,
        name: state.productName,
        version: 4,
        sourceType: state.sourceType,
        workspace: useEditorStore.getState().activeWorkspace === 'customizer' ? 'customizer' : 'editor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productId: state.activeProductId,
        productName: state.productName,
        productCategory: state.productCategory,
        activeZoneId: state.activeZoneId,
        zones: JSON.parse(JSON.stringify(state.zones)),
        fabricColor: state.fabricColor,
        fabricRoughness: state.fabricRoughness,
        fabricMetalness: state.fabricMetalness,
        fabricPresetId: state.fabricPresetId,
        partMaterials: JSON.parse(JSON.stringify(state.partMaterials)),
        textureResolution: state.textureResolution,
        blackBulletMode: state.blackBulletMode,
      }
    },

    importProjectData: (project) => {
      set((state) => {
        state.sourceType = project.sourceType || 'project'
        state.partMaterials = JSON.parse(JSON.stringify(project.partMaterials || {}))
        state.activeProductId = project.productId
        state.productName = project.productName
        state.productCategory = project.productCategory
        state.zones = bindZones(JSON.parse(JSON.stringify(project.zones)), project.productId, useEditorStore.getState().nodes)
        if (project.version === 3) for (const zone of Object.values(state.zones)) for (const layer of zone.layers) {
          if (layer.type === 'shape' && (layer.shapeType === 'star' || layer.shapeType === 'circle')) { layer.x -= layer.width / 2; layer.y -= layer.height / 2 }
        }
        state.activeZoneId = project.activeZoneId || Object.keys(project.zones)[0] || 'body_front'
        state.fabricColor = project.fabricColor
        state.fabricRoughness = project.fabricRoughness
        state.fabricMetalness = project.fabricMetalness
        state.fabricPresetId = project.fabricPresetId
        state.textureResolution = project.textureResolution || 1024
        state.blackBulletMode = project.blackBulletMode || 'preserve-imported'

        state.history = [
          {
            partMaterials: JSON.parse(JSON.stringify(state.partMaterials)),
            zones: JSON.parse(JSON.stringify(state.zones)),
            activeZoneId: state.activeZoneId,
            fabricColor: state.fabricColor,
            fabricRoughness: state.fabricRoughness,
            fabricMetalness: state.fabricMetalness,
          },
        ]
        state.historyIndex = 0
        state.hasUnsavedChanges = false
      })
    },
  }))
)

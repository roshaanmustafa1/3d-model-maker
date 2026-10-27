import { selectFaceRegion } from '@/engine/topology/face-regions'
import { partitionGeometry } from '@/engine/topology/mesh-partition'
import { markUVSeams, packUVIslands } from '@/engine/topology/uv-preparation'
import { sceneTransaction } from '@/engine/scene/scene-transaction'
import { pruneSceneResources } from '@/engine/scene/resource-lifecycle'
import { switchWorkspaceScene } from '@/engine/scene/workspaces'
import { geometryTransaction } from '@/engine/topology/geometry-transaction'
import { applyObjectSelection } from '@/engine/scene/selection-state'
import { EditorMode, SelectionSubMode, EditModeOverlaySettings } from '@/types/topology'
import { getTopologyForNode, removeTopologyForNode, setTopologyForNode } from '@/engine/topology/topology-cache'
import { updateBufferGeometryPositions, rebuildBufferGeometryFromTopology, cloneTopologyGraph } from '@/engine/topology/topology-graph'
import { getVerticesFromEdges, getVerticesFromFaces } from '@/engine/topology/topology-raycaster'
import {
  extrudeFaces,
  insetFaces,
  subdivideFaces,
  mergeVertices,
  deleteTopologyElements,
  flipTopologyNormals,
  getConnectedMeshComponents,
} from '@/engine/topology/geometry-operators'
import {
  applyBoxProjection,
  applyPlanarProjection,
  applyCylindricalProjection,
  transformUVSelection,
} from '@/engine/topology/uv-unwrapper'
import { createBufferGeometry, calculateGeometryStats, registerCustomGeometry } from '@/engine/scene/primitive-factory'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  SceneNode,
  MaterialData,
  EnvironmentSettings,
  GeometryType,
  TransformData,
} from '@/types/scene'
import {
  TransformMode,
  TransformSpace,
  ViewMode,
  CameraViewPreset,
  WorkspaceType,
  EditorStats,
  HistoryCommand,
} from '@/types/editor'
import { createDefaultGeometryDefinition } from '@/engine/scene/primitive-factory'
import { MATERIAL_PRESETS } from '@/engine/scene/material-manager'
import { ImportResult } from '@/engine/loaders/model-importer'

export interface DiagnosticOverlaySettings {
  enabled: boolean
  showBoundaryEdges: boolean
  showNonManifoldEdges: boolean
  showDegenerateFaces: boolean
  showComponents: boolean
}

export interface EditorState {
  // Scene Graph
  nodes: Record<string, SceneNode>
  rootNodeIds: string[]
  selectedNodeId: string | null
  selectedNodeIds: string[]
  hoveredNodeId: string | null
  materials: Record<string, MaterialData>
  environment: EnvironmentSettings

  // Editor configuration
  transformMode: TransformMode
  transformSpace: TransformSpace
  viewMode: ViewMode
  cameraPreset: CameraViewPreset
  cameraCommandId: number
  activeWorkspace: WorkspaceType
  showTopologyOverlay: boolean

  // Diagnostics & Overlays
  diagnosticOverlay: DiagnosticOverlaySettings

  // Live real-time statistics
  stats: EditorStats

  // Undo / Redo
  history: {
    past: HistoryCommand[]
    future: HistoryCommand[]
  }

  // Modals & Dialogs
  activeModal: 'export' | 'import' | 'validator' | 'shortcuts' | null

  // Selection Actions
  selectNode: (id: string | null) => void
  selectObjects: (ids: string[], primary?: string | null) => void
  selectObject: (id: string | null) => void
  clearObjectSelection: () => void
  toggleObjectSelection: (id: string, multiSelect?: boolean) => void
  clearTopologySelection: () => void
  setShowTopologyOverlay: (show: boolean) => void
  setDiagnosticOverlay: (settings: Partial<DiagnosticOverlaySettings>) => void
  safeRepairMesh: (options?: { removeDegenerate?: boolean; weldCoincident?: boolean; tolerance?: number }) => { removedDegenerate: number; weldedVertices: number }

  setHoveredNode: (id: string | null) => void
  addPrimitive: (type: GeometryType) => string
  addEmptyGroup: () => string
  deleteNode: (id: string) => void
  duplicateNode: (id: string) => string | null
  renameNode: (id: string, name: string) => void
  toggleNodeVisibility: (id: string) => void
  toggleNodeLock: (id: string) => void
  updateNodeTransform: (id: string, transform: Partial<TransformData>, recordUndo?: boolean) => void
  updateNode: (id: string, updates: Partial<SceneNode>) => void
  reorderNode: (draggedId: string, targetParentId: string | null) => void

  // Materials
  createMaterial: (name?: string, preset?: Partial<MaterialData>) => string
  updateMaterial: (id: string, updates: Partial<MaterialData>, recordUndo?: boolean) => void
  assignMaterial: (nodeId: string, materialId: string, slot?: number) => void

  // Tools & Viewport
  setTransformMode: (mode: TransformMode) => void
  setTransformSpace: (space: TransformSpace) => void
  setViewMode: (mode: ViewMode) => void
  setCameraPreset: (preset: CameraViewPreset) => void
  setActiveWorkspace: (workspace: WorkspaceType) => void
  updateEnvironment: (updates: Partial<EnvironmentSettings>) => void
  updateStats: (updates: Partial<EditorStats>) => void
  openModal: (modal: 'export' | 'import' | 'validator' | 'shortcuts' | null) => void

  // Command History
  undo: () => void
  redo: () => void
  recordCommand: (command: HistoryCommand) => void

  // Modeling Mode & Topology Selection (Phase 2 Milestone 2.1)
  editorMode: EditorMode
  selectionSubMode: SelectionSubMode
  selectedVertexIds: number[]
  selectedEdgeIds: number[]
  selectedFaceIds: number[]
  editModeOverlayVisible: EditModeOverlaySettings

  // Edit Mode Actions
  setEditorMode: (mode: EditorMode) => void
  toggleEditorMode: () => void
  setSelectionSubMode: (subMode: SelectionSubMode) => void
  setSelectedVertices: (ids: number[]) => void
  setSelectedEdges: (ids: number[]) => void
  setSelectedFaces: (ids: number[]) => void
  toggleVertexSelection: (id: number, multiSelect?: boolean) => void
  toggleEdgeSelection: (id: number, multiSelect?: boolean) => void
  toggleFaceSelection: (id: number, multiSelect?: boolean) => void
  selectAllSubElements: () => void
  clearSubSelection: () => void
  setEditModeOverlayVisible: (settings: Partial<EditModeOverlaySettings>) => void
  translateSelectedTopologyVertices: (delta: [number, number, number], recordUndo?: boolean) => void

  // Advanced Modeling Operations (Phase 2 Milestone 2.2)
  extrudeSelectedFaces: (distance?: number, individual?: boolean) => void
  insetSelectedFaces: (amount?: number, depth?: number) => void
  subdivideSelectedFaces: () => void
  mergeSelectedVertices: (mode?: 'center' | 'distance', tolerance?: number) => void
  deleteSelectedTopologyElements: () => void
  flipSelectedNormals: () => void
  separateSelectedMesh: (mode?: 'selected' | 'components' | 'materials') => string[]

  selectFaceRegion: (mode: 'connected' | 'grow' | 'shrink') => void
  markSelectedUVSeams: (marked: boolean) => void
  packUVIslands: () => void

  // UV Workspace (Phase 2 Milestone 2.4)
  applyUVProjection: (type: 'box' | 'planar' | 'cylindrical', axis?: 'x' | 'y' | 'z') => void
  transformSelectedUVs: (deltaU: number, deltaV: number, scaleU?: number, scaleV?: number, angleDeg?: number) => void

  // Multi-material Slots & Face Assignment (Phase 2 Milestone 2.3)
  assignMaterialToSelectedFaces: (materialId: string) => void
  addMaterialSlot: (nodeId: string, materialId: string) => void
  removeMaterialSlot: (nodeId: string, slotIndex: number) => void

  // Serialization & Importers
  loadImportedScene: (result: ImportResult) => void
  resetScene: () => void
  recalculateSceneStats: () => void
}

const defaultEnvironment: EnvironmentSettings = {
  preset: 'studio',
  background: false,
  blur: 0.6,
  ambientIntensity: 0.7,
  directionalIntensity: 1.2,
  shadows: true,
  grid: true,
  axes: true,
}

// Initial default material
const defaultMaterialId = 'mat_default_studio'
const initialMaterials: Record<string, MaterialData> = {
  [defaultMaterialId]: {
    id: defaultMaterialId,
    name: 'Default Studio Material',
    color: '#38bdf8', // pleasant cyan/sky default
    roughness: 0.35,
    metalness: 0.1,
    emissive: '#000000',
    emissiveIntensity: 0,
    opacity: 1,
    transparent: false,
    wireframe: false,
    doubleSided: true,
  },
}

// Initial default primitive: Cube
const initialNodeId = 'node_init_cube'
const initialCubeGeom = createDefaultGeometryDefinition('box')
const initialNodes: Record<string, SceneNode> = {
  [initialNodeId]: {
    id: initialNodeId,
    name: 'Studio_Cube',
    type: 'mesh',
    parentId: null,
    children: [],
    transform: {
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    geometry: initialCubeGeom,
    materialId: defaultMaterialId,
    visible: true,
    locked: false,
    semanticTag: 'Studio_Cube',
  },
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    nodes: initialNodes,
    rootNodeIds: [initialNodeId],
    selectedNodeId: initialNodeId,
    selectedNodeIds: [initialNodeId],
    hoveredNodeId: null,
    materials: initialMaterials,
    environment: defaultEnvironment,

    transformMode: 'translate',
    transformSpace: 'world',
    viewMode: 'solid',
    cameraPreset: 'perspective',
    cameraCommandId: 0,
    activeWorkspace: 'editor',
    showTopologyOverlay: false,

    diagnosticOverlay: {
      enabled: false,
      showBoundaryEdges: true,
      showNonManifoldEdges: true,
      showDegenerateFaces: true,
      showComponents: false,
    },

    stats: {
      fps: 60,
      totalVertices: initialCubeGeom.stats.vertexCount,
      totalTriangles: initialCubeGeom.stats.triangleCount,
      meshCount: 1,
      materialCount: 1,
      selectedVertices: initialCubeGeom.stats.vertexCount,
      selectedTriangles: initialCubeGeom.stats.triangleCount,
    },

    history: {
      past: [],
      future: [],
    },

    activeModal: null,

    // Modeling Mode & Topology Selection (Milestone 2.1)
    editorMode: 'object',
    selectionSubMode: 'vertex',
    selectedVertexIds: [],
    selectedEdgeIds: [],
    selectedFaceIds: [],
    editModeOverlayVisible: {
      vertices: true,
      edges: true,
      faces: true,
      normals: false,
      wireframe: true,
    },

    selectNode: (id) => set((state) => applyObjectSelection(state, id ? [id] : [])),
    selectObjects: (ids, primary) => set((state) => applyObjectSelection(state, ids, primary)),
    selectObject: (id) => get().selectNode(id),
    clearObjectSelection: () => get().selectNode(null),
    toggleObjectSelection: (id, multiSelect = false) => set((state) => {
      const selected = state.selectedNodeIds.includes(id)
      const ids = multiSelect ? selected ? state.selectedNodeIds.filter((key) => key !== id) : [...state.selectedNodeIds, id] : selected && state.selectedNodeIds.length === 1 ? [] : [id]
      applyObjectSelection(state, ids, selected ? undefined : id)
    }),

    clearTopologySelection: () =>
      set((state) => {
        state.selectedVertexIds = []
        state.selectedEdgeIds = []
        state.selectedFaceIds = []
      }),

    setShowTopologyOverlay: (show) =>
      set((state) => {
        state.showTopologyOverlay = show
      }),

    setDiagnosticOverlay: (settings) =>
      set((state) => {
        Object.assign(state.diagnosticOverlay, settings)
      }),

    safeRepairMesh: (options = { removeDegenerate: true, weldCoincident: false, tolerance: 0.001 }) => {
      const selectedId = get().selectedNodeId
      if (!selectedId) return { removedDegenerate: 0, weldedVertices: 0 }
      const node = get().nodes[selectedId]
      if (!node || node.type !== 'mesh' || !node.geometry) return { removedDegenerate: 0, weldedVertices: 0 }

      const geom = createBufferGeometry(
        node.geometry.type,
        node.geometry.params,
        node.geometry.customGeometryKey
      )
      const graph = getTopologyForNode(node.id, geom)
      let removedDegenerate = 0
      let weldedVertices = 0

      // 1. Identify and remove degenerate faces (area < 1e-10 or duplicate vertices)
      if (options.removeDegenerate) {
        const degenerateFaceIds: number[] = []
        for (const [fId, face] of graph.faces.entries()) {
          const [v0, v1, v2] = face.vertexIds
          if (v0 === v1 || v1 === v2 || v2 === v0) {
            degenerateFaceIds.push(fId)
            continue
          }
          const p0 = graph.vertices.get(v0)!.position
          const p1 = graph.vertices.get(v1)!.position
          const p2 = graph.vertices.get(v2)!.position
          const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2]
          const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2]
          const cx = ay * bz - az * by
          const cy = az * bx - ax * bz
          const cz = ax * by - ay * bx
          const area = 0.5 * Math.hypot(cx, cy, cz)
          if (area < 1e-10) {
            degenerateFaceIds.push(fId)
          }
        }

        if (degenerateFaceIds.length > 0) {
          deleteTopologyElements(graph, 'face', degenerateFaceIds)
          removedDegenerate = degenerateFaceIds.length
        }
      }

      // 2. Safely weld coincident vertices if explicitly requested (does NOT close legitimate garment openings)
      if (options.weldCoincident && options.tolerance) {
        const tol = options.tolerance
        const vertList = Array.from(graph.vertices.values())
        const pairsToWeld: number[] = []
        for (let i = 0; i < vertList.length; i++) {
          for (let j = i + 1; j < vertList.length; j++) {
            const vi = vertList[i]
            const vj = vertList[j]
            const dist = Math.hypot(
              vi.position[0] - vj.position[0],
              vi.position[1] - vj.position[1],
              vi.position[2] - vj.position[2]
            )
            if (dist < tol) {
              pairsToWeld.push(vi.id, vj.id)
            }
          }
        }
        if (pairsToWeld.length > 0) {
          const res = mergeVertices(graph, Array.from(new Set(pairsToWeld)), { mode: 'distance', tolerance: tol })
          weldedVertices = res.mergedVerticesCount
        }
      }

      if (removedDegenerate > 0 || weldedVertices > 0) {
        const newGeom = rebuildBufferGeometryFromTopology(graph)
        const customKey = `custom_${node.id}_${Date.now()}`
        registerCustomGeometry(customKey, newGeom)
        setTopologyForNode(node.id, graph)

        const newStats = calculateGeometryStats(newGeom)
        set((state) => {
          if (state.nodes[selectedId]?.geometry) {
            state.nodes[selectedId].geometry = {
              type: 'custom',
              params: {},
              customGeometryKey: customKey,
              stats: newStats,
            }
          }
        })
        get().recalculateSceneStats()
      }

      return { removedDegenerate, weldedVertices }
    },

    setHoveredNode: (id) =>
      set((state) => {
        state.hoveredNodeId = id
      }),

    addPrimitive: (type) => {
      const id = 'node_' + crypto.randomUUID()
      const count = get().rootNodeIds.length
      const node: SceneNode = {
        id, name: type.charAt(0).toUpperCase() + type.slice(1) + '_' + (Object.keys(get().nodes).length + 1), type: 'mesh', parentId: null, children: [],
        transform: { position: [(count % 4) * 1.5 - 2.25, 0.5, Math.floor(count / 4) * 1.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
        geometry: createDefaultGeometryDefinition(type), materialId: defaultMaterialId, visible: true, locked: false,
      }
      sceneTransaction(get, set, 'Add ' + node.name, (state) => {
        state.nodes[id] = node; state.rootNodeIds.push(id)
        applyObjectSelection(state, [id], id)
      })
      return id
    },

    addEmptyGroup: () => {
      const id = 'node_' + crypto.randomUUID()
      sceneTransaction(get, set, 'Add group', (state) => {
        state.nodes[id] = { id, name: 'Group_' + (Object.keys(state.nodes).length + 1), type: 'group', parentId: null, children: [], transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }, visible: true, locked: false }
        state.rootNodeIds.push(id); applyObjectSelection(state, [id], id)
      })
      return id
    },

    deleteNode: (id) => {
      if (!get().nodes[id]) return
      const removed = new Set<string>()
      const collect = (key: string) => {
        if (removed.has(key)) return
        removed.add(key); get().nodes[key]?.children.forEach(collect)
      }
      collect(id)
      sceneTransaction(get, set, 'Delete object', (state) => {
        for (const key of removed) delete state.nodes[key]
        state.rootNodeIds = state.rootNodeIds.filter((key) => !removed.has(key))
        for (const node of Object.values(state.nodes)) node.children = node.children.filter((key) => !removed.has(key))
        applyObjectSelection(state, state.selectedNodeIds.filter((key) => !removed.has(key)), state.selectedNodeId)
      })
    },

    duplicateNode: (id) => {
      if (!get().nodes[id]) return null
      const additions: Record<string, SceneNode> = {}
      const clone = (sourceId: string, parentId: string | null): string => {
        const original = get().nodes[sourceId], key = 'node_' + crypto.randomUUID()
        const node = structuredClone(original)
        node.id = key; node.name += '_Copy'; node.parentId = parentId
        if (node.geometry?.customGeometryKey) {
          const resource = 'duplicate_' + crypto.randomUUID()
          registerCustomGeometry(resource, createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey).clone())
          node.geometry.customGeometryKey = resource
        }
        additions[key] = node
        node.children = original.children.map((child) => clone(child, key))
        return key
      }
      const root = clone(id, get().nodes[id].parentId)
      additions[root].transform.position[0] += 0.5
      additions[root].transform.position[2] += 0.5
      sceneTransaction(get, set, 'Duplicate object', (state) => {
        Object.assign(state.nodes, additions)
        const parent = additions[root].parentId
        if (parent) state.nodes[parent].children.push(root)
        else state.rootNodeIds.push(root)
        applyObjectSelection(state, [root], root)
      })
      return root
    },

    renameNode: (id, name) => {
      const node = get().nodes[id]
      if (!node) return
      const oldName = node.name

      set((state) => {
        if (state.nodes[id]) {
          state.nodes[id].name = name
          state.nodes[id].semanticTag = name
        }
      })

      get().recordCommand({
        id: `ren_${id}`,
        name: `Rename ${oldName} to ${name}`,
        timestamp: Date.now(),
        execute: () => {
          set((state) => {
            if (state.nodes[id]) state.nodes[id].name = name
          })
        },
        undo: () => {
          set((state) => {
            if (state.nodes[id]) state.nodes[id].name = oldName
          })
        },
      })
    },

    toggleNodeVisibility: (id) =>
      set((state) => {
        if (state.nodes[id]) {
          state.nodes[id].visible = !state.nodes[id].visible
        }
      }),

    toggleNodeLock: (id) =>
      set((state) => {
        if (state.nodes[id]) {
          state.nodes[id].locked = !state.nodes[id].locked
        }
      }),

    updateNodeTransform: (id, transform, recordUndo = false) => {
      const current = get().nodes[id]
      if (!current) return

      const prevTransform = JSON.parse(JSON.stringify(current.transform))

      set((state) => {
        if (state.nodes[id]) {
          if (transform.position) state.nodes[id].transform.position = transform.position as [number, number, number]
          if (transform.rotation) state.nodes[id].transform.rotation = transform.rotation as [number, number, number]
          if (transform.scale) state.nodes[id].transform.scale = transform.scale as [number, number, number]
        }
      })

      if (recordUndo) {
        const nextTransform = JSON.parse(JSON.stringify(get().nodes[id].transform))
        get().recordCommand({
          id: `trans_${id}_${Date.now()}`,
          name: `Transform ${current.name}`,
          timestamp: Date.now(),
          execute: () => {
            set((state) => {
              if (state.nodes[id]) state.nodes[id].transform = nextTransform
            })
          },
          undo: () => {
            set((state) => {
              if (state.nodes[id]) state.nodes[id].transform = prevTransform
            })
          },
        })
      }
    },

    updateNode: (id, updates) =>
      set((state) => {
        if (state.nodes[id]) {
          Object.assign(state.nodes[id], updates)
        }
      }),

    reorderNode: (draggedId, targetParentId) => {
      set((state) => {
        const dragged = state.nodes[draggedId]
        if (!dragged) return

        // Remove from old parent
        if (dragged.parentId && state.nodes[dragged.parentId]) {
          state.nodes[dragged.parentId].children = state.nodes[dragged.parentId].children.filter(
            (cid) => cid !== draggedId
          )
        } else {
          state.rootNodeIds = state.rootNodeIds.filter((rid) => rid !== draggedId)
        }

        // Add to new parent
        dragged.parentId = targetParentId
        if (targetParentId && state.nodes[targetParentId]) {
          if (!state.nodes[targetParentId].children.includes(draggedId)) {
            state.nodes[targetParentId].children.push(draggedId)
          }
        } else {
          if (!state.rootNodeIds.includes(draggedId)) {
            state.rootNodeIds.push(draggedId)
          }
        }
      })
    },

    createMaterial: (name, preset) => {
      const id = `mat_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      const base = preset ? { ...preset } : MATERIAL_PRESETS.matteBlack

      const newMaterial: MaterialData = {
        id,
        name: name || `Material_${Object.keys(get().materials).length + 1}`,
        color: base.color || '#3b82f6',
        roughness: base.roughness ?? 0.5,
        metalness: base.metalness ?? 0.1,
        emissive: base.emissive || '#000000',
        emissiveIntensity: base.emissiveIntensity ?? 0,
        opacity: base.opacity ?? 1,
        transparent: base.transparent ?? false,
        wireframe: base.wireframe ?? false,
        doubleSided: base.doubleSided ?? true,
        map: base.map,
        normalMap: base.normalMap,
        roughnessMap: base.roughnessMap,
      }

      set((state) => {
        state.materials[id] = newMaterial
      })

      get().recalculateSceneStats()
      return id
    },

    updateMaterial: (id, updates, recordUndo = false) => {
      const oldMat = get().materials[id]
      if (!oldMat) return

      const prev = { ...oldMat }

      set((state) => {
        if (state.materials[id]) {
          Object.assign(state.materials[id], updates)
        }
      })

      if (recordUndo) {
        const next = { ...get().materials[id] }
        get().recordCommand({
          id: `mat_update_${id}_${Date.now()}`,
          name: `Update ${oldMat.name}`,
          timestamp: Date.now(),
          execute: () => {
            set((state) => {
              if (state.materials[id]) Object.assign(state.materials[id], next)
            })
          },
          undo: () => {
            set((state) => {
              if (state.materials[id]) Object.assign(state.materials[id], prev)
            })
          },
        })
      }
    },

    assignMaterial: (nodeId, materialId, slot) => {
      const source = get().nodes[nodeId]
      if (!source || !get().materials[materialId]) return
      if (slot !== undefined && (!Number.isInteger(slot) || slot < 0 || slot >= (source.materialIds?.length || 1))) throw new Error('Invalid material slot.')
      sceneTransaction(get, set, 'Assign material', (state) => {
        if (state.nodes[nodeId]) {
          const node = state.nodes[nodeId]
          if (slot === undefined) {
            node.materialId = materialId
            node.materialIds = node.materialIds?.map(() => materialId)
          } else {
            const slots = node.materialIds?.length ? [...node.materialIds] : [node.materialId!]
            slots[slot] = materialId
            node.materialIds = slots
            node.materialId = slots[0]
          }
        }
      })
    },

    setTransformMode: (mode) =>
      set((state) => {
        state.transformMode = mode
      }),

    setTransformSpace: (space) =>
      set((state) => {
        state.transformSpace = space
      }),

    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode
      }),

    setCameraPreset: (preset) =>
      set((state) => {
        state.cameraPreset = preset
        state.cameraCommandId++
      }),

    setActiveWorkspace: (workspace) => {
      const scene = switchWorkspaceScene(get(), workspace)
      set((state) => {
        Object.assign(state, scene)
        state.activeWorkspace = workspace
      })
      get().recalculateSceneStats()
    },

    updateEnvironment: (updates) =>
      set((state) => {
        Object.assign(state.environment, updates)
      }),

    updateStats: (updates) =>
      set((state) => {
        Object.assign(state.stats, updates)
      }),

    openModal: (modal) =>
      set((state) => {
        state.activeModal = modal
      }),

    recordCommand: (command) => {
      const discarded = [...get().history.future]
      if (get().history.past.length >= 50) discarded.push(get().history.past[0])
      set((state) => {
        state.history.past.push(command)
        state.history.future = [] // clear redo stack on new action
        if (state.history.past.length > 50) {
          state.history.past.shift() // keep 50 steps
        }
      })
      discarded.forEach((entry) => entry.dispose?.())
      pruneSceneResources(get())
    },

    // Edit Mode & Topology Actions (Milestone 2.1)
    setEditorMode: (mode: EditorMode) =>
      set((state) => {
        if (mode === 'edit') {
          const selectedId = state.selectedNodeId
          if (!selectedId || state.nodes[selectedId]?.type !== 'mesh') {
            return
          }
        } else {
          state.selectedVertexIds = []
          state.selectedEdgeIds = []
          state.selectedFaceIds = []
        }
        state.editorMode = mode
      }),

    toggleEditorMode: () => {
      const current = get().editorMode
      if (current === 'object') {
        get().setEditorMode('edit')
      } else {
        get().setEditorMode('object')
      }
    },

    setSelectionSubMode: (subMode: SelectionSubMode) =>
      set((state) => {
        state.selectionSubMode = subMode
        state.selectedVertexIds = []
        state.selectedEdgeIds = []
        state.selectedFaceIds = []
      }),

    setSelectedVertices: (ids: number[]) =>
      set((state) => {
        state.selectedVertexIds = ids
      }),

    setSelectedEdges: (ids: number[]) =>
      set((state) => {
        state.selectedEdgeIds = ids
      }),

    setSelectedFaces: (ids: number[]) =>
      set((state) => {
        state.selectedFaceIds = ids
      }),

    toggleVertexSelection: (id: number, multiSelect: boolean = false) =>
      set((state) => {
        if (multiSelect) {
          if (state.selectedVertexIds.includes(id)) {
            state.selectedVertexIds = state.selectedVertexIds.filter((v) => v !== id)
          } else {
            state.selectedVertexIds.push(id)
          }
        } else {
          state.selectedVertexIds =
            state.selectedVertexIds.includes(id) && state.selectedVertexIds.length === 1 ? [] : [id]
        }
      }),

    toggleEdgeSelection: (id: number, multiSelect: boolean = false) =>
      set((state) => {
        if (multiSelect) {
          if (state.selectedEdgeIds.includes(id)) {
            state.selectedEdgeIds = state.selectedEdgeIds.filter((e) => e !== id)
          } else {
            state.selectedEdgeIds.push(id)
          }
        } else {
          state.selectedEdgeIds =
            state.selectedEdgeIds.includes(id) && state.selectedEdgeIds.length === 1 ? [] : [id]
        }
      }),

    toggleFaceSelection: (id: number, multiSelect: boolean = false) =>
      set((state) => {
        if (multiSelect) {
          if (state.selectedFaceIds.includes(id)) {
            state.selectedFaceIds = state.selectedFaceIds.filter((f) => f !== id)
          } else {
            state.selectedFaceIds.push(id)
          }
        } else {
          state.selectedFaceIds =
            state.selectedFaceIds.includes(id) && state.selectedFaceIds.length === 1 ? [] : [id]
        }
      }),

    selectAllSubElements: () => {
      const { selectedNodeId, nodes, selectionSubMode } = get()
      if (!selectedNodeId) return
      const node = nodes[selectedNodeId]
      if (!node || node.type !== 'mesh' || !node.geometry) return

      const geom = createBufferGeometry(
        node.geometry.type,
        node.geometry.params,
        node.geometry.customGeometryKey
      )
      const graph = getTopologyForNode(selectedNodeId, geom)

      set((state) => {
        if (selectionSubMode === 'vertex') {
          state.selectedVertexIds = Array.from(graph.vertices.keys())
        } else if (selectionSubMode === 'edge') {
          state.selectedEdgeIds = Array.from(graph.edges.keys())
        } else if (selectionSubMode === 'face') {
          state.selectedFaceIds = Array.from(graph.faces.keys())
        }
      })
    },

    clearSubSelection: () =>
      set((state) => {
        state.selectedVertexIds = []
        state.selectedEdgeIds = []
        state.selectedFaceIds = []
      }),

    setEditModeOverlayVisible: (settings: Partial<EditModeOverlaySettings>) =>
      set((state) => {
        state.editModeOverlayVisible = { ...state.editModeOverlayVisible, ...settings }
      }),

    translateSelectedTopologyVertices: (delta: [number, number, number], recordUndo: boolean = false) => {
      const { selectedNodeId, nodes, selectionSubMode, selectedVertexIds, selectedEdgeIds, selectedFaceIds } = get()
      if (!selectedNodeId) return
      const node = nodes[selectedNodeId]
      if (!node || node.type !== 'mesh' || !node.geometry) return

      let geomKey = node.geometry.customGeometryKey
      let geom = createBufferGeometry(node.geometry.type, node.geometry.params, geomKey)
      const graph = getTopologyForNode(selectedNodeId, geom)

      let affectedVertexIds: number[] = []
      if (selectionSubMode === 'vertex') {
        affectedVertexIds = selectedVertexIds
      } else if (selectionSubMode === 'edge') {
        affectedVertexIds = getVerticesFromEdges(graph, selectedEdgeIds)
      } else if (selectionSubMode === 'face') {
        affectedVertexIds = getVerticesFromFaces(graph, selectedFaceIds)
      }

      if (!affectedVertexIds.length) return

      // Ensure geometry is promoted to custom editable if it was procedural
      if (node.geometry.type !== 'custom' || !geomKey) {
        geomKey = `geom_edit_${node.id}_${Date.now()}`
        geom = geom.clone()
        registerCustomGeometry(geomKey, geom)
        set((state) => {
          if (state.nodes[selectedNodeId].geometry) {
            state.nodes[selectedNodeId].geometry!.type = 'custom'
            state.nodes[selectedNodeId].geometry!.customGeometryKey = geomKey
          }
        })
      }

      // Record undo if requested
      if (recordUndo) {
        const reverseDelta: [number, number, number] = [-delta[0], -delta[1], -delta[2]]
        const targetIds = [...affectedVertexIds]
        const cmd = {
          id: `cmd_vtrans_${Date.now()}`,
          name: `Move ${targetIds.length} vertices`,
          timestamp: Date.now(),
          execute: () => {
            get().translateSelectedTopologyVertices(delta, false)
          },
          undo: () => {
            get().translateSelectedTopologyVertices(reverseDelta, false)
          },
        }
        set((state) => {
          state.history.past.push(cmd)
          state.history.future = []
        })
      }

      // Apply delta to graph vertices
      for (const vId of affectedVertexIds) {
        const v = graph.vertices.get(vId)
        if (v) {
          v.position[0] += delta[0]
          v.position[1] += delta[1]
          v.position[2] += delta[2]
        }
      }

      // Update Three.js buffer geometry in-place
      updateBufferGeometryPositions(geom, graph)
      const updatedStats = calculateGeometryStats(geom)

      set((state) => {
        if (state.nodes[selectedNodeId]?.geometry) {
          state.nodes[selectedNodeId].geometry!.stats = updatedStats
        }
        state.stats.selectedVertices = updatedStats.vertexCount
      })
    },

    extrudeSelectedFaces: (distance = 0.2, individual = false) => {
      if (!get().selectedFaceIds.length) return
      geometryTransaction(get, set, 'Extrude faces', (graph, node, state) => {
        const result = extrudeFaces(graph, state.selectedFaceIds, { distance, individual })
        return { faces: result.extrudedFaceIds, vertices: [], edges: [] }
      })
    },
    insetSelectedFaces: (amount = 0.2, depth = 0) => {
      if (!get().selectedFaceIds.length) return
      geometryTransaction(get, set, 'Inset faces', (graph, node, state) => {
        const result = insetFaces(graph, state.selectedFaceIds, { amount, depth })
        return { faces: result.insetFaceIds, vertices: [], edges: [] }
      })
    },
    subdivideSelectedFaces: () => {
      if (!get().selectedFaceIds.length) return
      geometryTransaction(get, set, 'Subdivide faces', (graph, node, state) => {
        const result = subdivideFaces(graph, state.selectedFaceIds)
        return { faces: result.newFaceIds, vertices: [], edges: [] }
      })
    },
    mergeSelectedVertices: (mode = 'center', tolerance = 0.005) => {
      if (get().selectedVertexIds.length < 2) return
      geometryTransaction(get, set, 'Merge vertices', (graph, node, state) => {
        mergeVertices(graph, state.selectedVertexIds, { mode, tolerance })
        return { vertices: [], edges: [], faces: [] }
      })
    },
    deleteSelectedTopologyElements: () => {
      const state = get()
      const ids = state.selectionSubMode === 'vertex' ? state.selectedVertexIds : state.selectionSubMode === 'edge' ? state.selectedEdgeIds : state.selectedFaceIds
      if (!ids.length) return
      geometryTransaction(get, set, 'Delete topology elements', (graph) => {
        deleteTopologyElements(graph, state.selectionSubMode, ids)
        return { vertices: [], edges: [], faces: [] }
      })
    },
    flipSelectedNormals: () => {
      if (!get().selectedFaceIds.length) return
      geometryTransaction(get, set, 'Flip normals', (graph, node, state) => { flipTopologyNormals(graph, state.selectedFaceIds) })
    },

    selectFaceRegion: (mode) => {
      const state = get(), node = state.selectedNodeId ? state.nodes[state.selectedNodeId] : null
      if (!node?.geometry) return
      const geometry = createBufferGeometry(node.geometry.type, node.geometry.params, node.geometry.customGeometryKey)
      const graph = getTopologyForNode(node.id, geometry)
      get().setSelectedFaces(selectFaceRegion(graph, state.selectedFaceIds, mode))
    },

    separateSelectedMesh: (mode = 'selected') => {
      const { selectedNodeId, nodes, selectedFaceIds } = get()
      if (!selectedNodeId) return []
      const node = nodes[selectedNodeId]
      if (!node || node.type !== 'mesh' || !node.geometry) return []

      if (node.children.length) throw new Error('Separate child objects from this mesh before partitioning it.')
      const geomKey = node.geometry.customGeometryKey
      const geom = createBufferGeometry(node.geometry.type, node.geometry.params, geomKey)
      const graph = getTopologyForNode(selectedNodeId, geom)

      let componentsToCreate: number[][] = []

      if (mode === 'materials') {
        const byMaterial = new Map<number, number[]>()
        for (const face of graph.faces.values()) {
          const ids = byMaterial.get(face.materialIndex) || []
          ids.push(face.id)
          byMaterial.set(face.materialIndex, ids)
        }
        componentsToCreate = [...byMaterial.values()]
        if (componentsToCreate.length <= 1) return [selectedNodeId]
      } else if (mode === 'components') {
        componentsToCreate = getConnectedMeshComponents(graph)
        if (componentsToCreate.length <= 1) return [selectedNodeId]
      } else {
        if (!selectedFaceIds.length) return [selectedNodeId]
        const selectedSet = new Set(selectedFaceIds)
        const remainingFaces = Array.from(graph.faces.keys()).filter((fid) => !selectedSet.has(fid))
        if (!remainingFaces.length) return [selectedNodeId]
        componentsToCreate = [selectedFaceIds, remainingFaces]
      }

      const sourceData = structuredClone(node.userData || {})
      delete sourceData.customizationTarget
      delete sourceData.blackBulletContract
      delete sourceData.partId
      const partitioned = partitionGeometry(geom, graph, componentsToCreate)
      const createdNodeIds: string[] = []
      const createdNodes: Record<string, SceneNode> = {}
      const timestamp = Date.now()

      for (let i = 0; i < componentsToCreate.length; i++) {
        const faceIds = componentsToCreate[i]
        const subGeom = partitioned[i]
        const subGeomKey = `geom_sep_${node.id}_${i}_${timestamp}`
        registerCustomGeometry(subGeomKey, subGeom)

        const newNodeId = `node_${timestamp}_part_${i + 1}`
        const newNode: SceneNode = {
          ...structuredClone(node),
          id: newNodeId,
          userData: structuredClone(sourceData),
          isCustomizable: false,
          customizableZone: undefined,
          name: `${node.name}_Part${i + 1}`,
          type: 'mesh',
          parentId: node.parentId,
          children: [],
          transform: structuredClone(node.transform),
          geometry: {
            type: 'custom',
            params: {},
            stats: calculateGeometryStats(subGeom),
            customGeometryKey: subGeomKey,
          },
          materialId: node.materialId,
          materialIds: node.materialIds ? [...node.materialIds] : undefined,
          visible: node.visible,
          locked: node.locked,
        }

        removeTopologyForNode(newNodeId)
        createdNodeIds.push(newNodeId)
        createdNodes[newNodeId] = newNode
      }

      const parentId = node.parentId
      const oldNodeCopy = { ...node }

      set((state) => {
        delete state.nodes[selectedNodeId]
        for (const [id, n] of Object.entries(createdNodes)) {
          state.nodes[id] = n
        }
        if (parentId && state.nodes[parentId]) {
          state.nodes[parentId].children = state.nodes[parentId].children
            .filter((id) => id !== selectedNodeId)
            .concat(createdNodeIds)
        } else {
          state.rootNodeIds = state.rootNodeIds
            .filter((id) => id !== selectedNodeId)
            .concat(createdNodeIds)
        }
        applyObjectSelection(state, createdNodeIds.slice(0, 1))
      })
      get().recalculateSceneStats()

      get().recordCommand({
        id: `cmd_separate_${Date.now()}`,
        resourceKeys: [node.geometry?.customGeometryKey, ...Object.values(createdNodes).map((entry) => entry.geometry?.customGeometryKey)].filter((key): key is string => !!key),
        name: `Separate mesh into ${createdNodeIds.length} parts`,
        timestamp: Date.now(),
        execute: () => {
          set((state) => {
            delete state.nodes[selectedNodeId]
            for (const [id, n] of Object.entries(createdNodes)) {
              state.nodes[id] = n
            }
            if (parentId && state.nodes[parentId]) {
              state.nodes[parentId].children = state.nodes[parentId].children
                .filter((id) => id !== selectedNodeId)
                .concat(createdNodeIds)
            } else {
              state.rootNodeIds = state.rootNodeIds
                .filter((id) => id !== selectedNodeId)
                .concat(createdNodeIds)
            }
            applyObjectSelection(state, createdNodeIds.slice(0, 1))
          })
          get().recalculateSceneStats()
        },
        undo: () => {
          set((state) => {
            for (const id of createdNodeIds) {
              delete state.nodes[id]
            }
            state.nodes[selectedNodeId] = oldNodeCopy
            if (parentId && state.nodes[parentId]) {
              state.nodes[parentId].children = state.nodes[parentId].children
                .filter((id) => !createdNodeIds.includes(id))
                .concat([selectedNodeId])
            } else {
              state.rootNodeIds = state.rootNodeIds
                .filter((id) => !createdNodeIds.includes(id))
                .concat([selectedNodeId])
            }
            applyObjectSelection(state, [selectedNodeId])
          })
          get().recalculateSceneStats()
        },
      })

      return createdNodeIds
    },

    markSelectedUVSeams: (marked) => {
      if (!get().selectedEdgeIds.length) return
      geometryTransaction(get, set, marked ? 'Mark UV seams' : 'Clear UV seams', (graph, node, state) => {
        markUVSeams(graph, state.selectedEdgeIds, marked)
      })
    },
    packUVIslands: () => {
      geometryTransaction(get, set, 'Pack UV islands', graph => { packUVIslands(graph) })
    },
    applyUVProjection: (type, axis = 'y') => {
      geometryTransaction(get, set, 'Apply UV projection', (graph) => {
        if (type === 'box') applyBoxProjection(graph)
        else if (type === 'planar') applyPlanarProjection(graph, axis)
        else applyCylindricalProjection(graph, axis)
      })
    },
    transformSelectedUVs: (deltaU, deltaV, scaleU = 1, scaleV = 1, angleDeg = 0) => {
      geometryTransaction(get, set, 'Transform UVs', (graph, node, state) => {
        const faces = state.selectedFaceIds.length ? state.selectedFaceIds : [...graph.faces.keys()]
        transformUVSelection(graph, faces, deltaU, deltaV, scaleU, scaleV, angleDeg * Math.PI / 180)
      })
    },
    assignMaterialToSelectedFaces: (materialId) => {
      if (!get().selectedFaceIds.length || !get().materials[materialId]) return
      geometryTransaction(get, set, 'Assign face material', (graph, node, state) => {
        const slots = node.materialIds?.length ? [...node.materialIds] : [node.materialId!]
        let index = slots.indexOf(materialId)
        if (index < 0) { index = slots.length; slots.push(materialId) }
        node.materialIds = slots
        graph.materialSlotCount = slots.length
        for (const id of state.selectedFaceIds) {
          const face = graph.faces.get(id)
          if (face) face.materialIndex = index
        }
      })
    },
    addMaterialSlot: (nodeId, materialId) => {
      if (!get().materials[materialId]) throw new Error('Cannot add a missing material.')
      geometryTransaction(get, set, 'Add material slot', (graph, node) => {
        node.materialIds = [...(node.materialIds?.length ? node.materialIds : [node.materialId!]), materialId]
        graph.materialSlotCount = node.materialIds.length
      }, nodeId)
    },
    removeMaterialSlot: (nodeId, slotIndex) => {
      const slots = get().nodes[nodeId]?.materialIds
      if (!slots || slots.length <= 1 || slotIndex < 0 || slotIndex >= slots.length) return
      geometryTransaction(get, set, 'Remove material slot', (graph, node) => {
        node.materialIds = slots.filter((_, index) => index !== slotIndex)
        node.materialId = node.materialIds[0]
        graph.materialSlotCount = node.materialIds.length
        for (const face of graph.faces.values()) {
          if (face.materialIndex === slotIndex) face.materialIndex = 0
          else if (face.materialIndex > slotIndex) face.materialIndex--
        }
      }, nodeId)
    },

    undo: () => {
      const { past, future } = get().history
      if (past.length === 0) return

      const command = past[past.length - 1]
      command.undo()

      set((state) => {
        state.history.past.pop()
        state.history.future.push(command)
      })
    },

    redo: () => {
      const { future } = get().history
      if (future.length === 0) return

      const command = future[future.length - 1]
      command.execute()

      set((state) => {
        state.history.future.pop()
        state.history.past.push(command)
      })
    },

    loadImportedScene: (result) => {
      for (const entry of [...get().history.past, ...get().history.future]) entry.dispose?.()
      set((state) => {
        state.nodes = result.nodes
        state.rootNodeIds = result.rootNodeIds
        state.materials = { ...initialMaterials, ...result.materials }
        applyObjectSelection(state, result.rootNodeIds[0] ? [result.rootNodeIds[0]] : [])
        state.hoveredNodeId = null
        state.history.past = []
        state.history.future = []
      })
      get().recalculateSceneStats()
      pruneSceneResources(get())
    },

    resetScene: () => {
      for (const entry of [...get().history.past, ...get().history.future]) entry.dispose?.()
      set((state) => {
        state.nodes = initialNodes
        state.rootNodeIds = [initialNodeId]
        applyObjectSelection(state, [initialNodeId])
        state.editorMode = 'object'
        state.hoveredNodeId = null
        state.materials = initialMaterials
        state.history.past = []
        state.history.future = []
      })
      get().recalculateSceneStats()
      pruneSceneResources(get())
    },

    recalculateSceneStats: () => {
      const nodes = get().nodes
      let totalVerts = 0
      let totalTris = 0
      let meshes = 0

      for (const node of Object.values(nodes)) {
        if (node.type === 'mesh' && node.geometry?.stats) {
          meshes++
          totalVerts += node.geometry.stats.vertexCount
          totalTris += node.geometry.stats.triangleCount
        }
      }

      const matCount = Object.keys(get().materials).length
      const selected = get().selectedNodeId ? nodes[get().selectedNodeId!] : null

      set((state) => {
        state.stats.meshCount = meshes
        state.stats.totalVertices = totalVerts
        state.stats.totalTriangles = totalTris
        state.stats.materialCount = matCount
        if (selected?.geometry?.stats) {
          state.stats.selectedVertices = selected.geometry.stats.vertexCount
          state.stats.selectedTriangles = selected.geometry.stats.triangleCount
        } else {
          state.stats.selectedVertices = 0
          state.stats.selectedTriangles = 0
        }
      })
    },
  }))
)

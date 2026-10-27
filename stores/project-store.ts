import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjectMetadata, SerializedProject } from '@/types/project'
import { useEditorStore } from './editor-store'
import { useCustomizerStore } from './customizer-store'
import { captureProject, hydrateProject } from '@/engine/persistence/project-assets'
import { saveProjectSnapshot, readProjectSnapshot, deleteProjectSnapshot } from '@/engine/persistence/indexeddb-projects'
import { createBufferGeometry } from '@/engine/scene/primitive-factory'

interface ProjectStoreState {
  currentProject: ProjectMetadata
  recentProjects: ProjectMetadata[]
  isDirty: boolean
  lastSavedAt: string | null
  isSaving: boolean

  // Actions
  createNewProject: (name?: string) => void
  saveCurrentProject: () => Promise<void>
  openSavedProject: (id: string) => Promise<void>
  loadProjectFromData: (serialized: SerializedProject) => void
  deleteProject: (id: string) => Promise<void>
  markDirty: () => void
}

const defaultProject: ProjectMetadata = {
  id: 'proj_default_studio',
  name: 'Untitled Studio Project',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      currentProject: defaultProject,
      recentProjects: [defaultProject],
      isDirty: false,
      lastSavedAt: null,
      isSaving: false,

      createNewProject: (name = 'New 3D Model') => {
        const id = `proj_${Date.now()}`
        const newProj: ProjectMetadata = {
          id,
          workspace: 'editor',
          name,
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        useEditorStore.getState().setActiveWorkspace('editor')
        useEditorStore.getState().resetScene()

        set((state) => ({
          currentProject: newProj,
          recentProjects: [newProj, ...state.recentProjects.filter((p) => p.id !== id)].slice(0, 10),
          isDirty: false,
          lastSavedAt: null,
        }))
      },

      saveCurrentProject: () => {
        if (get().isSaving) return Promise.reject(new Error('A project save is already in progress.'))
        const editor = useEditorStore.getState()
        const current = get().currentProject
        const workspace = editor.activeWorkspace === 'customizer' ? 'customizer' : 'editor'
        const project: ProjectMetadata = (current.workspace || 'editor') === workspace ? current : { ...current, id: `proj_${workspace}_${Date.now()}`, workspace, name: workspace === 'customizer' ? useCustomizerStore.getState().productName : 'Studio Project' }
        const customization = useCustomizerStore.getState().exportProjectData()
        const scene = structuredClone({ nodes: editor.nodes, rootNodeIds: editor.rootNodeIds, materials: editor.materials, environment: editor.environment })
        set({ isSaving: true })
        return Promise.resolve()
          .then(() => captureProject(scene, project, customization))
          .then((snapshot) => saveProjectSnapshot(snapshot).then(() => snapshot))
          .then((snapshot) =>
            set((state) => ({
              currentProject: snapshot.document.metadata,
              isDirty: false,
              lastSavedAt: new Date().toLocaleTimeString(),
              recentProjects: [snapshot.document.metadata, ...state.recentProjects.filter((p) => p.id !== project.id)],
            }))
          )
          .then(() => undefined)
          .finally(() => {
            set({ isSaving: false })
          })
      },

      openSavedProject: (id) => readProjectSnapshot(id).then(hydrateProject).then((serialized) => get().loadProjectFromData(serialized)),

      loadProjectFromData: (serialized: SerializedProject) => {
        for (const node of Object.values(serialized.scene.nodes)) {
          if (node.geometry?.type === 'custom') createBufferGeometry('custom', node.geometry.params, node.geometry.customGeometryKey)
        }
        const editor = useEditorStore.getState()
        const customization = serialized.customization
        const isCustomizer = customization?.workspace === 'customizer' || (!!customization && !customization.workspace && Object.values(customization.zones).some(zone => !!serialized.scene.nodes[zone.targetMeshNodeId]))
        editor.setActiveWorkspace(isCustomizer ? 'customizer' : 'editor')
        editor.loadImportedScene({
          nodes: serialized.scene.nodes,
          rootNodeIds: serialized.scene.rootNodeIds,
          materials: serialized.scene.materials,
          modelName: serialized.metadata.name,
        })
        editor.updateEnvironment(serialized.scene.environment)

        if (serialized.customization && isCustomizer) {
          useCustomizerStore.getState().importProjectData(serialized.customization)
        }

        set({
          currentProject: serialized.metadata,
          isDirty: false,
          lastSavedAt: new Date().toLocaleTimeString(),
        })
      },

      deleteProject: (id: string) => deleteProjectSnapshot(id).then(() => set((state) => ({
          recentProjects: state.recentProjects.filter((p) => p.id !== id),
        }))).then(() => undefined),

      markDirty: () => set({ isDirty: true }),
    }),
    {
      name: '3d_model_maker_projects_meta',
      partialize: (state) => ({ currentProject: state.currentProject, recentProjects: state.recentProjects }),
    }
  )
)

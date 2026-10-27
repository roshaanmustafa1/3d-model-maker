import { SceneNode, MaterialData, EnvironmentSettings } from './scene'
import { CustomizationProject } from './customization'

export interface ProjectMetadata {
  id: string
  workspace?: 'editor' | 'customizer'
  name: string
  description?: string
  version: string
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  author?: string
}

export interface SerializedProject {
  schemaVersion: number
  metadata: ProjectMetadata
  scene: {
    nodes: Record<string, SceneNode>
    rootNodeIds: string[]
    materials: Record<string, MaterialData>
    environment: EnvironmentSettings
  }
  customization?: CustomizationProject
}


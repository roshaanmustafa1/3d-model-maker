export type WorkspaceType =
  | 'editor'       // 3D Modeling & Scene Studio
  | 'customizer'   // BlankBuilder Product Customizer
  | 'generator'    // AI Image-to-3D Generator
  | 'uv'           // UV & Mesh Diagnostics Lab
  | 'validator'    // BlackBullet Compatibility Validator

export type TransformMode = 'translate' | 'rotate' | 'scale' | 'select'

export type TransformSpace = 'world' | 'local'

export type ViewMode = 'solid' | 'wireframe' | 'normal' | 'material' | 'matcap'

export type CameraViewPreset =
  | 'perspective'
  | 'top'
  | 'bottom'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'isometric'
  | 'fit'
  | 'reset'

export interface EditorStats {
  fps: number
  totalVertices: number
  totalTriangles: number
  meshCount: number
  materialCount: number
  selectedVertices: number
  selectedTriangles: number
}

export interface HistoryCommand {
  resourceKeys?: string[]
  dispose?: () => void
  id: string
  name: string
  timestamp: number
  execute: () => void
  undo: () => void
}

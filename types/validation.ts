export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface ValidationCheck {
  id: string
  category: 'glb' | 'hierarchy' | 'naming' | 'uv' | 'material' | 'transform'
  title: string
  description: string
  status: CheckStatus
  details?: string
  recommendation?: string
}

export interface ValidationReport {
  timestamp: string
  modelName: string
  isBlackBulletReady: boolean
  totalChecks: number
  passed: number
  warnings: number
  failed: number
  checks: ValidationCheck[]
  summary: {
    totalMeshes: number
    meshesWithUV: number
    customizableZonesFound: string[]
    missingZones: string[]
    namingConformityPercentage: number
  }
}

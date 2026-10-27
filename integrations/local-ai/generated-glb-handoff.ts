import { inspectGlbContainer } from '@/engine/loaders/glb-integrity'
import { parseGlbBufferToThree, analyzeGlbScene } from '@/engine/generation/generation-validator'
import { processThreeObjectHierarchy } from '@/engine/loaders/model-importer'

export function inspectGeneratedGlb(file: File) {
  if (!file.name.toLowerCase().endsWith('.glb')) return Promise.reject(new Error('Select a generated .glb file.'))
  if (file.size > 100 * 1024 * 1024) return Promise.reject(new Error('GLB exceeds the 100 MB handoff limit.'))
  return file.arrayBuffer().then(buffer => {
    inspectGlbContainer(buffer)
    return parseGlbBufferToThree(buffer)
  }).then(scene => {
    const report = analyzeGlbScene(scene)
    if (!report.isGlbCompatible) throw new Error(report.validationIssues.join('; ') || 'GLB contains no usable mesh.')
    if (scene.getObjectsByProperty('isSkinnedMesh', true).length) throw new Error('Rigged models require a static-mesh export from Blender before editing.')
    return { report, imported: processThreeObjectHierarchy(scene, file.name.replace(/\.glb$/i, ''), true) }
  })
}

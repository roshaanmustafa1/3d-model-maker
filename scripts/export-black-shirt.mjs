import '../tests/support/file-reader.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import { blackShirt } from '../tests/support/black-shirt.mjs'
import { exportSceneToGLB } from '../engine/exporters/glb-exporter.ts'

const state = blackShirt()
const directory = new URL('../docs/fixtures/', import.meta.url)
exportSceneToGLB(state.nodes, state.rootNodeIds, state.materials).then((result) => {
  if (!result.verified) throw new Error(result.issues.join('\n'))
  return mkdir(directory, { recursive: true }).then(() => result.blob.arrayBuffer()).then((buffer) =>
    Promise.all([
      writeFile(new URL('black-shirt.glb', directory), new Uint8Array(buffer)),
      writeFile(new URL('black-shirt-materials.json', directory), JSON.stringify(result.exportedMaterials, null, 2) + '\n'),
    ])
  )
}).then(() => console.log('Wrote verified synthetic black-shirt.glb and its actual glTF material JSON.')).catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})

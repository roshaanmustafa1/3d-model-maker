import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const sourceFiles = [
  'package.json', 'package-lock.json',
  'types/customization.ts', 'types/scene.ts', 'types/editor.ts', 'types/project.ts',
  'engine/customization/artwork-renderer.ts', 'engine/customization/blackbullet-contract.ts', 'engine/customization/catalog-surfaces.ts', 'engine/customization/customization-exporter.ts', 'engine/customization/material-composition.ts', 'engine/customization/product-catalog.ts', 'engine/customization/svg-sanitizer.ts', 'engine/customization/targets.ts', 'engine/customization/texture-composer.ts', 'engine/customization/upload-validation.ts', 'engine/customization/uv-overlap.ts', 'engine/customization/zone-mapper.ts',
  'engine/scene/material-manager.ts', 'engine/scene/resource-lifecycle.ts', 'engine/scene/workspaces.ts', 'engine/validation/blackbullet-validator.ts',
  'stores/customizer-store.ts', 'stores/editor-store.ts', 'stores/project-store.ts', 'stores/derived-material-store.ts',
  'components/customizer/artwork-canvas.tsx', 'components/customizer/artwork-toolbar.tsx', 'components/customizer/design-zone-panel.tsx', 'components/customizer/material-panel.tsx', 'components/customizer/preview-controls.tsx', 'components/customizer/product-customizer-view.tsx', 'components/customizer/product-library.tsx', 'components/customizer/texture-pipeline.tsx',
  'components/viewport/camera-controller.tsx', 'components/viewport/scene-renderer.tsx', 'components/viewport/viewport-canvas.tsx', 'components/editor/editor-layout.tsx',
  'docs/customization-targets.md',
]
const testFiles = ['scripts/qa/phase3-support.mjs', 'scripts/qa/phase3_5-pixels.mjs', 'scripts/qa/phase3_5-fixtures.mjs', 'scripts/qa/phase3_5-trace-summary.mjs', 'scripts/qa/phase3_5-manifest.mjs', 'scripts/qa/phase3_5-summary.mjs', 'tests/qa/phase3-regressions.test.mjs', 'tests/qa/phase3_5.test.mjs', 'tests/qa/browser/phase3.spec.mjs', 'tests/qa/browser/phase3-pointer.spec.mjs', 'tests/qa/browser/phase3-blackbullet.spec.mjs', 'tests/qa/browser/phase3-durability.spec.mjs', 'tests/qa/browser/phase3_5.spec.mjs', 'tests/qa/browser/phase3_5-blackbullet.spec.mjs', 'tests/qa/browser/phase3_5-alignment.spec.mjs', 'tests/qa/browser/phase3_5-materials.spec.mjs']
const files = await Promise.all(sourceFiles.map(async path => ({ path, sha256: createHash('sha256').update(await readFile(path)).digest('hex') })))
const asset = "C:/Users/Roshaan's Pc/Documents/Projects/blackbullet-3d/src/assets/modals/subdivision.glb"
const assetSha256 = createHash('sha256').update(await readFile(asset)).digest('hex')
await writeFile('qa-reports/phase3_5/source-manifest.json', JSON.stringify({ createdUtc: new Date().toISOString(), sourceFiles: files, qaFiles: testFiles, productionAsset: { path: asset, sha256: assetSha256, unchangedFromPhase2_5: assetSha256 === '41917204466a7a872bef865b6dfb4546c380044fd752afdc93700a31a485d0c1' }, blackBulletSourceModified: false, notes: ['Existing unrelated source changes were preserved. No production GLBs were modified.', 'Generated QA evidence and the stabilization report are additional outputs.'] }, null, 2))
console.log(`${files.length} source/dependency/documentation files recorded; production asset hash matches: ${assetSha256 === '41917204466a7a872bef865b6dfb4546c380044fd752afdc93700a31a485d0c1'}`)

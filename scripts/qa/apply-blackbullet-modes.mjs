import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
const root = path.resolve('../blackbullet-3d')
const backup = path.resolve('qa-reports/phase2_5/backups/blackbullet-3d')
async function edit(file, transform) {
  const target = path.join(root, file), original = (await readFile(target, 'utf8')).replaceAll('\r\n', '\n')
  const destination = path.join(backup, file)
  await mkdir(path.dirname(destination), { recursive: true })
  await copyFile(target, destination, 1).catch((error) => { if (error.code !== 'EEXIST') throw error })
  const next = transform(original)
  if (next === original) return
  await writeFile(target, next)
}
function replace(source, before, after) {
  if (!source.includes(before)) throw new Error('BlackBullet source context changed: ' + before.slice(0, 65))
  return source.replace(before, after)
}
const moduleSource = `import * as THREE from "three";
import { createGarmentPreviewMaterial } from "./garment-preview-material.js";

const list = (material) => Array.isArray(material) ? material : [material];
const clone = (material) => Array.isArray(material) ? material.map((item) => item.clone()) : material.clone();

export function createAppearanceRecord(mesh, neutralRuntime) {
  const imported = clone(mesh.material);
  list(mesh.material).forEach((material) => material.dispose());
  return { mesh, imported, runtime: null, neutralRuntime, partId: null };
}

export function selectAppearance(record, mode) {
  if (mode !== "imported" && mode !== "runtime") throw new Error("Unknown garment appearance mode");
  if (mode === "runtime" && !record.runtime) {
    record.runtime = record.neutralRuntime
      ? (Array.isArray(record.imported) ? record.imported.map(() => createGarmentPreviewMaterial()) : createGarmentPreviewMaterial())
      : clone(record.imported);
  }
  record.mesh.material = mode === "imported" ? record.imported : record.runtime;
  return record.mesh.material;
}

export function disposeAppearanceRecord(record) {
  const textures = new Set();
  for (const material of [...list(record.imported), ...list(record.runtime).filter(Boolean)]) {
    Object.values(material).forEach((value) => { if (value?.isTexture) textures.add(value); });
    material.dispose();
  }
  textures.forEach((texture) => texture.dispose());
}
`
await edit('src/config/garment-profiles.js', (source) => source.includes('appearanceMode:') ? source : source.replaceAll('  modelUrl:', '  appearanceMode: "runtime",\n  modelUrl:'))
await edit('src/views/customizer/index.vue', (source) => {
  if (source.includes('const appearanceMode = ref(')) return source
  let s = replace(source, '      <ThemeToggler class="ms-auto" />', `      <label class="ms-auto text-xs flex items-center gap-2">Appearance
        <select v-model="appearanceMode" aria-label="Garment appearance" class="rounded border bg-background px-2 py-2">
          <option value="imported">Preserve Imported Appearance</option>
          <option value="runtime">Runtime Customization</option>
        </select>
      </label>
      <ThemeToggler />`)
  s = replace(s, '<section class="tools min-h-0 overflow-hidden border-r border-border">', '<section class="tools min-h-0 overflow-hidden border-r border-border" :inert="appearanceMode === \'imported\'">')
  s = replace(s, '<GarmentPreview :canvas-element=', '<GarmentPreview :appearance-mode="appearanceMode" :canvas-element=')
  s = replace(s, 'provide(GARMENT_PROFILE_KEY, garment);', 'provide(GARMENT_PROFILE_KEY, garment);\nconst appearanceMode = ref(route.query.appearance === "imported" ? "imported" : garment.appearanceMode || "runtime");')
  s = replace(s, 'const data = { version: 1, garment:', 'const data = { version: 2, appearanceMode: appearanceMode.value, garment:')
  return s
})
await edit('src/components/customizer/preview/GarmentPreview.vue', (source) => {
  if (source.includes('const appearanceRecords = [];')) return source
  let s = replace(source, 'const garment = useGarmentProfile();', 'import { createAppearanceRecord, selectAppearance, disposeAppearanceRecord } from "@/lib/garment-appearance.js";\n\nconst garment = useGarmentProfile();')
  s = replace(s, 'const props = defineProps({', 'const props = defineProps({\n  appearanceMode: { type: String, default: "runtime", validator: (value) => ["runtime", "imported"].includes(value) },')
  s = replace(s, 'const modelMaterials = [];', 'const modelMaterials = [];\nconst appearanceRecords = [];')
  s = replace(s, 'renderer.toneMapping = usesNeutralMaterial ?', 'renderer.toneMapping = usesNeutralMaterial && props.appearanceMode === "runtime" ?')
  s = replace(s, '  if (!usesNeutralMaterial) {\n    addEnvironment();', '  if (!usesNeutralMaterial || props.appearanceMode === "imported") {\n    addEnvironment();')
  s = replace(s, `    object.material = usesNeutralMaterial
      ? createGarmentPreviewMaterial()
      : cloneMaterials(object.material);`, `    const appearance = createAppearanceRecord(object, usesNeutralMaterial);
    appearanceRecords.push(appearance);
    selectAppearance(appearance, props.appearanceMode);`)
  s = replace(s, '    const partId = resolvePartIdFromAncestors(object);', '    const partId = resolvePartIdFromAncestors(object);\n    appearance.partId = partId;')
  s = replace(s, '    if (!usesNeutralMaterial) {\n      item.roughness', '    if (!usesNeutralMaterial && props.appearanceMode === "runtime") {\n      item.roughness')
  s = replace(s, 'function syncCanvasTexture() {', 'function syncCanvasTexture() {\n  if (props.appearanceMode !== "runtime") return;')
  s = replace(s, 'function syncPartColours() {', 'function syncPartColours() {\n  if (props.appearanceMode !== "runtime") return;')
  s = replace(s, 'function stopCameraTransition() {', `function syncAppearance() {
  if (!renderer) return;
  if (props.appearanceMode === "imported" && !environmentTexture) { addEnvironment(); addLighting(); }
  renderer.toneMapping = usesNeutralMaterial && props.appearanceMode === "runtime" ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  modelMaterials.length = 0;
  appearanceRecords.forEach((record) => {
    selectAppearance(record, props.appearanceMode);
    registerMaterials(record.mesh.material, record.partId);
  });
  syncCanvasTexture();
  syncPartColours();
}

function stopCameraTransition() {`)
  s = replace(s, '  modelMaterials.length = 0;\n  regionMeshes.clear();', '  modelMaterials.length = 0;\n  appearanceRecords.forEach(disposeAppearanceRecord);\n  appearanceRecords.length = 0;\n  regionMeshes.clear();')
  s = replace(s, 'watch(() => props.partColours', 'watch(() => props.appearanceMode, syncAppearance);\nwatch(() => props.partColours')
  return s
})
await writeFile(path.join(root, 'src/lib/garment-appearance.js'), moduleSource)
await edit('docs/customizer-models.md', (source) => source + `

## Explicit garment appearance modes (Phase 2.5)

Existing catalog profiles declare appearanceMode: "runtime" and keep their existing colors and canvas artwork behavior. Material-free production asset requirements still apply to those profiles.

The Appearance selector also offers Preserve Imported Appearance. The URL query appearance=imported opens that mode explicitly. It retains cloned imported material slots, linear base colors, PBR properties and textures; initial color synchronization and canvas material assignment are disabled. Color/artwork tools are inert while imported appearance is active; select Runtime Customization to begin editing.

Switching modes swaps separately owned material instances without changing geometry or destroying imported materials. Runtime mode retains per-mesh material instances, profile defaults, the existing artwork atlas and white tint on canvas-textured parts to avoid double-tinting. Switching back restores the imported material snapshot. Saved design JSON records the chosen mode (version 2).

The imported mode creates the studio lighting/environment needed by PBR shaders. It does not convert imported materials to MeshBasicMaterial or recalculate garment normals. Assets, UVs and production model URLs are unchanged. Active and inactive appearance resources are disposed on preview teardown.
`)
console.log('Backed up and updated BlackBullet appearance modes; production GLB assets unchanged.')

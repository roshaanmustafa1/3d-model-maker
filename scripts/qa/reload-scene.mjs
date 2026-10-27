import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { buildThreeSceneFromNodes } from '../../engine/scene/scene-builder.ts'
import { hydrateProject } from '../../engine/persistence/project-assets.ts'
const saved = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const restored = saved.snapshot ? await hydrateProject(saved.snapshot) : { scene: saved }
const scene = buildThreeSceneFromNodes(restored.scene.nodes, restored.scene.rootNodeIds, restored.scene.materials)
const geom = scene.children[0].geometry
const actual = JSON.stringify({ positions: Array.from(geom.attributes.position.array), index: geom.index && Array.from(geom.index.array), uv: geom.attributes.uv && Array.from(geom.attributes.uv.array), groups: geom.groups })
assert.equal(actual, saved.expected, 'Saved custom geometry was lost or silently replaced on fresh-process reload')

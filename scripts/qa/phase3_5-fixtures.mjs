import '../../tests/support/file-reader.mjs'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { mkdir, writeFile } from 'node:fs/promises'
const root = 'qa-reports/phase3_5/fixtures'
await mkdir(root, { recursive: true })
const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 0, -1, 0, -1, 1, 0, 0, -1, 0, 0, 1, 0, -1, 1, 0, 0, -1, 0, 1, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3))
geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1], 2))
geometry.computeVertexNormals()
geometry.addGroup(0, 6, 0); geometry.addGroup(6, 6, 1)
const materials = [new THREE.MeshStandardMaterial({ color: '#224466', roughness: .65, metalness: .2 }), new THREE.MeshStandardMaterial({ color: '#eab308', roughness: .2, metalness: .8 })]
materials[0].name = 'Blue_Source'; materials[1].name = 'Gold_Source'
const mesh = new THREE.Mesh(geometry, materials); mesh.name = 'QA_Material_Slots'
const group = new THREE.Group(); group.add(mesh)
const bytes = await new GLTFExporter().parseAsync(group, { binary: true })
await writeFile(`${root}/independent-slots.glb`, Buffer.from(bytes))
console.log('Wrote QA-only two-slot fixture.')

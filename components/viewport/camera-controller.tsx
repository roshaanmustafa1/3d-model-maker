'use client'
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { OrbitControls } from 'three-stdlib'
import { useEditorStore } from '@/stores/editor-store'

export function CameraController({ objectRefs, controlsRef }: { objectRefs: React.RefObject<Map<string, THREE.Object3D>>; controlsRef: React.RefObject<OrbitControls | null> }) {
  const command = useEditorStore(state => state.cameraCommandId)
  const preset = useEditorStore(state => state.cameraPreset)
  const nodes = useEditorStore(state => state.nodes)
  const workspace = useEditorStore(state => state.activeWorkspace)
  const { camera, size } = useThree()
  const applied = useRef('')
  const key = useMemo(() => `${command}:${workspace}:${Object.keys(nodes).join(',')}`, [command, workspace, nodes])
  useFrame(() => {
    if (applied.current === key || !controlsRef.current || !objectRefs.current?.size) return
    // The modeling viewport keeps its established preset callback and camera defaults.
    if (workspace !== 'customizer') return
    const box = new THREE.Box3()
    objectRefs.current.forEach(object => { object.updateWorldMatrix(true, true); box.expandByObject(object) })
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3()), dimensions = box.getSize(new THREE.Vector3())
    const perspective = camera as THREE.PerspectiveCamera
    const angle = Math.min(perspective.fov * Math.PI / 360, Math.atan(Math.tan(perspective.fov * Math.PI / 360) * size.width / size.height))
    const distance = dimensions.length() / 2 / Math.sin(angle) * 1.12
    const directions: Record<string, [number, number, number]> = { front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0], top: [0, 1, .001], perspective: [1, .65, 1] }
    const direction = new THREE.Vector3(...(directions[preset] || directions.perspective)).normalize()
    camera.position.copy(center).addScaledVector(direction, distance)
    controlsRef.current.minDistance = Math.max(.001, distance / 1000)
    controlsRef.current.maxDistance = Math.max(60, distance * 4)
    controlsRef.current.target.copy(center)
    controlsRef.current.update()
    perspective.near = Math.max(.001, distance / 1000)
    perspective.far = Math.max(100, distance * 100)
    perspective.updateProjectionMatrix()
    applied.current = key
  })
  return null
}

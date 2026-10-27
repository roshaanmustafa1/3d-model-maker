'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { TransformControls } from '@react-three/drei'
import { useEditorStore } from '@/stores/editor-store'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { getTopologyForNode } from '@/engine/topology/topology-cache'
import {
  getCentroidOfVertices,
  getVerticesFromEdges,
  getVerticesFromFaces,
} from '@/engine/topology/topology-raycaster'
import { createBufferGeometry } from '@/engine/scene/primitive-factory'

interface TransformGizmoProps {
  objectRefs: React.MutableRefObject<Map<string, THREE.Object3D>>
  orbitControlsRef: React.MutableRefObject<OrbitControlsImpl | null>
}

export function TransformGizmo({ objectRefs, orbitControlsRef }: TransformGizmoProps) {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const node = useEditorStore((state) => (selectedNodeId ? state.nodes[selectedNodeId] : null))
  const transformMode = useEditorStore((state) => state.transformMode)
  const transformSpace = useEditorStore((state) => state.transformSpace)
  const updateNodeTransform = useEditorStore((state) => state.updateNodeTransform)

  const editorMode = useEditorStore((state) => state.editorMode)
  const selectionSubMode = useEditorStore((state) => state.selectionSubMode)
  const selectedVertexIds = useEditorStore((state) => state.selectedVertexIds)
  const selectedEdgeIds = useEditorStore((state) => state.selectedEdgeIds)
  const selectedFaceIds = useEditorStore((state) => state.selectedFaceIds)
  const translateSelectedTopologyVertices = useEditorStore(
    (state) => state.translateSelectedTopologyVertices
  )

  const transformControlsRef = useRef<any>(null)
  const ownTransformControls = useCallback((controls: any) => {
    if (transformControlsRef.current && transformControlsRef.current !== controls) {
      transformControlsRef.current.dispose()
    }
    transformControlsRef.current = controls
  }, [])
  const editProxyRef = useRef<THREE.Group>(null)

  const isDraggingRef = useRef(false)
  const lastLocalPosRef = useRef(new THREE.Vector3())
  const totalDragDeltaLocalRef = useRef(new THREE.Vector3())

  // Get active selected Three.js instance
  const selectedObject = selectedNodeId ? objectRefs.current.get(selectedNodeId) : null

  // 1. OBJECT MODE DRAG HANDLER
  useEffect(() => {
    if (editorMode !== 'object') return
    const controls = transformControlsRef.current
    if (!controls) return

    const handleDraggingChanged = (event: { value: boolean }) => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = !event.value
      }

      if (!event.value && selectedNodeId && selectedObject) {
        const pos = selectedObject.position
        const rot = selectedObject.rotation
        const sca = selectedObject.scale

        updateNodeTransform(
          selectedNodeId,
          {
            position: [pos.x, pos.y, pos.z],
            rotation: [
              THREE.MathUtils.radToDeg(rot.x),
              THREE.MathUtils.radToDeg(rot.y),
              THREE.MathUtils.radToDeg(rot.z),
            ],
            scale: [sca.x, sca.y, sca.z],
          },
          true
        )
      }
    }

    controls.addEventListener('dragging-changed', handleDraggingChanged)
    return () => {
      controls.removeEventListener('dragging-changed', handleDraggingChanged)
    }
  }, [editorMode, selectedNodeId, selectedObject, orbitControlsRef, updateNodeTransform])

  // 2. EDIT MODE DRAG HANDLER
  useEffect(() => {
    if (editorMode !== 'edit') return
    const controls = transformControlsRef.current
    if (!controls) return

    const handleDraggingChanged = (event: { value: boolean }) => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = !event.value
      }
      isDraggingRef.current = event.value

      if (event.value) {
        // Drag started
        if (selectedObject && editProxyRef.current) {
          lastLocalPosRef.current = selectedObject.worldToLocal(
            editProxyRef.current.position.clone()
          )
          totalDragDeltaLocalRef.current.set(0, 0, 0)
        }
      } else {
        // Drag ended: record single undo history step for the total translation
        const total = totalDragDeltaLocalRef.current
        if (total.lengthSq() > 1e-8) {
          const delta: [number, number, number] = [total.x, total.y, total.z]
          const reverseDelta: [number, number, number] = [-total.x, -total.y, -total.z]

          useEditorStore.getState().recordCommand({
            id: `cmd_sub_trans_${Date.now()}`,
            name: 'Translate geometry selection',
            timestamp: Date.now(),
            execute: () => {
              useEditorStore.getState().translateSelectedTopologyVertices(delta, false)
            },
            undo: () => {
              useEditorStore.getState().translateSelectedTopologyVertices(reverseDelta, false)
            },
          })
        }
      }
    }

    const handleObjectChange = () => {
      if (!isDraggingRef.current || !selectedObject || !editProxyRef.current) return

      const currentLocal = selectedObject.worldToLocal(
        editProxyRef.current.position.clone()
      )
      const deltaLocal = currentLocal.clone().sub(lastLocalPosRef.current)

      if (deltaLocal.lengthSq() > 1e-10) {
        translateSelectedTopologyVertices([deltaLocal.x, deltaLocal.y, deltaLocal.z], false)
        totalDragDeltaLocalRef.current.add(deltaLocal)
        lastLocalPosRef.current.copy(currentLocal)
      }
    }

    controls.addEventListener('dragging-changed', handleDraggingChanged)
    controls.addEventListener('objectChange', handleObjectChange)
    return () => {
      controls.removeEventListener('dragging-changed', handleDraggingChanged)
      controls.removeEventListener('objectChange', handleObjectChange)
    }
  }, [editorMode, selectedObject, orbitControlsRef, translateSelectedTopologyVertices])

  // Compute Edit Mode centroid and position proxy
  let hasSubSelection = false
  let centroidWorld: THREE.Vector3 | null = null

  if (editorMode === 'edit' && selectedObject && node?.geometry) {
    const geom = createBufferGeometry(
      node.geometry.type,
      node.geometry.params,
      node.geometry.customGeometryKey
    )
    const graph = getTopologyForNode(node.id, geom)

    let affectedVIds: number[] = []
    if (selectionSubMode === 'vertex') {
      affectedVIds = selectedVertexIds
    } else if (selectionSubMode === 'edge') {
      affectedVIds = getVerticesFromEdges(graph, selectedEdgeIds)
    } else if (selectionSubMode === 'face') {
      affectedVIds = getVerticesFromFaces(graph, selectedFaceIds)
    }

    if (affectedVIds.length > 0) {
      hasSubSelection = true
      const centroidLocal = getCentroidOfVertices(graph, affectedVIds)
      if (centroidLocal) {
        centroidWorld = selectedObject.localToWorld(centroidLocal.clone())
      }
    }
  }

  // Update proxy position when not actively dragging
  useEffect(() => {
    if (editorMode === 'edit' && !isDraggingRef.current && centroidWorld && editProxyRef.current) {
      editProxyRef.current.position.copy(centroidWorld)
      if (selectedObject) {
        lastLocalPosRef.current = selectedObject.worldToLocal(centroidWorld.clone())
      }
    }
  }, [editorMode, centroidWorld, selectedObject])

  if (!selectedNodeId || !selectedObject || transformMode === 'select') {
    return null
  }

  // 1. Edit Mode Gizmo (attached to centroid proxy)
  if (editorMode === 'edit') {
    if (!hasSubSelection || !centroidWorld) return null

    return (
      <>
        <group ref={editProxyRef} position={centroidWorld} />
        {editProxyRef.current && (
          <TransformControls
            ref={ownTransformControls}
            object={editProxyRef.current}
            mode={transformMode}
            space={transformSpace}
            size={0.65}
          />
        )}
      </>
    )
  }

  // 2. Object Mode Gizmo (attached directly to selected object)
  return (
    <TransformControls
      ref={ownTransformControls}
      object={selectedObject}
      mode={transformMode}
      space={transformSpace}
      size={0.75}
    />
  )
}

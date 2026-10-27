'use client'

import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useEditorStore } from '@/stores/editor-store'
import { useDerivedMaterialStore } from '@/stores/derived-material-store'
import { createBufferGeometry } from '@/engine/scene/primitive-factory'
import { syncMeshStandardMaterial } from '@/engine/scene/material-manager'
import { createViewportMaterials } from '@/engine/scene/viewport-materials'
import { getTopologyForNode } from '@/engine/topology/topology-cache'
import { pickTopologyElement } from '@/engine/topology/topology-raycaster'
import { EditModeOverlay } from './edit-mode-overlay'

interface SceneObjectProps {
  nodeId: string
  objectRefs: React.MutableRefObject<Map<string, THREE.Object3D>>
}

export function SceneObject({ nodeId, objectRefs }: SceneObjectProps) {
  const node = useEditorStore((state) => state.nodes[nodeId])
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const selectedNodeIds = useEditorStore((state) => state.selectedNodeIds)
  const hoveredNodeId = useEditorStore((state) => state.hoveredNodeId)
  const viewMode = useEditorStore((state) => state.viewMode)
  const materials = useEditorStore((state) => state.materials)
  const derived = useDerivedMaterialStore(state => state.targets)
  const selectObject = useEditorStore((state) => state.selectObject)
  const toggleObjectSelection = useEditorStore((state) => state.toggleObjectSelection)
  const setHoveredNode = useEditorStore((state) => state.setHoveredNode)
  const showTopologyOverlay = useEditorStore((state) => state.showTopologyOverlay)
  const diagnosticOverlay = useEditorStore((state) => state.diagnosticOverlay)

  const editorMode = useEditorStore((state) => state.editorMode)
  const selectionSubMode = useEditorStore((state) => state.selectionSubMode)
  const toggleVertexSelection = useEditorStore((state) => state.toggleVertexSelection)
  const toggleEdgeSelection = useEditorStore((state) => state.toggleEdgeSelection)
  const toggleFaceSelection = useEditorStore((state) => state.toggleFaceSelection)

  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)

  const isSelected = selectedNodeId === nodeId || selectedNodeIds.includes(nodeId)
  const isHovered = hoveredNodeId === nodeId
  const isEditingThisMesh = isSelected && editorMode === 'edit'

  // Register Three.js instance in ref map for TransformControls
  React.useEffect(() => {
    const target = (node?.type === 'mesh' ? meshRef.current : groupRef.current) as THREE.Object3D | null
    if (target) {
      objectRefs.current.set(nodeId, target)
    }
    return () => {
      objectRefs.current.delete(nodeId)
    }
  }, [nodeId, node?.type, objectRefs])

  // Create geometry instance
  const geometry = useMemo(() => {
    if (!node || node.type !== 'mesh' || !node.geometry) return null
    return createBufferGeometry(
      node.geometry.type,
      node.geometry.params,
      node.geometry.customGeometryKey
    )
  }, [node?.type, node?.geometry?.type, node?.geometry?.params, node?.geometry?.customGeometryKey])

  React.useEffect(() => () => { if (!node?.geometry?.customGeometryKey) geometry?.dispose() }, [geometry, node?.geometry?.customGeometryKey])
  const topologyOverlayGeometry = useMemo(() => geometry && (showTopologyOverlay || viewMode === 'wireframe') ? new THREE.WireframeGeometry(geometry) : null, [geometry, showTopologyOverlay, viewMode])
  React.useEffect(() => () => topologyOverlayGeometry?.dispose(), [topologyOverlayGeometry])

  // Get active topology graph if in edit mode
  const topologyGraph = useMemo(() => {
    if (!isEditingThisMesh || !geometry) return null
    return getTopologyForNode(nodeId, geometry)
  }, [isEditingThisMesh, geometry, nodeId])

  // Create material instance
  const activeMaterials = useMemo(() => {
    const ids = node?.materialIds?.length ? node.materialIds : node?.materialId ? [node.materialId] : []
    const sources = ids.map((id, slot) => {
      if (derived[`${nodeId}:${slot}`]) return derived[`${nodeId}:${slot}`].material
      if (materials[id]) return syncMeshStandardMaterial(materials[id])
      return new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 })
    })
    if (!sources.length) {
      const fallback = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 })
      const previews = createViewportMaterials([fallback], viewMode)
      fallback.dispose()
      return previews
    }
    return createViewportMaterials(sources, viewMode)
  }, [node?.materialId, node?.materialIds, materials, viewMode, derived, nodeId])

  React.useEffect(() => () => activeMaterials.forEach((material) => material.dispose()), [activeMaterials])

  if (!node || !node.visible) return null

  const pos = node.transform.position
  const rot = node.transform.rotation
  const sca = node.transform.scale

  const position: [number, number, number] = [pos[0], pos[1], pos[2]]
  const rotation: [number, number, number, THREE.EulerOrder] = [
    THREE.MathUtils.degToRad(rot[0]),
    THREE.MathUtils.degToRad(rot[1]),
    THREE.MathUtils.degToRad(rot[2]),
    node.transform.rotationOrder || 'XYZ',
  ]
  const scale: [number, number, number] = [sca[0], sca[1], sca[2]]

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    if (isEditingThisMesh && topologyGraph && meshRef.current) {
      const hit = pickTopologyElement(topologyGraph, meshRef.current, e, selectionSubMode)
      if (selectionSubMode === 'vertex' && hit.vertexId !== undefined) {
        toggleVertexSelection(hit.vertexId, e.shiftKey)
      } else if (selectionSubMode === 'edge' && hit.edgeId !== undefined) {
        toggleEdgeSelection(hit.edgeId, e.shiftKey)
      } else if (selectionSubMode === 'face' && hit.faceId !== undefined) {
        toggleFaceSelection(hit.faceId, e.shiftKey)
      }
      return
    }

    if (!node.locked) {
      if (e.shiftKey) {
        toggleObjectSelection(nodeId, true)
      } else {
        selectObject(nodeId)
      }
    }
  }

  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHoveredNode(nodeId)
  }

  const handlePointerOut = () => {
    if (hoveredNodeId === nodeId) {
      setHoveredNode(null)
    }
  }

  // Subtle selection bounding box (used in solid mode so surfaces are not obscured by triangles)
  const selectionBoxGeometry = useMemo(() => {
    if (!geometry) return null
    geometry.computeBoundingBox()
    const box = geometry.boundingBox
    if (!box) return null
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const boxGeom = new THREE.BoxGeometry(size.x, size.y, size.z)
    boxGeom.translate(center.x, center.y, center.z)
    const edges = new THREE.EdgesGeometry(boxGeom)
    boxGeom.dispose()
    return edges
  }, [geometry])

  React.useEffect(() => {
    return () => {
      selectionBoxGeometry?.dispose()
    }
  }, [selectionBoxGeometry])

  // Visual diagnostics: boundary edges (cyan), non-manifold edges (red), degenerate faces (orange)
  const diagnosticElements = useMemo(() => {
    if (!diagnosticOverlay.enabled || !isSelected || !geometry) return null
    const graph = getTopologyForNode(nodeId, geometry)
    if (!graph) return null

    const boundaryPositions: number[] = []
    if (diagnosticOverlay.showBoundaryEdges) {
      for (const edge of graph.edges.values()) {
        if (edge.faceIds.length === 1) {
          const v0 = graph.vertices.get(edge.vertexIds[0])?.position
          const v1 = graph.vertices.get(edge.vertexIds[1])?.position
          if (v0 && v1) {
            boundaryPositions.push(v0[0], v0[1], v0[2], v1[0], v1[1], v1[2])
          }
        }
      }
    }

    const nonManifoldPositions: number[] = []
    if (diagnosticOverlay.showNonManifoldEdges) {
      for (const edge of graph.edges.values()) {
        if (edge.faceIds.length > 2) {
          const v0 = graph.vertices.get(edge.vertexIds[0])?.position
          const v1 = graph.vertices.get(edge.vertexIds[1])?.position
          if (v0 && v1) {
            nonManifoldPositions.push(v0[0], v0[1], v0[2], v1[0], v1[1], v1[2])
          }
        }
      }
    }

    const degeneratePositions: number[] = []
    if (diagnosticOverlay.showDegenerateFaces) {
      for (const face of graph.faces.values()) {
        const [v0, v1, v2] = face.vertexIds
        const p0 = graph.vertices.get(v0)?.position
        const p1 = graph.vertices.get(v1)?.position
        const p2 = graph.vertices.get(v2)?.position
        if (p0 && p1 && p2) {
          if (v0 === v1 || v1 === v2 || v2 === v0) {
            degeneratePositions.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2])
          } else {
            const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2]
            const bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2]
            const cx = ay * bz - az * by
            const cy = az * bx - ax * bz
            const cz = ax * by - ay * bx
            if (0.5 * Math.hypot(cx, cy, cz) < 1e-10) {
              degeneratePositions.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2])
            }
          }
        }
      }
    }

    const boundaryGeom = boundaryPositions.length > 0 ? new THREE.BufferGeometry() : null
    if (boundaryGeom) {
      boundaryGeom.setAttribute('position', new THREE.Float32BufferAttribute(boundaryPositions, 3))
    }

    const nonManifoldGeom = nonManifoldPositions.length > 0 ? new THREE.BufferGeometry() : null
    if (nonManifoldGeom) {
      nonManifoldGeom.setAttribute('position', new THREE.Float32BufferAttribute(nonManifoldPositions, 3))
    }

    const degenerateGeom = degeneratePositions.length > 0 ? new THREE.BufferGeometry() : null
    if (degenerateGeom) {
      degenerateGeom.setAttribute('position', new THREE.Float32BufferAttribute(degeneratePositions, 3))
    }

    return { boundaryGeom, nonManifoldGeom, degenerateGeom }
  }, [diagnosticOverlay, isSelected, geometry, nodeId])

  React.useEffect(() => {
    return () => {
      diagnosticElements?.boundaryGeom?.dispose()
      diagnosticElements?.nonManifoldGeom?.dispose()
      diagnosticElements?.degenerateGeom?.dispose()
    }
  }, [diagnosticElements])

  if (node.type === 'mesh' && geometry) {
    return (
      <mesh
        ref={meshRef}
        name={node.name}
        geometry={geometry}
        material={activeMaterials.length === 1 ? activeMaterials[0] : activeMaterials}
        dispose={null}
        position={position}
        rotation={rotation}
        scale={scale}
        castShadow
        receiveShadow
        onClick={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Full mesh topology wireframe overlay (explicit toggle or wireframe view mode) */}
        {!isEditingThisMesh && (showTopologyOverlay || viewMode === 'wireframe') && (
          <lineSegments geometry={topologyOverlayGeometry || undefined}>
            <lineBasicMaterial
              attach="material"
              color={isSelected ? '#10b981' : '#64748b'}
              linewidth={1}
              depthTest
              transparent
              opacity={isSelected ? 0.9 : 0.4}
            />
          </lineSegments>
        )}

        {/* Object Mode subtle selection / hover bounding indicator (non-destructive, does NOT cover surface in triangles) */}
        {!isEditingThisMesh && !showTopologyOverlay && viewMode !== 'wireframe' && (isSelected || isHovered) && selectionBoxGeometry && (
          <lineSegments geometry={selectionBoxGeometry}>
            <lineBasicMaterial
              attach="material"
              color={isSelected ? '#10b981' : '#38bdf8'}
              linewidth={isSelected ? 1.5 : 1}
              depthTest
              transparent
              opacity={isSelected ? 0.85 : 0.45}
            />
          </lineSegments>
        )}

        {/* Visual Diagnostics Overlays */}
        {diagnosticElements?.boundaryGeom && (
          <lineSegments geometry={diagnosticElements.boundaryGeom}>
            <lineBasicMaterial attach="material" color="#06b6d4" linewidth={2} depthTest={false} />
          </lineSegments>
        )}
        {diagnosticElements?.nonManifoldGeom && (
          <lineSegments geometry={diagnosticElements.nonManifoldGeom}>
            <lineBasicMaterial attach="material" color="#ef4444" linewidth={2} depthTest={false} />
          </lineSegments>
        )}
        {diagnosticElements?.degenerateGeom && (
          <mesh geometry={diagnosticElements.degenerateGeom}>
            <meshBasicMaterial attach="material" color="#f97316" side={THREE.DoubleSide} depthTest={false} transparent opacity={0.7} />
          </mesh>
        )}

        {/* Edit Mode Topology Overlay */}
        {isEditingThisMesh && topologyGraph && (
          <EditModeOverlay graph={topologyGraph} />
        )}

        {/* Child nodes */}
        {node.children.map((childId) => (
          <SceneObject key={childId} nodeId={childId} objectRefs={objectRefs} />
        ))}
      </mesh>
    )
  }

  return (
    <group
      ref={groupRef}
      name={node.name}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {node.children.map((childId) => (
        <SceneObject key={childId} nodeId={childId} objectRefs={objectRefs} />
      ))}
    </group>
  )
}

interface SceneRendererProps {
  objectRefs: React.MutableRefObject<Map<string, THREE.Object3D>>
}

export function SceneRenderer({ objectRefs }: SceneRendererProps) {
  const rootNodeIds = useEditorStore((state) => state.rootNodeIds)
  const updateStats = useEditorStore((state) => state.updateStats)

  // Smooth FPS tracking
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useFrame(() => {
    frameCount.current++
    const now = performance.now()
    if (now - lastTime.current >= 600) {
      const calculatedFps = Math.round((frameCount.current * 1000) / (now - lastTime.current))
      updateStats({ fps: Math.min(calculatingFpsCap(calculatedFps), 144) })
      frameCount.current = 0
      lastTime.current = now
    }
  })

  return (
    <group name="SceneRoot">
      {rootNodeIds.map((nodeId) => (
        <SceneObject key={nodeId} nodeId={nodeId} objectRefs={objectRefs} />
      ))}
    </group>
  )
}

function calculatingFpsCap(fps: number): number {
  return fps > 0 ? fps : 60
}

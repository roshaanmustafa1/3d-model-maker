'use client'

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useEditorStore } from '@/stores/editor-store'
import { TopologyGraph } from '@/types/topology'
import { getVerticesFromEdges, getVerticesFromFaces } from '@/engine/topology/topology-raycaster'

interface EditModeOverlayProps {
  graph: TopologyGraph
}

export function EditModeOverlay({ graph }: EditModeOverlayProps) {
  const selectionSubMode = useEditorStore((state) => state.selectionSubMode)
  const selectedVertexIds = useEditorStore((state) => state.selectedVertexIds)
  const selectedEdgeIds = useEditorStore((state) => state.selectedEdgeIds)
  const selectedFaceIds = useEditorStore((state) => state.selectedFaceIds)
  const overlayVisible = useEditorStore((state) => state.editModeOverlayVisible)

  // 1. Vertex points geometry
  const vertexPointsData = useMemo(() => {
    if (!overlayVisible.vertices) return null
    const positions: number[] = []
    const colors: number[] = []

    const selectedSet = new Set<number>()
    if (selectionSubMode === 'vertex') {
      selectedVertexIds.forEach((id) => selectedSet.add(id))
    } else if (selectionSubMode === 'edge') {
      getVerticesFromEdges(graph, selectedEdgeIds).forEach((id) => selectedSet.add(id))
    } else if (selectionSubMode === 'face') {
      getVerticesFromFaces(graph, selectedFaceIds).forEach((id) => selectedSet.add(id))
    }

    for (const v of graph.vertices.values()) {
      positions.push(v.position[0], v.position[1], v.position[2])
      if (selectedSet.has(v.id)) {
        // Gold / Orange #f59e0b
        colors.push(0.96, 0.62, 0.04)
      } else {
        // Cyan / Sky #38bdf8
        colors.push(0.22, 0.74, 0.97)
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geom
  }, [graph, selectedVertexIds, selectedEdgeIds, selectedFaceIds, selectionSubMode, overlayVisible.vertices])

  // 2. Edge wireframe geometry
  const edgeLinesData = useMemo(() => {
    if (!overlayVisible.edges) return null
    const positions: number[] = []
    const colors: number[] = []

    const selectedEdgeSet = new Set(selectedEdgeIds)

    for (const edge of graph.edges.values()) {
      const v0 = graph.vertices.get(edge.vertexIds[0])
      const v1 = graph.vertices.get(edge.vertexIds[1])
      if (!v0 || !v1) continue

      positions.push(v0.position[0], v0.position[1], v0.position[2])
      positions.push(v1.position[0], v1.position[1], v1.position[2])

      const isSel = selectionSubMode === 'edge' && selectedEdgeSet.has(edge.id)
      const isBoundary = edge.faceIds.length === 1

      if (isSel) {
        colors.push(0.96, 0.62, 0.04, 0.96, 0.62, 0.04)
      } else if (isBoundary) {
        // Boundary edge highlighted in rose #f43f5e
        colors.push(0.95, 0.25, 0.37, 0.95, 0.25, 0.37)
      } else {
        // Subtle slate #475569
        colors.push(0.28, 0.33, 0.41, 0.28, 0.33, 0.41)
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geom
  }, [graph, selectedEdgeIds, selectionSubMode, overlayVisible.edges])

  // 3. Face highlight geometry for selected faces
  const selectedFacesData = useMemo(() => {
    if (!overlayVisible.faces || selectionSubMode !== 'face' || !selectedFaceIds.length) return null
    const positions: number[] = []

    for (const faceId of selectedFaceIds) {
      const face = graph.faces.get(faceId)
      if (!face) continue
      const v0 = graph.vertices.get(face.vertexIds[0])
      const v1 = graph.vertices.get(face.vertexIds[1])
      const v2 = graph.vertices.get(face.vertexIds[2])
      if (!v0 || !v1 || !v2) continue

      positions.push(v0.position[0], v0.position[1], v0.position[2])
      positions.push(v1.position[0], v1.position[1], v1.position[2])
      positions.push(v2.position[0], v2.position[1], v2.position[2])
    }

    if (!positions.length) return null
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [graph, selectedFaceIds, selectionSubMode, overlayVisible.faces])

  return (
    <group name="EditModeOverlay">
      {/* Edges Wireframe */}
      {edgeLinesData && (
        <lineSegments geometry={edgeLinesData} raycast={() => null}>
          <lineBasicMaterial vertexColors depthTest={true} transparent opacity={0.85} linewidth={1} />
        </lineSegments>
      )}

      {/* Selected Faces Highlight */}
      {selectedFacesData && (
        <mesh geometry={selectedFacesData} raycast={() => null}>
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} side={THREE.DoubleSide} depthTest={true} />
        </mesh>
      )}

      {/* Vertices Points */}
      {vertexPointsData && (
        <points geometry={vertexPointsData} raycast={() => null}>
          <pointsMaterial vertexColors size={6} sizeAttenuation={false} depthTest={false} transparent opacity={0.9} />
        </points>
      )}
    </group>
  )
}

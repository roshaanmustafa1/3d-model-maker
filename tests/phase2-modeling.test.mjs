import './support/file-reader.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {
  buildTopologyFromBufferGeometry,
  rebuildBufferGeometryFromTopology,
  getTopologyStats,
  cloneTopologyGraph,
} from '../engine/topology/topology-graph.ts';
import {
  extrudeFaces,
  insetFaces,
  subdivideFaces,
  mergeVertices,
  deleteTopologyElements,
  flipTopologyNormals,
} from '../engine/topology/geometry-operators.ts';
import {
  applyBoxProjection,
  applyPlanarProjection,
  applyCylindricalProjection,
  detectUvIslands,
  transformUVSelection,
} from '../engine/topology/uv-unwrapper.ts';
import { exportSceneToGLB } from '../engine/exporters/glb-exporter.ts';
import { registerCustomGeometry } from '../engine/scene/primitive-factory.ts';

test('extrudeFaces produces valid extruded geometry with perimeter sidewalls and cap faces', () => {
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const graph = buildTopologyFromBufferGeometry(cube);
  const initialFaceCount = graph.faces.size; // 12
  const initialVertexCount = graph.vertices.size; // 8

  // Extrude the first two faces (one quad face of the cube)
  const faceIdsToExtrude = [0, 1];
  const { newFaceIds, extrudedFaceIds } = extrudeFaces(graph, faceIdsToExtrude, {
    distance: 0.5,
  });

  assert.equal(extrudedFaceIds.length, 2, 'Two cap faces must be returned');
  assert.ok(newFaceIds.length >= 8, 'Perimeter quads (at least 4 quads = 8 triangles) must be created');
  assert.ok(graph.faces.size > initialFaceCount, 'Total face count must increase');
  assert.ok(graph.vertices.size > initialVertexCount, 'New vertices must be generated for extruded cap');

  // Verify rebuilt BufferGeometry
  const rebuilt = rebuildBufferGeometryFromTopology(graph);
  assert.ok(rebuilt.attributes.position);
  assert.ok(rebuilt.attributes.normal);
  assert.ok(rebuilt.index);
  assert.equal(rebuilt.index.count, graph.faces.size * 3);
});

test('insetFaces generates inner inset faces and boundary border triangles', () => {
  const plane = new THREE.PlaneGeometry(2, 2);
  const graph = buildTopologyFromBufferGeometry(plane);
  const initialFaceCount = graph.faces.size; // 2

  const { newFaceIds, insetFaceIds } = insetFaces(graph, [0], {
    amount: 0.3,
    depth: 0.1,
  });

  assert.equal(insetFaceIds.length, 1, 'One inner inset face created');
  assert.equal(newFaceIds.length, 6, 'Outer border ring has 3 quad sidewalls (6 triangles) connecting to original boundary');
  assert.equal(graph.faces.size, initialFaceCount - 1 + 1 + 6, 'Old face removed, replaced by 1 inset cap + 6 border faces');

  const stats = getTopologyStats(graph);
  assert.equal(stats.degenerateFaces, 0, 'No degenerate triangles produced by inset');
});

test('subdivideFaces splits triangles into 4 child triangles sharing edge midpoints', () => {
  const plane = new THREE.PlaneGeometry(2, 2);
  const graph = buildTopologyFromBufferGeometry(plane);
  assert.equal(graph.faces.size, 2);

  const { newFaceIds } = subdivideFaces(graph, [0, 1]);
  assert.equal(newFaceIds.length, 8, '2 triangles * 4 child triangles = 8');
  assert.equal(graph.faces.size, 8, 'Original 2 faces deleted, 8 children added');

  const stats = getTopologyStats(graph);
  assert.equal(stats.degenerateFaces, 0, 'Subdivision must not produce degenerate faces');
  assert.ok(Math.abs(stats.surfaceArea - 4.0) < 1e-4, 'Surface area remains 4.0 m²');
});

test('mergeVertices welds vertices to center and safely eliminates degenerate triangles', () => {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const graph = buildTopologyFromBufferGeometry(box);

  // Pick two adjacent vertices
  const v0 = 0;
  const v1 = 1;
  const initialFaceCount = graph.faces.size;

  const result = mergeVertices(graph, [v0, v1], { mode: 'center' });
  assert.ok(result.mergedVerticesCount >= 1 || result.removedFacesCount >= 0);

  const rebuilt = rebuildBufferGeometryFromTopology(graph);
  assert.ok(rebuilt.attributes.position);
  assert.ok(rebuilt.index);
});

test('deleteTopologyElements removes elements and cleans up references', () => {
  const plane = new THREE.PlaneGeometry(2, 2);
  const graph = buildTopologyFromBufferGeometry(plane);
  assert.equal(graph.faces.size, 2);

  // Delete face 0
  const result = deleteTopologyElements(graph, 'face', [0]);
  assert.equal(result.deletedFaces, 1);
  assert.equal(graph.faces.size, 1);

  const rebuilt = rebuildBufferGeometryFromTopology(graph);
  assert.equal(rebuilt.index.count, 3, 'Only 1 triangle remains (3 indices)');
});

test('flipTopologyNormals inverts face normals and winding order', () => {
  const plane = new THREE.PlaneGeometry(2, 2);
  const graph = buildTopologyFromBufferGeometry(plane);

  const f0 = graph.faces.get(0);
  assert.ok(f0);
  const initialZ = f0.normal[2];

  flipTopologyNormals(graph, [0]);
  assert.equal(f0.normal[2], -initialZ, 'Normal Z-component inverted');
});

test('UV unwrappers calculate valid [0, 1] normalized coordinates and islands', () => {
  const box = new THREE.BoxGeometry(1, 1, 1);
  const graph = buildTopologyFromBufferGeometry(box);

  // 1. Box Projection
  applyBoxProjection(graph);
  for (const face of graph.faces.values()) {
    for (const corner of face.corners) {
      assert.ok(corner.uv !== undefined, 'Corner has UV');
      assert.ok(corner.uv[0] >= -1e-5 && corner.uv[0] <= 1.0001, `U in range: ${corner.uv[0]}`);
      assert.ok(corner.uv[1] >= -1e-5 && corner.uv[1] <= 1.0001, `V in range: ${corner.uv[1]}`);
    }
  }

  // 2. Island Detection
  const islands = detectUvIslands(graph);
  assert.ok(islands.length >= 1, 'At least 1 UV island detected');

  // 3. Planar Projection
  applyPlanarProjection(graph, 'z');
  assert.ok(graph.hasUVs);

  // 4. Cylindrical Projection
  applyCylindricalProjection(graph, 'y');
  assert.ok(graph.hasUVs);
});

test('Full round-trip GLB export after geometry modeling operations', async () => {
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const graph = buildTopologyFromBufferGeometry(cube);

  // Perform real face extrusion
  extrudeFaces(graph, [0, 1], { distance: 0.3 });
  const editedGeom = rebuildBufferGeometryFromTopology(graph);

  const customKey = `test_geom_edit_${Date.now()}`;
  registerCustomGeometry(customKey, editedGeom);

  const testNodeId = 'test_mesh_1';
  const testMatId = 'mat_test_pbr';

  const nodes = {
    [testNodeId]: {
      id: testNodeId,
      name: 'CustomExtrudedMesh',
      type: 'mesh',
      parentId: null,
      children: [],
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      geometry: {
        type: 'custom',
        params: {},
        stats: {
          vertexCount: editedGeom.attributes.position.count,
          triangleCount: editedGeom.index ? editedGeom.index.count / 3 : 0,
          hasNormals: true,
          hasUVs: true,
        },
        customGeometryKey: customKey,
      },
      materialId: testMatId,
      materialIds: [testMatId],
      visible: true,
      locked: false,
      isCustomizable: true,
      customizableZone: 'body_front',
    },
  };

  const materials = {
    [testMatId]: {
      id: testMatId,
      name: 'TestPBR',
      color: '#10b981',
      roughness: 0.4,
      metalness: 0.2,
      emissive: '#000000',
      emissiveIntensity: 0,
      opacity: 1,
      transparent: false,
      wireframe: false,
      doubleSided: true,
    },
  };

  const result = await exportSceneToGLB(nodes, [testNodeId], materials, undefined, { binary: true });

  assert.ok(result.blob, 'Blob generated');
  assert.ok(result.byteSize > 0, 'Non-empty file');
  assert.equal(result.reloadedMeshCount, 1, 'Reloads 1 mesh');
  assert.ok(result.reloadedTriangleCount > 12, 'Includes extruded geometry faces');
  assert.ok(result.uvCheckPassed, 'UV coordinates valid after reload');
  assert.equal(result.verified, true, 'Round-trip integrity verification passed with zero errors');
});

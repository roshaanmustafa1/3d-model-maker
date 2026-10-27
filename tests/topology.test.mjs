import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import {
  buildTopologyFromBufferGeometry,
  rebuildBufferGeometryFromTopology,
  updateBufferGeometryPositions,
  getTopologyStats,
} from '../engine/topology/topology-graph.ts';
import {
  getCentroidOfVertices,
  getVerticesFromEdges,
  getVerticesFromFaces,
  pickTopologyElement,
} from '../engine/topology/topology-raycaster.ts';

test('TopologyGraph unifies cube buffer vertices into 8 unique 3D vertices and preserves 12 triangles', () => {
  const cubeGeom = new THREE.BoxGeometry(1, 1, 1);
  assert.equal(cubeGeom.attributes.position.count, 24, 'Three.js box has 24 vertices for flat normals');

  const graph = buildTopologyFromBufferGeometry(cubeGeom);
  assert.equal(graph.vertices.size, 8, 'A cube must topologically have exactly 8 unique vertices');
  assert.equal(graph.faces.size, 12, 'A triangulated cube has 12 faces');

  const stats = getTopologyStats(graph);
  assert.equal(stats.uniqueVertices, 8);
  assert.equal(stats.bufferVertices, 24);
  assert.equal(stats.totalFaces, 12);
  assert.equal(stats.boundaryEdges, 0, 'A closed cube has zero open boundary edges');
  assert.equal(stats.nonManifoldEdges, 0, 'A valid cube is a 2-manifold surface');
  assert.ok(Math.abs(stats.surfaceArea - 6.0) < 1e-4, 'Surface area of 1x1x1 cube is 6');
});

test('TopologyGraph accurately detects open boundaries on plane geometry', () => {
  const planeGeom = new THREE.PlaneGeometry(2, 2);
  const graph = buildTopologyFromBufferGeometry(planeGeom);

  assert.equal(graph.vertices.size, 4, 'Plane has 4 unique corner vertices');
  assert.equal(graph.faces.size, 2, 'Plane has 2 triangles');
  assert.equal(graph.edges.size, 5, 'Plane has 4 boundary edges + 1 shared diagonal edge');

  const stats = getTopologyStats(graph);
  assert.equal(stats.boundaryEdges, 4, 'Outer border of quad must be 4 boundary edges');
  assert.equal(stats.nonManifoldEdges, 0);
  assert.ok(Math.abs(stats.surfaceArea - 4.0) < 1e-4, 'Surface area of 2x2 plane is 4');
});

test('rebuildBufferGeometryFromTopology restores renderable geometry with valid indices and UVs', () => {
  const box = new THREE.BoxGeometry(2, 3, 4);
  const graph = buildTopologyFromBufferGeometry(box);
  const rebuilt = rebuildBufferGeometryFromTopology(graph);

  assert.ok(rebuilt.attributes.position, 'Has position attribute');
  assert.ok(rebuilt.attributes.normal, 'Has normal attribute');
  assert.ok(rebuilt.attributes.uv, 'Has UV attribute');
  assert.ok(rebuilt.index, 'Has index buffer');
  assert.equal(rebuilt.index.count, 36, '12 triangles * 3 indices = 36');

  // Verify Raycaster intersection works against rebuilt geometry
  const mesh = new THREE.Mesh(rebuilt, new THREE.MeshBasicMaterial());
  const raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 10), new THREE.Vector3(0, 0, -1));
  const intersects = raycaster.intersectObject(mesh);
  assert.ok(intersects.length > 0, 'Raycaster must successfully intersect rebuilt geometry');
  assert.ok(intersects[0].point.z >= 1.99, 'Intersected front face of 4-depth box at z=2');
});

test('updateBufferGeometryPositions modifies buffer positions in place and updates stats', () => {
  const geom = new THREE.BoxGeometry(2, 2, 2);
  const graph = buildTopologyFromBufferGeometry(geom);

  // Translate all top vertices (+Y) by +1
  for (const v of graph.vertices.values()) {
    if (v.position[1] > 0.5) {
      v.position[1] += 1.0;
    }
  }

  updateBufferGeometryPositions(geom, graph);
  geom.computeBoundingBox();

  assert.ok(geom.boundingBox);
  assert.ok(Math.abs(geom.boundingBox.max.y - 2.0) < 1e-4, 'Top bound moved from y=1 to y=2');
  assert.ok(Math.abs(geom.boundingBox.min.y - (-1.0)) < 1e-4, 'Bottom bound remained at y=-1');
});

test('Centroid computation and element picking helper calculations', () => {
  const geom = new THREE.BoxGeometry(2, 2, 2);
  const graph = buildTopologyFromBufferGeometry(geom);

  const allVIds = Array.from(graph.vertices.keys());
  const centroid = getCentroidOfVertices(graph, allVIds);
  assert.ok(centroid);
  assert.ok(centroid.length() < 1e-5, 'Center of symmetric box is (0,0,0)');

  // Pick edge vertices
  const edge = graph.edges.get(0);
  assert.ok(edge);
  const vIds = getVerticesFromEdges(graph, [0]);
  assert.equal(vIds.length, 2);

  // Pick face vertices
  const fVIds = getVerticesFromFaces(graph, [0]);
  assert.equal(fVIds.length, 3);
});

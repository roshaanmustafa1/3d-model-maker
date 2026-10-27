import { SceneNode, MaterialData } from '@/types/scene'
import { ValidationReport, ValidationCheck } from '@/types/validation'
import { buildThreeSceneFromNodes } from '@/engine/scene/scene-builder'
import { inspectScene } from './scene-integrity'
import * as THREE from 'three'
import { inspectModelForCustomization } from '@/engine/customization/zone-mapper'
import { verifyRuntimeContract } from './runtime-contract'

export function validateBlackBulletModel(
  nodes: Record<string, SceneNode>,
  rootNodeIds: string[],
  materials: Record<string, MaterialData>,
  modelName: string = 'Current Scene'
): ValidationReport {
  const checks: ValidationCheck[] = []
  const allNodes = Object.values(nodes)
  const meshNodes = allNodes.filter((n) => n.type === 'mesh')
  const scene = buildThreeSceneFromNodes(nodes, rootNodeIds, materials, undefined, false)
  const integrity = inspectScene(scene)
  const runtimeContractValid = verifyRuntimeContract(scene)
  checks.push({ id: 'runtime_contract', category: 'uv', title: 'BlackBullet Runtime Contract',
    description: 'Verifies registered front/back surfaces, material targets and actual atlas UVs.',
    status: runtimeContractValid ? 'pass' : 'fail',
    details: runtimeContractValid ? 'Front/back targets satisfy the shirt runtime contract.' : 'Runtime region registration or atlas UV validation failed.',
    recommendation: runtimeContractValid ? undefined : 'Prepare explicit front/back surfaces and atlas UVs, or export using Preserve Imported Appearance.' })
  for (const [status, messages] of [['fail', integrity.errors], ['warn', integrity.warnings]] as const) {
    messages.forEach((message, index) => checks.push({
      id: `integrity_${status}_${index}`, category: 'glb', title: 'Scene Integrity',
      description: 'Inspects actual geometry, materials and world transforms.', status, details: message,
    }))
  }
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      const assigned = Array.isArray(object.material) ? object.material : [object.material]
      assigned.forEach((material) => material.dispose())
    }
  })

  let meshesWithUV = 0
  let customizableZonesFound: string[] = []
  let nonConformingNames = 0

  // 1. Scene Existence check
  if (meshNodes.length === 0) {
    checks.push({
      id: 'geom_presence',
      category: 'glb',
      title: 'Geometry Presence',
      description: 'Check if scene contains at least one 3D mesh.',
      status: 'fail',
      details: 'No meshes found in scene.',
      recommendation: 'Add or import at least one 3D object.',
    })
  } else {
    checks.push({
      id: 'geom_presence',
      category: 'glb',
      title: 'Geometry Presence',
      description: 'Scene contains valid 3D geometry.',
      status: 'pass',
      details: `Found ${meshNodes.length} mesh object(s).`,
    })
  }

  // 2. Hierarchy Check
  const hasHierarchicalStructure = rootNodeIds.length > 0 && allNodes.length > 1
  if (hasHierarchicalStructure) {
    checks.push({
      id: 'hierarchy_structure',
      category: 'hierarchy',
      title: 'Mesh Hierarchy',
      description: 'Evaluates parent-child scene organization.',
      status: 'pass',
      details: `Found ${rootNodeIds.length} root node(s) with structured child components.`,
    })
  } else {
    checks.push({
      id: 'hierarchy_structure',
      category: 'hierarchy',
      title: 'Mesh Hierarchy',
      description: 'Evaluates parent-child scene organization.',
      status: 'warn',
      details: 'Scene has a flat structure without grouped components.',
      recommendation: 'Group meshes into a logical hierarchy (e.g., HoodieRoot > Body_Main, Sleeves).',
    })
  }

  // 3. Normals Check
  let allHaveNormals = true
  for (const mesh of meshNodes) {
    if (!mesh.geometry?.stats.hasNormals) {
      allHaveNormals = false
    }
  }
  if (allHaveNormals && meshNodes.length > 0) {
    checks.push({
      id: 'normals_check',
      category: 'glb',
      title: 'Vertex Normals',
      description: 'All meshes must possess calculated vertex normals for PBR shading.',
      status: 'pass',
      details: 'All meshes have valid vertex normals.',
    })
  } else if (meshNodes.length > 0) {
    checks.push({
      id: 'normals_check',
      category: 'glb',
      title: 'Vertex Normals',
      description: 'All meshes must possess calculated vertex normals for PBR shading.',
      status: 'fail',
      details: 'One or more meshes lack calculated vertex normals.',
      recommendation: 'Use "Recalculate Normals" in the Geometry tab.',
    })
  }

  // 4. UV Coordinates Coverage
  for (const mesh of meshNodes) {
    if (mesh.geometry?.stats.hasUVs) {
      meshesWithUV++
    }
  }
  if (meshesWithUV === meshNodes.length && meshNodes.length > 0) {
    checks.push({
      id: 'uv_coordinates',
      category: 'uv',
      title: 'UV Coordinates',
      description: 'Required for texture placement and product customization in BlackBullet.',
      status: 'pass',
      details: `All ${meshesWithUV} mesh(es) have UV coordinates.`,
    })
  } else if (meshesWithUV > 0) {
    checks.push({
      id: 'uv_coordinates',
      category: 'uv',
      title: 'UV Coordinates',
      description: 'Required for texture placement and product customization in BlackBullet.',
      status: 'warn',
      details: `${meshesWithUV} of ${meshNodes.length} meshes have UVs. Missing on ${meshNodes.length - meshesWithUV} mesh(es).`,
      recommendation: 'Inspect UVs in the UV Lab or re-generate UV unwrap.',
    })
  } else if (meshNodes.length > 0) {
    checks.push({
      id: 'uv_coordinates',
      category: 'uv',
      title: 'UV Coordinates',
      description: 'Required for texture placement and product customization in BlackBullet.',
      status: 'fail',
      details: 'Zero meshes have UV coordinates! Texture placement will fail.',
      recommendation: 'Generate UV mapping before exporting for BlackBullet.',
    })
  }

  // 5. PBR Materials
  let hasValidMaterials = true
  for (const mesh of meshNodes) {
    if (!mesh.materialId || !materials[mesh.materialId]) {
      hasValidMaterials = false
    }
  }
  if (hasValidMaterials && meshNodes.length > 0) {
    checks.push({
      id: 'pbr_materials',
      category: 'material',
      title: 'PBR Materials',
      description: 'Standard PBR materials (base color, roughness, metalness) compatible with Three.js.',
      status: 'pass',
      details: 'All meshes have valid PBR material assignments.',
    })
  } else if (meshNodes.length > 0) {
    checks.push({
      id: 'pbr_materials',
      category: 'material',
      title: 'PBR Materials',
      description: 'Standard PBR materials (base color, roughness, metalness) compatible with Three.js.',
      status: 'warn',
      details: 'Some meshes lack assigned materials.',
      recommendation: 'Assign materials in the Material tab.',
    })
  }

  // 6. Customizable Zones
  for (const mesh of meshNodes) {
    if (mesh.isCustomizable && mesh.customizableZone) {
      if (!customizableZonesFound.includes(mesh.customizableZone)) {
        customizableZonesFound.push(mesh.customizableZone)
      }
    }
  }
  if (customizableZonesFound.length > 0) {
    checks.push({
      id: 'customizable_zones',
      category: 'naming',
      title: 'Customizable Zones',
      description: 'Identifies design zones (e.g., front, back, sleeves) for BlackBullet design placement.',
      status: 'pass',
      details: `Configured zones: ${customizableZonesFound.join(', ')}`,
    })
  } else {
    checks.push({
      id: 'customizable_zones',
      category: 'naming',
      title: 'Customizable Zones',
      description: 'Identifies design zones for BlackBullet design placement.',
      status: 'warn',
      details: 'No customizable design zones configured.',
      recommendation: 'Select customizable meshes and assign zones in the BlackBullet tab.',
    })
  }

  // 7. Transform Sanity Check
  let hasNegativeScale = false
  let hasInvalidScale = false
  for (const node of allNodes) {
    if (node.transform.scale.some((s) => s < 0)) {
      hasNegativeScale = true
    }
    if (node.transform.scale.some((s) => !Number.isFinite(s) || s === 0)) hasInvalidScale = true
  }
  if (!hasNegativeScale && !hasInvalidScale) {
    checks.push({
      id: 'transform_scales',
      category: 'transform',
      title: 'Transform Normalization',
      description: 'Ensures positive scale vectors to prevent inverted geometry normals in WebGL.',
      status: 'pass',
      details: 'All node scales are positive and valid.',
    })
  } else {
    checks.push({
      id: 'transform_scales',
      category: 'transform',
      title: 'Transform Normalization',
      description: 'Ensures positive scale vectors to prevent inverted geometry normals in WebGL.',
      status: hasInvalidScale ? 'fail' : 'warn',
      details: hasInvalidScale ? 'Detected zero or non-finite scale values.' : 'Mirrored transforms detected; orientation must be verified downstream.',
      recommendation: 'Repair singular transforms. Preserve intentional mirrors and verify face orientation in BlackBullet.',
    })
  }

  // 8. Triangle Count / Performance check
  let totalTris = 0
  for (const mesh of meshNodes) {
    totalTris += mesh.geometry?.stats.triangleCount || 0
  }
  if (totalTris > 150000) {
    checks.push({
      id: 'poly_count',
      category: 'glb',
      title: 'Polygon Budget',
      description: 'Checks for real-time mobile and web browser suitability.',
      status: 'warn',
      details: `Total triangles: ${totalTris.toLocaleString()} (Exceeds recommended 80k for mobile 3D configurators).`,
      recommendation: 'Consider decimation / mesh simplification.',
    })
  } else {
    checks.push({
      id: 'poly_count',
      category: 'glb',
      title: 'Polygon Budget',
      description: 'Checks for real-time mobile and web browser suitability.',
      status: 'pass',
      details: `Total triangles: ${totalTris.toLocaleString()} (Optimal for WebGL customizer).`,
    })
  }

  // 9. Naming Conventions check
  const genericPrefixes = ['mesh_', 'cube', 'sphere', 'box_', 'object_']
  for (const mesh of meshNodes) {
    if (genericPrefixes.some((p) => mesh.name.toLowerCase().startsWith(p))) {
      nonConformingNames++
    }
  }
  const namingPercentage = meshNodes.length > 0 ? Math.round(((meshNodes.length - nonConformingNames) / meshNodes.length) * 100) : 100
  if (namingPercentage >= 80) {
    checks.push({
      id: 'semantic_naming',
      category: 'naming',
      title: 'Semantic Naming',
      description: 'Descriptive names (e.g. Body_Main, Sleeve_Left) for BlackBullet selector mapping.',
      status: 'pass',
      details: `${namingPercentage}% of meshes have descriptive names.`,
    })
  } else {
    checks.push({
      id: 'semantic_naming',
      category: 'naming',
      title: 'Semantic Naming',
      description: 'Descriptive names for BlackBullet selector mapping.',
      status: 'warn',
      details: `${nonConformingNames} mesh(es) use generic default names (e.g. ${meshNodes.find((m) => genericPrefixes.some((p) => m.name.toLowerCase().startsWith(p)))?.name}).`,
      recommendation: 'Use BlackBullet semantic presets in the inspector to rename meshes.',
    })
  }

  const customization = inspectModelForCustomization(nodes, materials)
  for (const [index, warning] of customization.overlapWarnings.entries()) checks.push({ id: `uv_target_${index}`, category: 'uv', title: 'Surface isolation', description: 'UV intersections within a customization material target.', status: warning.includes('Intentional shared UVs.') ? 'warn' : 'fail', details: warning })

  // Calculate totals
  const passed = checks.filter((c) => c.status === 'pass').length
  const warnings = checks.filter((c) => c.status === 'warn').length
  const failed = checks.filter((c) => c.status === 'fail').length

  const isBlackBulletReady = runtimeContractValid && failed === 0 && customizableZonesFound.length > 0 && meshesWithUV > 0

  return {
    timestamp: new Date().toISOString(),
    modelName,
    isBlackBulletReady,
    totalChecks: checks.length,
    passed,
    warnings,
    failed,
    checks,
    summary: {
      totalMeshes: meshNodes.length,
      meshesWithUV,
      customizableZonesFound,
      missingZones: ['body_front', 'body_back', 'sleeve_left', 'sleeve_right'].filter((z) => !customizableZonesFound.includes(z)),
      namingConformityPercentage: namingPercentage,
    },
  }
}

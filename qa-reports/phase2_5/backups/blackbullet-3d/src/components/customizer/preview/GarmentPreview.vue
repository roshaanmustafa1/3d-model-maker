<template>
  <aside class="flex h-full min-h-0 min-w-0 flex-col gap-3 bg-transparent p-3">
    <div
      class="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle,#ffffff_0%,#e0e0e0_50%)] shadow-lg"
    >
      <div class="absolute left-4 top-4 z-10">
        <Badge class="border bg-background text-foreground backdrop-blur-md">
          Live 3D
        </Badge>
      </div>

      <div v-if="focusRequest > 0 && activeRegionLabel" class="pointer-events-none absolute right-4 top-4 z-10" role="status" aria-live="polite">
        <Badge class="border-orange-500/40 bg-black/70 text-orange-300 backdrop-blur-md">
          Editing {{ activeRegionLabel }}
        </Badge>
      </div>

      <div ref="mountRef" class="absolute inset-0 bg-[radial-gradient(circle,#f0f0f0_0%,#d1d1d1_50%)]" />

      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center bg-background"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <Spinner class="text-primary" />
          <p class="text-sm text-foreground">Loading {{ garment.label.toLowerCase() }}</p>
        </div>
      </div>

      <div
        v-if="loadError"
        class="absolute inset-0 flex items-center justify-center bg-background p-6"
      >
        <div class="max-w-xs text-center">
          <p class="font-medium text-foreground">3D preview unavailable</p>
          <p class="mt-2 text-sm text-muted-foreground">{{ loadError }}</p>
        </div>
      </div>

      <div
        class="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-card p-1 shadow-lg backdrop-blur-md"
      >
        <Button
          v-for="view in PREVIEW_VIEWS"
          :key="view.id"
          :variant="activeView === view.id ? 'default' : 'ghost'"
          size="icon-sm"
          :aria-label="`${view.label} view`"
          @click="setCameraView(view)"
        >
          {{ view.label.slice(0, 1) }}
        </Button>
        <Separator orientation="vertical" class="mx-1 h-5 bg-background/20" />
        <Button
          :variant="isAutoRotating ? 'default' : 'ghost'"
          size="sm"
          aria-label="Toggle automatic rotation"
          :aria-pressed="isAutoRotating"
          :disabled="isLoading || !!loadError"
          @click="toggleAutoRotation"
        >
          Spin
        </Button>
      </div>
      <RegionSelector class="absolute bottom-3 left-3 right-3 z-10" :parts="garment.parts" :active-part-id="activePartId"
        :part-colours="partColours" @select-part="emit('select-part', $event)" />
    </div>
  </aside>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as THREE from "three";
import { createGarmentCameraMotion, getGarmentRegionFocus } from "@/lib/garment-camera-focus.js";
import { createGarmentRegionHighlight } from "@/lib/garment-region-highlight.js";
import RegionSelector from "@/components/customizer/controls/RegionSelector.vue";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { IconRotateClockwise } from "@tabler/icons-vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useGarmentProfile } from "@/composables/useGarmentProfile.js";
import { createGarmentPreviewMaterial, setGarmentColour } from "@/lib/garment-preview-material.js";
import {
  HOODIE_MODEL,
  PREVIEW_SCENE,
  PREVIEW_VIEWS,
} from "@/config/customizer.config.js";

const garment = useGarmentProfile();
const usesNeutralMaterial = garment.colourMode === "mesh" || garment.id === "shirt";
const emit = defineEmits(["select-part"]);

const props = defineProps({
  activePartId: { type: String, default: "" },
  focusRequest: { type: Number, default: 0 },
  canvasElement: { type: Object, default: null },
  partColours: { type: Object, required: true },
  textureVersion: { type: Number, required: true },
});

const mountRef = ref(null);
const isLoading = ref(true);
const loadError = ref("");
const isAutoRotating = ref(false);
const activeView = ref(PREVIEW_VIEWS[0].id);
const activeRegionLabel = computed(() => garment.parts.find(part => part.id === props.activePartId)?.label);
const regionHighlight = createGarmentRegionHighlight();

let animationFrameId;
let camera;
let canvasTexture;
let controls;
let environmentTexture;
let modelRoot;
let renderer;
let resizeObserver;
let scene;
let isDisposed = false;
let modelSphere;
let cameraMotion;
let focusedPartId = null;
let viewportWidth = 0;
let viewportHeight = 0;
let spinResumeTimer;
const regionMeshes = new Map();
const modelMaterials = [];
const texturedPartIds = new Set(garment.faces.map((face) => face.id));
const partIds = new Set(garment.parts.map((part) => part.id));

function initializeScene() {
  const mount = mountRef.value;
  if (!mount) return;

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(
    PREVIEW_SCENE.camera.fieldOfView,
    1,
    PREVIEW_SCENE.camera.near,
    PREVIEW_SCENE.camera.far,
  );
  camera.position.fromArray(PREVIEW_VIEWS[0].position);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, PREVIEW_SCENE.camera.maxPixelRatio),
  );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = usesNeutralMaterial ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = false;
  mount.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  cameraMotion = createGarmentCameraMotion(camera, controls);
  controls.enableDamping = true;
  controls.addEventListener("start", stopCameraTransition);
  controls.minDistance = PREVIEW_SCENE.camera.minDistance;
  controls.maxDistance = PREVIEW_SCENE.camera.maxDistance;
  controls.target.fromArray(PREVIEW_SCENE.cameraTarget);
  controls.update();

  if (!usesNeutralMaterial) {
    addEnvironment();
    addLighting();
  }
  loadHoodie();
  observeResize();
  resizeRenderer();
  renderFrame();
}

function addEnvironment() {
  const generator = new THREE.PMREMGenerator(renderer);
  environmentTexture = generator.fromScene(new RoomEnvironment()).texture;
  scene.environment = environmentTexture;
  generator.dispose();
}

function addLighting() {
  const lighting = PREVIEW_SCENE.lighting;
  const ambient = new THREE.HemisphereLight(
    lighting.skyColour,
    lighting.groundColour,
    lighting.ambientIntensity,
  );
  const key = new THREE.DirectionalLight(
    lighting.keyColour,
    lighting.keyIntensity,
  );
  const fill = new THREE.DirectionalLight(
    lighting.fillColour,
    lighting.fillIntensity,
  );
  key.position.fromArray(lighting.keyPosition);
  fill.position.fromArray(lighting.fillPosition);
  scene.add(ambient, key, fill);
}

function loadHoodie() {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(HOODIE_MODEL.dracoDecoderPath);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load(
    garment.modelUrl,
    ({ scene: hoodie }) => {
      dracoLoader.dispose();
      if (isDisposed) {
        disposeModel(hoodie);
        return;
      }
      const model = garment.modelNodeName
        ? hoodie.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(garment.modelNodeName))
        : hoodie;
      if (!model) {
        disposeModel(hoodie);
        loadError.value = "The selected garment was not found in the model file.";
        isLoading.value = false;
        return;
      }
      setupModel(model);
      if (model !== hoodie) disposeModel(hoodie);
    },
    undefined,
    (error) => {
      dracoLoader.dispose();
      loadError.value =
        error?.message || "The garment file could not be loaded.";
      isLoading.value = false;
    },
  );
}

function setupModel(hoodie) {
  const bounds = new THREE.Box3().setFromObject(hoodie);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = PREVIEW_SCENE.modelHeight / Math.max(size.x, size.y, size.z);

  hoodie.position.sub(center);
  modelRoot = new THREE.Group();
  modelRoot.scale.setScalar(scale);
  modelRoot.position.y = PREVIEW_SCENE.modelPositionY;
  modelRoot.add(hoodie);

  hoodie.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
    object.material = usesNeutralMaterial
      ? createGarmentPreviewMaterial()
      : cloneMaterials(object.material);

    // Walk the full ancestor chain to find which named group this mesh belongs to
    const partId = resolvePartIdFromAncestors(object);
    if (partId) {
      if (!regionMeshes.has(partId)) regionMeshes.set(partId, []);
      regionMeshes.get(partId).push(object);
    }
    registerMaterials(object.material, partId);
  });

  scene.add(modelRoot);
  modelSphere = new THREE.Box3().setFromObject(modelRoot).getBoundingSphere(new THREE.Sphere());
  controls.target.copy(modelSphere.center);
  syncCanvasTexture();
  syncPartColours();
  fitCameraToModel();
  regionHighlight.prepare(Array.from(regionMeshes.values()).flat(), renderer, scene, camera);
  isLoading.value = false;
  if (props.focusRequest > 0) focusSelectedRegion();
  else startAutoRotation();
}

function cloneMaterials(material) {
  return Array.isArray(material)
    ? material.map((item) => item.clone())
    : material.clone();
}

function registerMaterials(material, partId) {
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((item) => {
    if (!usesNeutralMaterial) {
      item.roughness = 0.75;
      item.metalness = 0.0;
      item.envMapIntensity = 0.15;
    }
    modelMaterials.push({ material: item, partId });
  });
}

/**
 * Walks up from a mesh through all node, material, and ancestor names.
 * Returns the first partId whose regex matches any candidate name.
 */
function resolvePartIdFromAncestors(object) {
  if (garment.colourMode === "mesh") {
    return garment.parts.find((part) => part.meshNames?.some(
      (name) => THREE.PropertyBinding.sanitizeNodeName(name) === object.name,
    ))?.id ?? null;
  }
  let current = object;
  while (current) {
    if (partIds.has(current.userData?.partId)) return current.userData.partId;
    if (partIds.has(current.name)) return current.name;
    current = current.parent;
  }
  const namesToTest = [];

  if (object.name) namesToTest.push(object.name);
  if (object.material) {
    const mats = Array.isArray(object.material)
      ? object.material
      : [object.material];
    mats.forEach((m) => {
      if (m.name) namesToTest.push(m.name);
    });
  }

  let node = object.parent;
  while (node) {
    if (node.name) namesToTest.push(node.name);
    node = node.parent;
  }

  if (namesToTest.some((name) => /hood/i.test(name))) {
    return resolveHoodPanelId(object);
  }

  for (const name of namesToTest) {
    for (const [partId, pattern] of Object.entries(
      HOODIE_MODEL.partMaterialPatterns,
    )) {
      if (pattern.test(name)) return partId;
    }
  }

  return null;
}

function resolveHoodPanelId(object) {
  object.geometry.computeBoundingBox();
  const center = object.geometry.boundingBox?.getCenter(new THREE.Vector3());
  return center?.x < 0 ? "hood-left" : "hood-right";
}

function syncCanvasTexture() {
  if (garment.colourMode === "mesh") return;
  if (!props.canvasElement || !modelRoot) return;
  if (!canvasTexture) {
    canvasTexture = new THREE.CanvasTexture(props.canvasElement);
    canvasTexture.encoding = THREE.sRGBEncoding;
    canvasTexture.flipY = false;
  }
  canvasTexture.image = props.canvasElement;
  canvasTexture.needsUpdate = true;

  modelMaterials.forEach(({ material, partId }) => {
    if (texturedPartIds.has(partId)) {
      if (material.map !== canvasTexture) {
        material.map = canvasTexture;
        material.color.set("#FFFFFF");
        material.needsUpdate = true;
      }
    }
  });
}

function syncPartColours() {
  modelMaterials.forEach(({ material, partId }) => {
    if (!partId) return;
    if (texturedPartIds.has(partId) && canvasTexture) return;
    const colour = props.partColours[partId];
    if (colour) {
      setGarmentColour(material, colour);
    }
  });
}

function stopCameraTransition() {
  cameraMotion?.stop();
}

function cameraFitDistance(target = modelSphere.center, padding = 1.02) {
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const radius = modelSphere.radius + target.distanceTo(modelSphere.center);
  return radius / Math.sin(Math.min(verticalFov, horizontalFov) / 2) * padding;
}

function setCameraLimits(distance) {
  controls.minDistance = Math.min(PREVIEW_SCENE.camera.minDistance, distance * 0.4);
  controls.maxDistance = Math.max(PREVIEW_SCENE.camera.maxDistance, distance * 2);
  camera.far = Math.max(PREVIEW_SCENE.camera.far, distance + modelSphere.radius * 4);
  camera.updateProjectionMatrix();
}

function regionFocusDistance() {
  return cameraFitDistance(modelSphere.center, 1.12) * 0.65;
}

function focusSelectedRegion() {
  if (!modelSphere || !cameraMotion || !props.activePartId) return;
  const focus = getGarmentRegionFocus(regionMeshes.get(props.activePartId), modelRoot, modelSphere, props.activePartId);
  if (!focus) return;
  focusedPartId = props.activePartId;
  activeView.value = "";
  isAutoRotating.value = false;
  const distance = regionFocusDistance();
  setCameraLimits(distance);
  regionHighlight.clear();
  const partId = props.activePartId;
  cameraMotion.moveTo(focus.target, focus.direction, distance, 1500, () => {
    regionHighlight.show(regionMeshes.get(partId));
  });
  scheduleSpinResume();
}

function clearSpinResumeTimer() {
  window.clearTimeout(spinResumeTimer);
  spinResumeTimer = undefined;
}

function scheduleSpinResume() {
  clearSpinResumeTimer();
  spinResumeTimer = window.setTimeout(() => {
    spinResumeTimer = undefined;
    if (!isDisposed) startAutoRotation();
  }, 10000);
}

function startAutoRotation() {
  if (!modelSphere || !cameraMotion || isDisposed) return;
  clearSpinResumeTimer();
  regionHighlight.clear();
  focusedPartId = null;
  activeView.value = "";
  const direction = camera.position.clone().sub(controls.target).normalize();
  const distance = cameraFitDistance();
  setCameraLimits(distance);
  cameraMotion.moveTo(modelSphere.center, direction, distance);
  isAutoRotating.value = true;
}

function toggleAutoRotation() {
  if (!modelSphere || !cameraMotion) return;
  clearSpinResumeTimer();
  if (isAutoRotating.value) isAutoRotating.value = false;
  else startAutoRotation();
}

function setCameraView(view) {
  if (!camera || !controls || !modelSphere) return;
  regionHighlight.clear();
  activeView.value = view.id;
  focusedPartId = null;
  isAutoRotating.value = false;
  const direction = new THREE.Vector3().fromArray(view.position)
    .sub(new THREE.Vector3().fromArray(PREVIEW_SCENE.cameraTarget)).normalize();
  direction.applyQuaternion(modelRoot.getWorldQuaternion(new THREE.Quaternion()));
  const distance = cameraFitDistance();
  setCameraLimits(distance);
  cameraMotion.moveTo(modelSphere.center, direction, distance);
}

function fitCameraToModel(animate = false) {
  if (!modelSphere || !camera || !controls) return;
  const focus = focusedPartId && getGarmentRegionFocus(regionMeshes.get(focusedPartId), modelRoot, modelSphere, focusedPartId);
  const target = focus ? focus.target : modelSphere.center;
  const distance = focus ? regionFocusDistance() : cameraFitDistance(target);
  const direction = camera.position.clone().sub(controls.target).normalize();
  setCameraLimits(distance);
  if (animate) {
    cameraMotion.moveTo(target, direction, distance, focus ? 1500 : 1000, focus ? () => {
      regionHighlight.show(regionMeshes.get(focusedPartId));
    } : undefined);
    return;
  }
  cameraMotion?.stop();
  controls.target.copy(target);
  camera.position.copy(controls.target).addScaledVector(direction, distance);
  controls.update();
}

function renderFrame(now = performance.now()) {
  animationFrameId = requestAnimationFrame(renderFrame);
  if (isAutoRotating.value && modelRoot)
    modelRoot.rotation.y += PREVIEW_SCENE.rotationSpeed;
  if (!cameraMotion?.update(now)) controls?.update();
  regionHighlight.update(now);
  renderer?.render(scene, camera);
}

function resizeRenderer() {
  const bounds = mountRef.value?.getBoundingClientRect();
  if (!bounds?.width || !bounds?.height || !renderer || !camera) return;
  const width = Math.round(bounds.width);
  const height = Math.round(bounds.height);
  if (width === viewportWidth && height === viewportHeight) return;
  viewportWidth = width;
  viewportHeight = height;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, PREVIEW_SCENE.camera.maxPixelRatio));
  renderer.setSize(width, height, false);
  fitCameraToModel(true);
}

function observeResize() {
  resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(mountRef.value);
}

function disposeModel(root) {
  root?.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose();
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => material?.dispose());
  });
}

function disposeScene() {
  regionHighlight.dispose();
  disposeModel(scene);
  canvasTexture?.dispose();
  environmentTexture?.dispose();
  controls?.removeEventListener("start", stopCameraTransition);
  controls?.dispose();
  renderer?.dispose();
  renderer?.domElement.remove();
  resizeObserver?.disconnect();
  modelMaterials.length = 0;
  regionMeshes.clear();
}

watch(() => props.partColours, syncPartColours, { deep: true });
watch(() => props.canvasElement, syncCanvasTexture);
watch(() => props.textureVersion, syncCanvasTexture);
watch([() => props.activePartId, () => props.focusRequest], focusSelectedRegion);

onMounted(initializeScene);

onBeforeUnmount(() => {
  isDisposed = true;
  clearSpinResumeTimer();
  cameraMotion?.stop();
  cancelAnimationFrame(animationFrameId);
  disposeScene();
});
</script>

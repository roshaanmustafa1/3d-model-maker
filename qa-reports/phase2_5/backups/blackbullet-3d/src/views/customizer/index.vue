<template>
  <div class="flex h-full min-h-0 flex-col bg-background font-sans">
    <header
      class="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3 md:px-6"
    >
      <div class="flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          aria-label="Go back"
          @click="handleGoBack"
        >
          <IconArrowLeft />
        </Button>
        <div>
          <h1 class="font-neue text-2xl text-foreground">{{ garment.label }} Customizer</h1>
          <p class="text-sm text-muted-foreground">
            {{ garment.colourMode === 'mesh' ? 'Choose your shirt color and preview in 3D.' : 'Upload, arrange, and preview in 3D.' }}
          </p>
        </div>
      </div>
      <ThemeToggler class="ms-auto" />
      <Button v-if="garment.colourMode !== 'mesh'" variant="outline" @click="exportDesign">Export texture</Button>
      <Button @click="exportProject">
        <IconDownload data-icon="inline-start" />
        Save design
      </Button>
    </header>

    <div class="workspace min-h-0 flex-1">
      <section class="tools min-h-0 overflow-hidden border-r border-border">
        <div class="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
          <Button class="text-xs" size="sm" variant="outline" :disabled="!canUndo" @click="undo">Undo</Button>
          <Button class="text-xs" size="sm" variant="outline" :disabled="!canRedo" @click="redo">Redo</Button>
          <Button class="ml-auto md:hidden" size="sm" variant="ghost" :aria-expanded="toolsOpen" @click="toolsOpen = !toolsOpen">{{ toolsOpen ? 'Hide tools' : 'Show tools' }}</Button>
        </div>
        <div class="min-h-0 flex-1" :class="toolsOpen ? '' : 'hidden md:block'">
          <CustomizerControls :active-part-id="activePartId" :layers="layers" :part-colours="partColours" :selected-layer="selectedLayer"
            @add-image="addImageFromFile" @add-text="addText" @delete-selected="removeSelectedLayer"
            @select-layer="selectLayer" @select-part="selectRegion" @set-part-colour="setPartColour" @update-layer="updateLayer"
            @transform-start="beginLayerTransform" @transform-end="endLayerTransform" @layer-action="handleLayerAction" />
        </div>
      </section>
      <section class="viewer min-h-0 min-w-0 bg-muted/40" aria-label="Interactive 3D garment viewer">
        <GarmentPreview :canvas-element="canvasElement" :part-colours="partColours" :texture-version="textureVersion"
          :active-part-id="activePartId" :focus-request="regionFocusRequest" @select-part="selectRegion" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { provide, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue-sonner";
import { IconArrowLeft, IconDownload } from "@tabler/icons-vue";
import { Button } from "@/components/ui/button";
import CustomizerControls from "@/components/customizer/controls/CustomizerControls.vue";
import GarmentPreview from "@/components/customizer/preview/GarmentPreview.vue";
import ThemeToggler from "@/components/common/ThemeToggler.vue";
import { useDesignTexture } from "@/composables/useDesignTexture.js";
import { useCustomizerEditor } from "@/composables/useCustomizerEditor.js";
import { GARMENT_PROFILE_KEY, HOODIE_GARMENT, SHIRT_GARMENT } from "@/config/garment-profiles.js";

const route = useRoute();
const router = useRouter();
const garment = route.query.garment === "shirt" ? SHIRT_GARMENT : HOODIE_GARMENT;
provide(GARMENT_PROFILE_KEY, garment);
const handleGoBack = () => router.push("/shop");
const toolsOpen = ref(true);
const regionFocusRequest = ref(0);
const {
  activePartId, canRedo, canUndo, layers, partColours, selectedLayer,
  addImage, addText, beginLayerTransform, duplicateSelectedLayer, endLayerTransform,
  removeSelectedLayer, reorderSelectedLayer, redo, selectLayer, setActivePart, setPartColour, updateLayer, undo,
} = useCustomizerEditor(garment);
const { canvasElement, textureVersion, exportDesign } = useDesignTexture(garment, layers, partColours);

function selectRegion(partId) {
  setActivePart(partId);
  regionFocusRequest.value += 1;
}

function handleLayerAction(action) {
  const layer = selectedLayer.value;
  if (!layer) return;
  if (action === "duplicate") return duplicateSelectedLayer();
  if (action === "raise" || action === "lower") return reorderSelectedLayer(action === "raise" ? 1 : -1);
  const face = garment.faces.find(item => item.id === layer.partId);
  if (action === "center" && face) updateLayer(layer.id, {
    x: face.bounds.x + (face.bounds.width - layer.width) / 2,
    y: face.bounds.y + (face.bounds.height - layer.height) / 2,
  });
}
function exportProject() {
  const data = { version: 1, garment: garment.id, partColours: partColours.value, layers: layers.value, activePartId: activePartId.value };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = 'black-bullet-' + garment.id + '-project.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function addImageFromFile(file) {
  readImageFile(file).then(addImage).catch(() => {
    toast.error("We could not read that image. Please choose another file.");
  });
}
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => resolve({ name: file.name, source: reader.result, width: image.naturalWidth, height: image.naturalHeight });
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
</script>

<style scoped>
.workspace { display: grid; grid-template-columns: clamp(320px, 29vw, 400px) minmax(0, 1fr); }
.tools { display: flex; flex-direction: column; }
@media (max-width: 767px) {
  .workspace { display: flex; flex-direction: column; }
  .viewer { order: -1; flex: 1; min-height: 220px; }
  .tools { flex: 0 1 auto; max-height: 46dvh; border-right: 0; border-top: 1px solid var(--border); }
}
</style>

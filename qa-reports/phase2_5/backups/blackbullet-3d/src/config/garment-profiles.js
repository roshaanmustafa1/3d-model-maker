import hoodieModelUrl from "@/assets/modals/subdivision.glb?url";
import shirtModelUrl from "@/assets/modals/raglan_shirt.glb?url";
import manifest from "@/assets/modals/shirt.manifest.json";

export const GARMENT_PROFILE_KEY = Symbol("garment-profile");

export const HOODIE_GARMENT = {
  id: "subdivision",
  label: "Shirt",
  modelUrl: hoodieModelUrl,
  colourMode: "mesh",
  parts: [{
    id: "body",
    label: "Whole shirt",
    defaultColour: "#E5E7EB",
    designable: false,
    meshNames: ["athletic shirt 3d model"],
  }],
  faces: [],
  uvMapSvg: "",
  initialPartId: "body",
};

const labels = {
  shirt_front: "Shirt front",
  shirt_back: "Shirt back",
  shirt_base: "Shirt base / yoke",
  shoulder_left: "Left shoulder",
  shoulder_right: "Right shoulder",
  shoulder_patch_left: "Left shoulder patch",
  shoulder_patch_right: "Right shoulder patch",
  collar: "Collar",
  neck_patch_front: "Front neck patch",
  neck_patch_back: "Back neck patch",
  side_patch_left: "Left hip patch",
  side_patch_right: "Right hip patch",
};

function shirtFace(id, x) {
  const bounds = { x, y: 32, width: 156, height: 244 };
  // Project exactly the same cut line and planar coordinates used by Blender.
  const points = manifest.printOutlines[id].map(([u, v]) =>
    `${x + u * bounds.width},${bounds.y + v * bounds.height}`,
  );
  return {
    id,
    faceId: id,
    label: labels[id],
    bounds,
    artworkArea: { x: x + 24, y: 84, width: 108, height: 146 },
    path: `M ${points.join(" L ")} Z`,
    textureRegions: [manifest.textureRegions[id]],
  };
}

export const SHIRT_GARMENT = {
  id: "shirt",
  label: "V-neck shirt",
  modelUrl: shirtModelUrl,
  // Colours are supplied by the app, never embedded in the GLB.
  parts: Object.keys(labels).map((id) => ({
    id,
    label: labels[id],
    defaultColour: "#E5E7EB",
    designable: id === "shirt_front" || id === "shirt_back",
  })),
  faces: [shirtFace("shirt_front", 20), shirtFace("shirt_back", 204)],
  uvMapSvg: "",
  initialPartId: "shirt_front",
};

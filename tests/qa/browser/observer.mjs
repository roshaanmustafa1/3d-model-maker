export function observeReactScenes() {
  const roots = new Map(), renderers = new Map()
  window.__qaRoots = roots
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true, renderers,
    inject(renderer) { const id = renderers.size + 1; renderers.set(id, renderer); return id },
    onCommitFiberRoot(id, root) { roots.set(id, root) },
    onCommitFiberUnmount() {}, onPostCommitFiberRoot() {},
  }
  window.__qaSceneObjects = () => {
    const seen = new Set(), objects = new Set()
    function visit(fiber) {
      if (!fiber || seen.has(fiber)) return
      seen.add(fiber)
      const object = fiber.stateNode?.object || fiber.stateNode
      if (object?.isObject3D) objects.add(object)
      visit(fiber.child); visit(fiber.sibling)
    }
    roots.forEach((root) => visit(root.current))
    return [...objects]
  }
  window.__qaSnapshot = () => {
    const objects = window.__qaSceneObjects()
    const state = objects.find((object) => object.__r3f?.root)?.__r3f.root.getState()
    const scene = state?.scene || objects.find((object) => object.isScene)
    const meshes = []
    scene?.traverse((object) => {
      if (!object.isMesh || !object.name) return
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      meshes.push({ name: object.name, uuid: object.uuid, position: object.position.toArray(), matrixWorld: object.matrixWorld.toArray(), vertices: object.geometry.attributes.position?.count, triangles: (object.geometry.index?.count ?? object.geometry.attributes.position?.count ?? 0) / 3, uv: object.geometry.attributes.uv && Array.from(object.geometry.attributes.uv.array), materials: materials.map((m) => ({ uuid: m.uuid, name: m.name, type: m.type, color: m.color?.getHexString(), linearColor: m.color?.toArray(), roughness: m.roughness, metalness: m.metalness, opacity: m.opacity, side: m.side, wireframe: m.wireframe, map: m.map && { uuid: m.map.uuid, width: m.map.image?.width, height: m.map.image?.height, colorSpace: m.map.colorSpace }, normalMap: m.normalMap && { colorSpace: m.normalMap.colorSpace, width: m.normalMap.image?.width } })) })
    })
    return { meshes, renderer: state && { calls: state.gl.info.render.calls, triangles: state.gl.info.render.triangles, memory: { ...state.gl.info.memory } }, camera: state?.camera.position.toArray() }
  }
}

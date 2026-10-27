import * as THREE from 'three'
import Konva from 'konva'
import type { DesignZone, TextureResolution } from '@/types/customization'
import { createArtworkNode } from './artwork-renderer'

const imageElementCache = new Map<string, HTMLImageElement>()
let cacheGeneration = 0
export function clearArtworkImageCache(): void { cacheGeneration++; imageElementCache.clear() }
export function getCachedImage(src: string): Promise<HTMLImageElement> {
  const cached = imageElementCache.get(src)
  if (cached?.complete && cached.naturalWidth > 0) return Promise.resolve(cached)
  return new Promise((resolve, reject) => {
    const generation = cacheGeneration
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (generation === cacheGeneration) imageElementCache.set(src, image)
      if (imageElementCache.size > 64) imageElementCache.delete(imageElementCache.keys().next().value!)
      resolve(image)
    }
    image.onerror = () => reject(new Error('Failed to decode artwork image. Re-upload the missing or invalid asset.'))
    image.src = src
  })
}

export class TextureComposer {
  private canvas: HTMLCanvasElement | null = null
  private texture: THREE.CanvasTexture | null = null
  constructor(private resolution: TextureResolution = 1024) {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas')
      if (typeof this.canvas.getContext?.('2d')?.clearRect !== 'function') { this.canvas = null; return }
      this.canvas.width = this.canvas.height = resolution
      this.texture = new THREE.CanvasTexture(this.canvas)
      this.texture.colorSpace = THREE.SRGBColorSpace
      this.texture.flipY = false
    }
  }
  setResolution(resolution: TextureResolution) {
    this.resolution = resolution
    if (this.canvas) this.canvas.width = this.canvas.height = resolution
  }
  getCanvasTexture() { return this.texture }
  getCanvas() { return this.canvas }

  async compositeTexture(baseColor: string, zones: DesignZone[], originalTextureImage?: CanvasImageSource | null) {
    if (!this.canvas) return null
    const ctx = this.canvas.getContext('2d')!
    const res = this.resolution
    ctx.clearRect(0, 0, res, res)
    if (originalTextureImage) {
      ctx.drawImage(originalTextureImage, 0, 0, res, res)
      const pixels = ctx.getImageData(0, 0, res, res)
      const factor = new THREE.Color(baseColor)
      const tables = [factor.r, factor.g, factor.b].map(channel => Array.from({ length: 256 }, (_, value) => {
        const srgb = value / 255
        const linear = (srgb <= .04045 ? srgb / 12.92 : ((srgb + .055) / 1.055) ** 2.4) * channel
        return Math.round(255 * (linear <= .0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - .055))
      }))
      for (let i = 0; i < pixels.data.length; i += 4) for (let channel = 0; channel < 3; channel++) pixels.data[i + channel] = tables[channel][pixels.data[i + channel]]
      ctx.putImageData(pixels, 0, 0)
    } else { ctx.fillStyle = baseColor; ctx.fillRect(0, 0, res, res) }
    for (const zone of zones) {
      if (!zone.enabled || !zone.layers.length) continue
      const nodes: Konva.Node[] = []
      for (const artwork of [...zone.layers].sort((a, b) => a.zIndex - b.zIndex)) {
        if (!artwork.visible) continue
        nodes.push(createArtworkNode(artwork, artwork.type === 'image' ? await getCachedImage(artwork.src) : undefined))
      }
      const layer = new Konva.Layer()
      try {
        nodes.forEach(node => layer.add(node as Konva.Shape))
        const b = zone.uvBounds
        const x = b.minU * res, y = (1 - b.maxV) * res
        const width = (b.maxU - b.minU) * res, height = (b.maxV - b.minV) * res
        const overlay = layer.toCanvas({ x: 0, y: 0, width: zone.canvasWidth, height: zone.canvasHeight, pixelRatio: Math.max(width / zone.canvasWidth, height / zone.canvasHeight) })
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip()
        ctx.drawImage(overlay, x, y, width, height); ctx.restore()
      } finally { layer.destroy() }
    }
    if (this.texture) this.texture.needsUpdate = true
    return this.texture
  }

  async bakeToBlob(): Promise<{ blob: Blob; dataUrl: string }> {
    if (!this.canvas) {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      return { blob: new Blob([Buffer.from(dataUrl.split(',')[1], 'base64')], { type: 'image/png' }), dataUrl }
    }
    const dataUrl = this.canvas.toDataURL('image/png')
    const blob = await new Promise<Blob>((resolve, reject) => this.canvas!.toBlob(blob => blob ? resolve(blob) : reject(new Error('Failed to encode texture.')), 'image/png'))
    return { blob, dataUrl }
  }
  dispose() { this.texture?.dispose(); this.texture = null; this.canvas = null }
}


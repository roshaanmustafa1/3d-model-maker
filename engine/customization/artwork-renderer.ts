import Konva from 'konva'
import type { ArtworkLayer } from '@/types/customization'

export function artworkNodeConfig(layer: ArtworkLayer, image?: HTMLImageElement) {
  const attrs: Record<string, unknown> = {
    id: layer.id, x: layer.x, y: layer.y, width: layer.width, height: layer.height,
    rotation: layer.rotation, scaleX: layer.scaleX, scaleY: layer.scaleY,
    opacity: layer.opacity, visible: layer.visible,
  }
  let className = 'Rect'
  if (layer.type === 'image') { className = 'Image'; attrs.image = image }
  if (layer.type === 'text') {
    className = 'Text'
    Object.assign(attrs, { text: layer.text, fontFamily: layer.fontFamily, fontSize: layer.fontSize, fontStyle: `${layer.fontStyle} ${layer.fontWeight}`, fill: layer.fill, align: layer.align, letterSpacing: layer.letterSpacing, lineHeight: layer.lineHeight, stroke: layer.stroke, strokeWidth: layer.strokeWidth || 0 })
    delete attrs.height
  }
  if (layer.type === 'shape') {
    Object.assign(attrs, { fill: layer.fill, stroke: layer.stroke, strokeWidth: layer.strokeWidth, cornerRadius: layer.cornerRadius || 0 })
    if (layer.shapeType === 'circle' || layer.shapeType === 'star') {
      className = layer.shapeType === 'circle' ? 'Circle' : 'Star'
      Object.assign(attrs, { radius: Math.min(layer.width, layer.height) / 2, outerRadius: Math.min(layer.width, layer.height) / 2, innerRadius: Math.min(layer.width, layer.height) / 4, numPoints: 5, offsetX: -layer.width / 2, offsetY: -layer.height / 2 })
    }
    if (layer.shapeType === 'triangle') { className = 'Line'; Object.assign(attrs, { points: [layer.width / 2, 0, layer.width, layer.height, 0, layer.height], closed: true }) }
  }
  return { className, attrs }
}

export function createArtworkNode(layer: ArtworkLayer, image?: HTMLImageElement): Konva.Node {
  const config = artworkNodeConfig(layer, image)
  return Konva.Node.create({ ...config, attrs: { ...config.attrs, image } })
}

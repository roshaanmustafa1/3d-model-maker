import { DOMParser, XMLSerializer } from '@xmldom/xmldom'

const SVG = 'http://www.w3.org/2000/svg'
const elements = new Set('svg g path rect circle ellipse polygon polyline line text tspan defs linearGradient radialGradient stop clipPath mask title desc'.split(' '))
const attributes = new Set('id x y x1 y1 x2 y2 cx cy r rx ry width height viewBox preserveAspectRatio d points fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray opacity transform font-family font-size font-weight font-style text-anchor dominant-baseline dx dy offset stop-color stop-opacity gradientUnits gradientTransform clip-path clip-rule mask href'.split(' '))

export function sanitizeSvgContent(rawSvg: string): string {
  if (rawSvg.length > 2 * 1024 * 1024 || /<!(?:DOCTYPE|ENTITY)\b/i.test(rawSvg)) throw new Error('Invalid SVG: entities and document types are not allowed.')
  const parser = new DOMParser({ onError: () => { throw new Error('Invalid SVG XML structure.') } })
  const input = parser.parseFromString(rawSvg, 'image/svg+xml')
  const root = input.documentElement
  if (!root || root.localName !== 'svg' || (root.namespaceURI && root.namespaceURI !== SVG)) throw new Error('Invalid SVG root element.')
  const output = parser.parseFromString('<svg xmlns="' + SVG + '"/>', 'image/svg+xml')
  let count = 0
  function copy(source: NonNullable<typeof root>, parent: NonNullable<typeof root>) {
    if (++count > 10000) throw new Error('Invalid SVG: too many elements.')
    for (let i = 0; i < source.attributes.length; i++) {
      const attr = source.attributes.item(i)!
      if (!attributes.has(attr.name)) continue
      let normalized = attr.value
      for (let pass = 0; pass < 3; pass++) { try { normalized = decodeURIComponent(normalized) } catch { break } }
      normalized = normalized.replace(/[\s\u0000-\u001f\u007f]+/g, '')
      if (attr.name === 'href' && !/^#[a-zA-Z_][\w:.-]*$/.test(normalized)) continue
      if (/javascript:|data:|https?:|file:|\/\//i.test(normalized)) continue
      if (/url\(/i.test(normalized) && !/^url\(#[a-zA-Z_][\w:.-]*\)$/.test(normalized)) continue
      parent.setAttribute(attr.name, attr.value)
    }
    for (const child of Array.from(source.childNodes)) {
      if (child.nodeType === 3) parent.appendChild(output.createTextNode(child.nodeValue || ''))
      if (child.nodeType !== 1) continue
      const element = child as NonNullable<typeof root>
      if (!element.localName || !elements.has(element.localName) || (element.namespaceURI && element.namespaceURI !== SVG)) continue
      const target = output.createElementNS(SVG, element.localName)
      parent.appendChild(target)
      copy(element, target)
    }
  }
  copy(root, output.documentElement!)
  return new XMLSerializer().serializeToString(output)
}

export function svgToSafeDataUrl(svg: string): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sanitizeSvgContent(svg)).replace(/'/g, '%27')
}

import { svgToSafeDataUrl } from './svg-sanitizer'
import { getCachedImage } from './texture-composer'

const MAX_BYTES = 12 * 1024 * 1024
export function validateArtworkFile(file: File): Promise<{ src: string; width: number; height: number; isSvg: boolean }> {
  if (!file.size || file.size > MAX_BYTES) return Promise.reject(new Error('Invalid artwork size. Choose a file between 1 byte and 12 MB.'))
  return file.arrayBuffer().then(buffer => {
    const bytes = new Uint8Array(buffer), view = new DataView(buffer)
    const png = bytes.length >= 24 && view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a
    const jpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    const webp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    const mime = png ? 'image/png' : jpeg ? 'image/jpeg' : webp ? 'image/webp' : isSvg ? 'image/svg+xml' : ''
    if (!mime || (file.type && mime !== file.type)) throw new Error('Invalid image signature or MIME type. Upload a valid PNG, JPEG, WebP or SVG.')
    if (png && (view.getUint32(16) > 8192 || view.getUint32(20) > 8192)) throw new Error('Image dimensions exceed 8192 pixels.')
    if (isSvg) return { src: svgToSafeDataUrl(new TextDecoder().decode(buffer)), isSvg }
    return new Promise<{ src: string; isSvg: boolean }>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ src: String(reader.result), isSvg: false })
      reader.onerror = () => reject(new Error('Failed to read uploaded image.'))
      reader.onabort = () => reject(new Error('Image upload was cancelled.'))
      reader.readAsDataURL(file)
    })
  }).then(result => getCachedImage(result.src).then(image => {
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 8192 || image.naturalHeight > 8192 || image.naturalWidth * image.naturalHeight > 32000000) throw new Error('Invalid image dimensions. Maximum size is 8192 pixels and 32 megapixels.')
    return { ...result, width: image.naturalWidth, height: image.naturalHeight }
  }))
}

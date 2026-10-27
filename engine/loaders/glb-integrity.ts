export function inspectGlbContainer(buffer: ArrayBuffer): Record<string, unknown> {
  if (buffer.byteLength < 20) throw new Error('GLB is truncated.')
  const view = new DataView(buffer)
  if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) throw new Error('Expected a GLB version 2 file.')
  if (view.getUint32(8, true) !== buffer.byteLength) throw new Error('GLB declared length does not match the file.')
  let offset = 12, document: Record<string, unknown> | undefined
  while (offset < buffer.byteLength) {
    if (offset + 8 > buffer.byteLength) throw new Error('Truncated GLB chunk header.')
    const length = view.getUint32(offset, true), type = view.getUint32(offset + 4, true)
    if (length % 4 || offset + 8 + length > buffer.byteLength) throw new Error('Invalid GLB chunk length.')
    if (offset === 12 && type !== 0x4e4f534a) throw new Error('GLB must begin with a JSON chunk.')
    if (type === 0x4e4f534a) {
      if (document) throw new Error('GLB contains multiple JSON chunks.')
      document = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, offset + 8, length)))
    }
    offset += 8 + length
  }
  if (!document || (document.asset as { version?: string })?.version !== '2.0') throw new Error('Missing glTF 2.0 asset metadata.')
  for (const resource of [...(document.buffers as { uri?: string }[] || []), ...(document.images as { uri?: string }[] || [])]) {
    if (resource.uri && !resource.uri.startsWith('data:')) throw new Error('Handoff GLB must embed all buffers and textures; external resources are unsupported.')
  }
  return document
}

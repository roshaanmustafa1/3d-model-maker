'use client'

import { useRef, useState } from 'react'
import { inspectGeneratedGlb } from '@/integrations/local-ai/generated-glb-handoff'
import { useEditorStore } from '@/stores/editor-store'
import { useCustomizerStore } from '@/stores/customizer-store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Handoff = Awaited<ReturnType<typeof inspectGeneratedGlb>>

export function LocalGlbHandoff() {
  const input = useRef<HTMLInputElement>(null)
  const source = useRef<File | null>(null)
  const [handoff, setHandoff] = useState<Handoff | null>(null)
  const [busy, setBusy] = useState(false)
  const open = (customize: boolean) => {
    if (!handoff || (customize && (!handoff.report.isCustomizerCompatible || handoff.report.overlappingUvDetected))) return
    const editor = useEditorStore.getState()
    editor.loadImportedScene(handoff.imported)
    if (customize) useCustomizerStore.getState().loadCustomModel(handoff.imported.modelName, 'other', Object.values(handoff.imported.nodes).filter(node => node.type === 'mesh').map(node => ({ id: node.id, name: node.name, customizableZone: node.customizableZone })))
    editor.setActiveWorkspace(customize ? 'customizer' : 'editor')
  }
  return <section className="space-y-2 rounded border border-white/10 bg-[#161a22] p-3 text-xs">
    <p className="font-semibold text-zinc-200">Local AI GLB handoff</p>
    <p className="text-zinc-400">Import the GLB exported by your MacBook service. No provider key required.</p>
    <input ref={input} aria-label="Generated GLB file" type="file" accept=".glb" className="hidden" disabled={busy} onChange={event => {
      const file = event.target.files?.[0]
      if (!file) return
      source.current = file
      setBusy(true); setHandoff(null)
      inspectGeneratedGlb(file).then(setHandoff).catch(error => toast.error(error.message)).finally(() => { setBusy(false); if (input.current) input.current.value = '' })
    }} />
    <Button size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Inspecting GLB…' : 'Inspect generated GLB'}</Button>
    {handoff && <>
      <p>{handoff.report.meshCount} meshes · {handoff.report.triangleCount} triangles · UVs {handoff.report.hasUVs ? 'present' : 'missing'}</p>
      <p className="text-amber-300">{[...handoff.report.validationIssues, ...handoff.report.recommendations].join(' ')}</p>
      {!handoff.report.hasUVs && <Button size="sm" disabled={busy} onClick={() => {
        if (!source.current) return
        setBusy(true)
        fetch('/api/ai/blender/prepare', { method: 'POST', headers: { 'Content-Type': 'model/gltf-binary' }, body: source.current }).then(response => {
          if (!response.ok) return response.json().then(body => { throw new Error(body.error) })
          return response.blob()
        }).then(blob => inspectGeneratedGlb(new File([blob], source.current!.name, { type: 'model/gltf-binary' }))).then(setHandoff).catch(error => toast.error(error.message)).finally(() => setBusy(false))
      }}>Blender: unwrap missing UVs</Button>}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => open(false)}>Open in Modeling Studio</Button>
        <Button size="sm" disabled={!handoff.report.isCustomizerCompatible || handoff.report.overlappingUvDetected} onClick={() => open(true)}>Open in Product Customizer</Button>
      </div>
    </>}
  </section>
}

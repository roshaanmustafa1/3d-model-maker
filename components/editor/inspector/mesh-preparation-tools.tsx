'use client'

import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function MeshPreparationTools() {
  const count = useEditorStore(state => state.selectedFaceIds.length)
  const run = (mode: 'components' | 'materials') => {
    try { const ids = useEditorStore.getState().separateSelectedMesh(mode); toast.info(ids.length > 1 ? `Created ${ids.length} parts. Rename parts and define their zones.` : 'No additional parts found.') }
    catch (error) { toast.error(error instanceof Error ? error.message : String(error)) }
  }
  return <section className="space-y-2 rounded border border-white/10 bg-[#161a22] p-3 text-[11px]">
    <p className="font-semibold text-zinc-200">Prepare mesh parts</p>
    <p className="text-zinc-400">In Edit Mode, select faces for the front, back, sleeve or collar. Separate, then rename each part and assign its material.</p>
    <div className="flex gap-1">
      {(['connected', 'grow', 'shrink'] as const).map(mode => <Button key={mode} size="sm" variant="outline" disabled={!count} onClick={() => useEditorStore.getState().selectFaceRegion(mode)}>{mode === 'connected' ? 'Connected' : mode === 'grow' ? 'Grow' : 'Shrink'}</Button>)}
    </div>
    <div className="flex gap-1">
      <Button size="sm" variant="outline" onClick={() => run('components')}>Separate loose parts</Button>
      <Button size="sm" variant="outline" onClick={() => run('materials')}>Split by material</Button>
    </div>
  </section>
}

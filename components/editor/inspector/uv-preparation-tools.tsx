'use client'

import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UVPreparationTools() {
  const edges = useEditorStore(state => state.selectedEdgeIds.length)
  const run = (action: () => void) => {
    try { action() } catch (error) { toast.error(error instanceof Error ? error.message : String(error)) }
  }
  return <section className="space-y-2 rounded border border-white/10 p-3 text-[11px]">
    <p className="text-zinc-300">Select edges in Edit Mode to mark seams. Seams define chart boundaries; use Blender for a seam-based unwrap.</p>
    <div className="flex gap-1">
      <Button size="sm" variant="outline" disabled={!edges} onClick={() => run(() => useEditorStore.getState().markSelectedUVSeams(true))}>Mark seams</Button>
      <Button size="sm" variant="outline" disabled={!edges} onClick={() => run(() => useEditorStore.getState().markSelectedUVSeams(false))}>Clear seams</Button>
    </div>
    <p className="text-amber-300">Packing changes UV placement. Existing texture images are preserved, but require rebaking in Blender to retain their placement. Packing cannot fix overlaps within a chart.</p>
    <Button size="sm" variant="outline" onClick={() => run(() => useEditorStore.getState().packUVIslands())}>Pack UV islands</Button>
  </section>
}

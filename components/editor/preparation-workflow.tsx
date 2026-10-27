const steps = ['Import Model', 'Inspect', 'Repair Mesh', 'Separate Parts', 'Prepare UVs', 'Assign Materials', 'Define Zones', 'Customize', 'Validate', 'Export']

export function PreparationWorkflow() {
  return <nav aria-label="Model preparation workflow" className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/5 bg-[#101319] px-3 py-1 text-[10px] text-zinc-400">
    <ol className="flex items-center gap-2 whitespace-nowrap">
      {steps.map((step, index) => <li key={step} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true" className="text-zinc-600">→</span>}<span>{index + 1}. {step}</span></li>)}
    </ol>
  </nav>
}

'use client'

import React, { useMemo } from 'react'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import { validateBlackBulletModel } from '@/engine/validation/blackbullet-validator'
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  X,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import saveAs from 'file-saver'
import { toast } from 'sonner'

export function ValidationModal() {
  const activeModal = useEditorStore((state) => state.activeModal)
  const openModal = useEditorStore((state) => state.openModal)
  const nodes = useEditorStore((state) => state.nodes)
  const rootNodeIds = useEditorStore((state) => state.rootNodeIds)
  const materials = useEditorStore((state) => state.materials)
  const currentProject = useProjectStore((state) => state.currentProject)

  const report = useMemo(() => {
    if (activeModal !== 'validator') return null
    return validateBlackBulletModel(nodes, rootNodeIds, materials, currentProject.name)
  }, [activeModal, nodes, rootNodeIds, materials, currentProject.name])

  if (activeModal !== 'validator' || !report) return null

  const handleExportJsonReport = () => {
    const jsonStr = JSON.stringify(report, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    saveAs(blob, `${currentProject.name}_BlackBullet_Validation_Report.json`)
    toast.success('Downloaded validation report JSON')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#12151b] p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-zinc-100">
              BlackBullet Compatibility Validator
            </h2>
          </div>
          <button onClick={() => openModal(null)} className="text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Readiness Banner */}
        <div
          className={`flex items-center justify-between rounded-xl border p-4 ${
            report.isBlackBulletReady
              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
              : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Compatibility Status:
              </span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                  report.isBlackBulletReady
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-amber-500 text-zinc-950'
                }`}
              >
                {report.isBlackBulletReady ? 'BlackBullet Ready' : 'Action Required'}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-300">
              {report.isBlackBulletReady
                ? 'Model complies with BlackBullet hierarchy, UV mapping, and PBR standards.'
                : 'Model has missing customizable zones or incomplete UV coordinates.'}
            </p>
          </div>

          <div className="text-right text-xs">
            <div className="font-mono text-zinc-400">
              <span className="text-emerald-400 font-bold">{report.passed}</span> Passed /{' '}
              <span className="text-amber-400 font-bold">{report.warnings}</span> Warn /{' '}
              <span className="text-red-400 font-bold">{report.failed}</span> Fail
            </div>
          </div>
        </div>

        {/* Checks List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {report.checks.map((check) => {
            const isPass = check.status === 'pass'
            const isWarn = check.status === 'warn'

            return (
              <div
                key={check.id}
                className="rounded-lg border border-white/5 bg-[#161a22] p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPass && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                    {isWarn && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
                    {!isPass && !isWarn && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                    <span className="font-semibold text-zinc-200">{check.title}</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono ${
                      isPass
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : isWarn
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 pl-6">{check.description}</p>

                {check.details && (
                  <div className="text-[11px] text-zinc-300 pl-6 font-mono">{check.details}</div>
                )}

                {check.recommendation && (
                  <div className="text-[11px] text-amber-300/80 pl-6 pt-0.5">
                    💡 <strong>Fix:</strong> {check.recommendation}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJsonReport}
            className="border-white/10 bg-[#161a22] text-xs text-zinc-200 hover:bg-white/5"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 text-zinc-400" /> Export JSON Report
          </Button>

          <Button
            size="sm"
            onClick={() => openModal(null)}
            className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { GenerationQualityReport } from '@/types/ai-generator'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Box,
  Palette,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'

interface QualityReportProps {
  report?: GenerationQualityReport
}

export function QualityReport({ report }: QualityReportProps) {
  if (!report) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-[#12151b]/50 p-6 text-center text-zinc-500 text-xs">
        Validation diagnostics will appear once the 3D model is generated.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#12151b] p-4 space-y-4">
      {/* 3-Tier Validation Gates */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Compatibility & Validation Gates
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {/* Gate 1: GLB Compatible */}
          <div
            className={`rounded-lg border p-2.5 flex flex-col justify-between ${
              report.isGlbCompatible
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                : 'border-red-500/30 bg-red-950/20 text-red-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase">1. GLB Asset</span>
              {report.isGlbCompatible ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
            </div>
            <p className="text-[11px] font-semibold text-zinc-200 mt-1">
              {report.isGlbCompatible ? 'Valid Geometry' : 'Corrupted / Empty'}
            </p>
          </div>

          {/* Gate 2: Customizer Ready */}
          <div
            className={`rounded-lg border p-2.5 flex flex-col justify-between ${
              report.isCustomizerCompatible
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                : 'border-amber-500/30 bg-amber-950/20 text-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase">2. Customizer</span>
              {report.isCustomizerCompatible ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
            </div>
            <p className="text-[11px] font-semibold text-zinc-200 mt-1">
              {report.isCustomizerCompatible ? 'Artwork Ready' : 'UV Prep Needed'}
            </p>
          </div>

          {/* Gate 3: BlackBullet Runtime */}
          <div
            className={`rounded-lg border p-2.5 flex flex-col justify-between ${
              report.isBlackBulletReady
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                : 'border-white/10 bg-[#161a22] text-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase">3. BlackBullet</span>
              {report.isBlackBulletReady ? (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5 text-zinc-500" />
              )}
            </div>
            <p className="text-[11px] font-semibold text-zinc-200 mt-1">
              {report.isBlackBulletReady ? 'Registered Profile' : 'Unregistered'}
            </p>
          </div>
        </div>
      </div>

      {/* Geometry Metrics */}
      <div className="rounded-lg bg-[#161a22] p-3 space-y-2 border border-white/5">
        <span className="text-[11px] font-semibold text-zinc-300">Geometry Diagnostics</span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-zinc-500">Polygon Count:</span>
            <span className="ml-1.5 font-mono text-zinc-200">
              {report.triangleCount.toLocaleString()} tris
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Vertex Count:</span>
            <span className="ml-1.5 font-mono text-zinc-200">
              {report.vertexCount.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Mesh Hierarchy:</span>
            <span className="ml-1.5 font-mono text-zinc-200">{report.meshCount} mesh(es)</span>
          </div>
          <div>
            <span className="text-zinc-500">Normals:</span>
            <span className="ml-1.5 font-mono text-zinc-200">
              {report.hasNormals ? 'Calculated' : 'Missing'}
            </span>
          </div>
        </div>

        <div className="pt-1 text-[11px] text-zinc-400">
          <span className="text-zinc-500">Bounding Box: </span>
          <span className="font-mono">
            {report.dimensions.width} × {report.dimensions.height} × {report.dimensions.depth} cm
          </span>
        </div>
      </div>

      {/* PBR Texture Maps Breakdown */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-zinc-300">Preserved PBR Maps</span>
        <div className="grid grid-cols-5 gap-1 text-[10px] text-center">
          <div
            className={`rounded p-1 ${
              report.pbrMapsDetected.hasBaseColor
                ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                : 'bg-white/5 text-zinc-500'
            }`}
          >
            Albedo
          </div>
          <div
            className={`rounded p-1 ${
              report.pbrMapsDetected.hasNormalMap
                ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                : 'bg-white/5 text-zinc-500'
            }`}
          >
            Normal
          </div>
          <div
            className={`rounded p-1 ${
              report.pbrMapsDetected.hasRoughnessMap
                ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                : 'bg-white/5 text-zinc-500'
            }`}
          >
            Roughness
          </div>
          <div
            className={`rounded p-1 ${
              report.pbrMapsDetected.hasMetalnessMap
                ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                : 'bg-white/5 text-zinc-500'
            }`}
          >
            Metallic
          </div>
          <div
            className={`rounded p-1 ${
              report.pbrMapsDetected.hasEmissiveMap
                ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                : 'bg-white/5 text-zinc-500'
            }`}
          >
            Emissive
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-zinc-300">Processing Recommendations</span>
          <ul className="space-y-1 text-[11px] text-zinc-400">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400">•</span> {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

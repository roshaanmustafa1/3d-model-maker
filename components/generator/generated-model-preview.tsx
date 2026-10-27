'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Center } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Loader2, Eye, Box, Layers, RotateCcw, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModelPreviewProps {
  originalModelUrl?: string
  processedModelUrl?: string
  modelName?: string
  triangleCount?: number
  vertexCount?: number
}

type ShadingMode = 'textured' | 'solid' | 'wireframe'

function SceneModel({
  scene,
  shadingMode,
}: {
  scene: THREE.Group
  shadingMode: ShadingMode
}) {
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        if (shadingMode === 'wireframe') {
          obj.material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: '#10b981',
          })
        } else if (shadingMode === 'solid') {
          obj.material = new THREE.MeshStandardMaterial({
            color: '#a1a1aa',
            roughness: 0.5,
            metalness: 0.1,
          })
        }
      }
    })
    return clone
  }, [scene, shadingMode])

  return (
    <Center top>
      <primitive object={clonedScene} />
    </Center>
  )
}

export function GeneratedModelPreview({
  originalModelUrl,
  processedModelUrl,
  modelName = 'Generated Asset',
  triangleCount,
  vertexCount,
}: ModelPreviewProps) {
  const [activeVersion, setActiveVersion] = useState<'original' | 'processed'>('original')
  const [shadingMode, setShadingMode] = useState<ShadingMode>('textured')
  const [showGrid, setShowGrid] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedScene, setLoadedScene] = useState<THREE.Group | null>(null)

  // Use processed version if available by default
  useEffect(() => {
    if (processedModelUrl) {
      setActiveVersion('processed')
    } else {
      setActiveVersion('original')
    }
  }, [processedModelUrl])

  const targetUrl = activeVersion === 'processed' ? (processedModelUrl || originalModelUrl) : originalModelUrl

  useEffect(() => {
    if (!targetUrl) {
      setLoadedScene(null)
      return
    }

    setLoading(true)
    setError(null)

    const loader = new GLTFLoader()
    loader.load(
      targetUrl,
      (gltf) => {
        setLoadedScene(gltf.scene)
        setLoading(false)
      },
      undefined,
      (err) => {
        console.error('Error loading model preview:', err)
        setError('Failed to load 3D model asset in viewport.')
        setLoading(false)
      }
    )
  }, [targetUrl])

  return (
    <div className="relative h-full w-full rounded-xl border border-white/10 bg-[#0d0f14] overflow-hidden flex flex-col">
      {/* Viewport Top Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Version Switcher */}
          {processedModelUrl && (
            <div className="flex rounded-lg border border-white/10 bg-[#12151b]/90 p-0.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setActiveVersion('original')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  activeVersion === 'original'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Original AI Output
              </button>
              <button
                type="button"
                onClick={() => setActiveVersion('processed')}
                className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  activeVersion === 'processed'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Processed Asset
              </button>
            </div>
          )}

          {/* Shading Mode Switcher */}
          <div className="flex rounded-lg border border-white/10 bg-[#12151b]/90 p-0.5 backdrop-blur-sm">
            {(['textured', 'solid', 'wireframe'] as ShadingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setShadingMode(mode)}
                className={`rounded px-2 py-1 text-[10px] font-bold uppercase transition-colors ${
                  shadingMode === mode
                    ? 'bg-white/20 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Geometry Stats Badge */}
        {(triangleCount !== undefined || vertexCount !== undefined) && (
          <div className="rounded-lg border border-white/10 bg-[#12151b]/90 px-3 py-1 text-[11px] font-mono text-zinc-300 backdrop-blur-sm pointer-events-auto">
            <span>{triangleCount?.toLocaleString()} tris</span>
            <span className="mx-1.5 text-zinc-600">•</span>
            <span>{vertexCount?.toLocaleString()} verts</span>
          </div>
        )}
      </div>

      {/* Canvas 3D Viewport */}
      <div className="flex-1 w-full h-full">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d0f14]/80 backdrop-blur-sm space-y-2">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
            <p className="text-xs text-zinc-300">Loading 3D asset...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d0f14]/90 p-6 text-center space-y-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {!targetUrl && !loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-zinc-500 space-y-2 p-6 text-center">
            <Box className="h-10 w-10 text-zinc-600" />
            <p className="text-xs font-medium text-zinc-400">3D Asset Viewport</p>
            <p className="text-[11px] text-zinc-500 max-w-sm">
              Upload reference photographs and click Generate. The reconstructed 3D mesh will appear here for inspection.
            </p>
          </div>
        )}

        {loadedScene && (
          <Canvas camera={{ position: [0, 1.2, 2.5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <directionalLight position={[-5, 4, -5]} intensity={0.5} />
            <directionalLight position={[0, -5, 2]} intensity={0.3} />

            <SceneModel scene={loadedScene} shadingMode={shadingMode} />

            {showGrid && (
              <Grid
                position={[0, -0.01, 0]}
                args={[10, 10]}
                cellSize={0.2}
                cellThickness={1}
                cellColor="#27272a"
                sectionSize={1}
                sectionThickness={1.5}
                sectionColor="#3f3f46"
                fadeDistance={15}
                fadeStrength={1}
              />
            )}

            <OrbitControls makeDefault minDistance={0.5} maxDistance={15} />
          </Canvas>
        )}
      </div>
    </div>
  )
}

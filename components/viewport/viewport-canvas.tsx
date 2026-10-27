'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useEditorStore } from '@/stores/editor-store'
import { SceneRenderer } from './scene-renderer'
import { TransformGizmo } from './transform-gizmo'
import { EnvironmentLighting } from './environment-lighting'
import { ViewportOverlay } from './viewport-overlay'
import { CameraViewPreset } from '@/types/editor'
import { CameraController } from './camera-controller'

export function ViewportCanvas() {
  const clearObjectSelection = useEditorStore((state) => state.clearObjectSelection)
  const clearTopologySelection = useEditorStore((state) => state.clearTopologySelection)
  const objectRefs = useRef<Map<string, THREE.Object3D>>(new Map())
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  const [webglSupported, setWebglSupported] = useState(true)

  // Verify WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setWebglSupported(false)
    } catch {
      setWebglSupported(false)
    }
  }, [])

  const handleResetCamera = (preset: CameraViewPreset = 'perspective') => {
    const controls = orbitControlsRef.current
    if (!controls) return

    const targetPos = new THREE.Vector3(0, 0.5, 0)
    controls.target.copy(targetPos)

    switch (preset) {
      case 'front':
        controls.object.position.set(0, 0.5, 7)
        break
      case 'right':
        controls.object.position.set(7, 0.5, 0)
        break
      case 'left':
        controls.object.position.set(-7, 0.5, 0)
        break
      case 'back':
        controls.object.position.set(0, 0.5, -7)
        break
      case 'bottom':
        controls.object.position.set(0, -9, 0.001)
        break
      case 'top':
        controls.object.position.set(0, 9, 0.001) // slight offset to prevent gimbal lock
        break
      case 'perspective':
      default:
        controls.object.position.set(5, 4, 7)
        break
    }
    controls.update()
  }

  if (!webglSupported) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0d0f13] text-zinc-400 p-8 text-center">
        <div className="max-w-md rounded-xl border border-red-500/20 bg-red-950/20 p-6">
          <h3 className="text-lg font-semibold text-red-400">WebGL Acceleration Not Available</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Hardware accelerated WebGL is disabled or not supported by your current browser environment.
            Please enable hardware acceleration in your browser settings to use the 3D Viewport.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden bg-[#0d0f14]"
      onPointerDown={(e) => {
        pointerDownPos.current = { x: e.clientX, y: e.clientY }
      }}
    >
      {/* Floating Viewport Overlay Toolbar */}
      <ViewportOverlay onResetCamera={handleResetCamera} />

      {/* R3F WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [5, 4, 7], fov: 45 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onPointerMissed={(e) => {
          // Verify movement threshold to prevent camera drag from clearing selection
          if (pointerDownPos.current) {
            const dist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y)
            if (dist > 5) return // User was orbiting, panning, or dragging camera
          }
          if (e.type === 'click') {
            const editorMode = useEditorStore.getState().editorMode
            if (editorMode === 'edit') {
              clearTopologySelection()
            } else {
              clearObjectSelection()
            }
          }
        }}
        className="h-full w-full"
      >
        <color attach="background" args={['#0e1117']} />

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={orbitControlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={0.5}
          maxDistance={60}
          target={[0, 0.5, 0]}
        />

        {/* Studio Lighting & Ground Grid */}
        <EnvironmentLighting />
        <CameraController objectRefs={objectRefs} controlsRef={orbitControlsRef} />

        {/* Scene Objects */}
        <SceneRenderer objectRefs={objectRefs} />

        {/* Interactive Transform Gizmo (Translate, Rotate, Scale) */}
        <TransformGizmo objectRefs={objectRefs} orbitControlsRef={orbitControlsRef} />
      </Canvas>
    </div>
  )
}

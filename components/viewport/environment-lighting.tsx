'use client'

import React from 'react'
import { Grid, ContactShadows } from '@react-three/drei'
import { useEditorStore } from '@/stores/editor-store'

export function EnvironmentLighting() {
  const env = useEditorStore((state) => state.environment)

  return (
    <>
      {/* Studio Lighting Rig */}
      <ambientLight intensity={env.ambientIntensity} />

      {/* Key Light */}
      <directionalLight
        position={[6, 10, 6]}
        intensity={env.directionalIntensity}
        castShadow={env.shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={35}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0001}
      />

      {/* Fill Light (Soft cool blue) */}
      <directionalLight position={[-6, 6, -4]} intensity={env.directionalIntensity * 0.45} color="#93c5fd" />

      {/* Rim Light (Warm rim) */}
      <directionalLight position={[0, 8, -8]} intensity={env.directionalIntensity * 0.6} color="#fde047" />

      {/* Soft Contact Shadows on Floor */}
      {env.shadows && (
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.7}
          scale={25}
          blur={1.8}
          far={6}
          resolution={1024}
          color="#000000"
          raycast={() => null}
        />
      )}

      {/* Infinite Dark Studio Grid */}
      {env.grid && (
        <Grid
          position={[0, 0, 0]}
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.8}
          cellColor="#262b35"
          sectionSize={2}
          sectionThickness={1.2}
          sectionColor="#10b981"
          fadeDistance={25}
          fadeStrength={1.5}
          infiniteGrid
          raycast={() => null}
        />
      )}

      {/* World Coordinate Axes (Red=X, Green=Y, Blue=Z) */}
      {env.axes && <axesHelper args={[2]} raycast={() => null} />}
    </>
  )
}

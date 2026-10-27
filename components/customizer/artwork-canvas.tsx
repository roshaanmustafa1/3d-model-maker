'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Star,
  Line,
  Text as KonvaText,
  Image as KonvaImage,
  Transformer,
  Group,
} from 'react-konva'
import Konva from 'konva'
import { artworkNodeConfig } from '@/engine/customization/artwork-renderer'
import { useCustomizerStore } from '@/stores/customizer-store'
import { ArtworkLayer, ImageArtworkLayer, TextArtworkLayer, ShapeArtworkLayer } from '@/types/customization'

interface CanvasImageItemProps {
  layer: ImageArtworkLayer
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<ImageArtworkLayer>) => void
}

function CanvasImageItem({ layer, isSelected, onSelect, onChange }: CanvasImageItemProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const imageRef = useRef<Konva.Image>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = layer.src
    img.onload = () => setImage(img)
  }, [layer.src])

  return (
    <KonvaImage
      ref={imageRef}
      id={layer.id}
      image={image || undefined}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        })
      }}
      onTransformEnd={() => {
        const node = imageRef.current
        if (!node) return
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onChange({
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(10, Math.round(node.width() * scaleX)),
          height: Math.max(10, Math.round(node.height() * scaleY)),
          rotation: Math.round(node.rotation()),
        })
      }}
    />
  )
}

interface CanvasTextItemProps {
  layer: TextArtworkLayer
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<TextArtworkLayer>) => void
}

function CanvasTextItem({ layer, isSelected, onSelect, onChange }: CanvasTextItemProps) {
  const textRef = useRef<Konva.Text>(null)

  return (
    <KonvaText
      ref={textRef}
      id={layer.id}
      text={layer.text}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      fontFamily={layer.fontFamily}
      fontSize={layer.fontSize}
      fontStyle={`${layer.fontStyle} ${layer.fontWeight}`}
      fill={layer.fill}
      align={layer.align}
      letterSpacing={layer.letterSpacing}
      lineHeight={layer.lineHeight}
      stroke={layer.stroke}
      strokeWidth={layer.strokeWidth || 0}
      rotation={layer.rotation}
      scaleX={layer.scaleX}
      scaleY={layer.scaleY}
      opacity={layer.opacity}
      visible={layer.visible}
      draggable={!layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: Math.round(e.target.x()),
          y: Math.round(e.target.y()),
        })
      }}
      onTransformEnd={() => {
        const node = textRef.current
        if (!node) return
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        onChange({
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          width: Math.max(20, Math.round(node.width() * scaleX)),
          fontSize: Math.max(8, Math.round(layer.fontSize * scaleY)),
          rotation: Math.round(node.rotation()),
        })
      }}
    />
  )
}

interface CanvasShapeItemProps {
  layer: ShapeArtworkLayer
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<ShapeArtworkLayer>) => void
}

function CanvasShapeItem({ layer, isSelected, onSelect, onChange }: CanvasShapeItemProps) {
  const shapeRef = useRef<Konva.Shape>(null)

  const commonProps = {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    opacity: layer.opacity,
    visible: layer.visible,
    draggable: !layer.locked,
    fill: layer.fill,
    stroke: layer.stroke,
    strokeWidth: layer.strokeWidth,
    ...artworkNodeConfig(layer).attrs as Konva.ShapeConfig,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onChange({
        x: Math.round(e.target.x()),
        y: Math.round(e.target.y()),
      })
    },
    onTransformEnd: () => {
      const node = shapeRef.current
      if (!node) return
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      node.scaleX(1)
      node.scaleY(1)
      onChange({
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        width: Math.max(10, Math.round(layer.width * scaleX)),
        height: Math.max(10, Math.round(layer.height * scaleY)),
        rotation: Math.round(node.rotation()),
      })
    },
  }

  if (layer.shapeType === 'circle') {
    return (
      <Circle
        ref={shapeRef as unknown as React.RefObject<Konva.Circle>}
        {...commonProps}
        radius={Math.min(layer.width, layer.height) / 2}
      />
    )
  }

  if (layer.shapeType === 'star') {
    return (
      <Star
        ref={shapeRef as unknown as React.RefObject<Konva.Star>}
        {...commonProps}
        numPoints={5}
        innerRadius={Math.min(layer.width, layer.height) / 4}
        outerRadius={Math.min(layer.width, layer.height) / 2}
      />
    )
  }

  if (layer.shapeType === 'triangle') {
    return <Line ref={shapeRef as unknown as React.RefObject<Konva.Line>} {...commonProps} points={[layer.width / 2, 0, layer.width, layer.height, 0, layer.height]} closed />
  }

  return (
    <Rect
      ref={shapeRef as unknown as React.RefObject<Konva.Rect>}
      {...commonProps}
      width={layer.width}
      height={layer.height}
      cornerRadius={layer.cornerRadius || 0}
    />
  )
}

export function ArtworkCanvas() {
  const [mounted, setMounted] = useState(false)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  const activeZoneId = useCustomizerStore((state) => state.activeZoneId)
  const zones = useCustomizerStore((state) => state.zones)
  const activeLayerId = useCustomizerStore((state) => state.activeLayerId)
  const setActiveLayer = useCustomizerStore((state) => state.setActiveLayer)
  const updateLayer = useCustomizerStore((state) => state.updateLayer)
  const removeLayer = useCustomizerStore((state) => state.removeLayer)
  const duplicateLayer = useCustomizerStore((state) => state.duplicateLayer)
  const copyLayer = useCustomizerStore((state) => state.copyLayer)
  const pasteLayer = useCustomizerStore((state) => state.pasteLayer)
  const undo = useCustomizerStore((state) => state.undo)
  const redo = useCustomizerStore((state) => state.redo)
  const recordHistory = useCustomizerStore((state) => state.recordHistory)

  const activeZone = zones[activeZoneId]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync Konva Transformer with activeLayerId
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return
    const stage = stageRef.current
    const transformer = transformerRef.current

    if (activeLayerId) {
      const selectedNode = stage.findOne(`#${activeLayerId}`)
      if (selectedNode) {
        transformer.nodes([selectedNode])
        transformer.getLayer()?.batchDraw()
        return
      }
    }
    transformer.nodes([])
    transformer.getLayer()?.batchDraw()
  }, [activeLayerId, activeZone?.layers])

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (!activeZone) return

      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeLayerId) {
        e.preventDefault()
        removeLayer(activeZone.id, activeLayerId)
        return
      }

      // Escape -> Deselect
      if (e.key === 'Escape') {
        e.preventDefault()
        setActiveLayer(null)
        return
      }

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' && activeLayerId) {
          e.preventDefault()
          copyLayer(activeZone.id, activeLayerId)
        } else if (e.key === 'v') {
          e.preventDefault()
          pasteLayer(activeZone.id)
        } else if (e.key === 'd' && activeLayerId) {
          e.preventDefault()
          duplicateLayer(activeZone.id, activeLayerId)
        } else if (e.key === 'z') {
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
        } else if (e.key === 'y') {
          e.preventDefault()
          redo()
        }
      }

      // Arrow keys nudging
      if (
        activeLayerId &&
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
      ) {
        e.preventDefault()
        const currentLayer = activeZone.layers.find((l) => l.id === activeLayerId)
        if (!currentLayer) return

        const delta = e.shiftKey ? 10 : 1
        let dx = 0
        let dy = 0

        if (e.key === 'ArrowLeft') dx = -delta
        if (e.key === 'ArrowRight') dx = delta
        if (e.key === 'ArrowUp') dy = -delta
        if (e.key === 'ArrowDown') dy = delta

        updateLayer(activeZone.id, activeLayerId, {
          x: currentLayer.x + dx,
          y: currentLayer.y + dy,
        })
        recordHistory()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    activeZone,
    activeLayerId,
    removeLayer,
    setActiveLayer,
    copyLayer,
    pasteLayer,
    duplicateLayer,
    undo,
    redo,
    updateLayer,
    recordHistory,
  ])

  if (!mounted || !activeZone) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#161a22] text-xs text-zinc-500">
        Loading 2D Canvas Editor...
      </div>
    )
  }

  const canvasWidth = activeZone.canvasWidth || 1024
  const canvasHeight = activeZone.canvasHeight || 1024

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#0e1117] p-4 select-none">
      {/* 2D Design Canvas Workspace Box */}
      <div
        className="relative shadow-2xl rounded border border-white/10 overflow-hidden bg-[#181a20]"
        style={{
          width: '500px',
          height: '500px',
        }}
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }}
        />

        {/* Center guides */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/20 pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-500/20 pointer-events-none" />

        {/* Konva Stage scaled to fit container (500 / 1024 = ~0.488) */}
        <Stage
          ref={stageRef}
          width={500}
          height={500}
          scaleX={500 / canvasWidth}
          scaleY={500 / canvasHeight}
          onMouseDown={(e) => {
            // Deselect when clicking empty stage background
            if (e.target === e.target.getStage()) {
              setActiveLayer(null)
            }
          }}
        >
          <Layer>
            {activeZone.layers
              .slice()
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((layer) => {
                const isSelected = layer.id === activeLayerId
                if (layer.type === 'image') {
                  return (
                    <CanvasImageItem
                      key={layer.id}
                      layer={layer}
                      isSelected={isSelected}
                      onSelect={() => setActiveLayer(layer.id)}
                      onChange={(updates) => {
                        updateLayer(activeZone.id, layer.id, updates)
                        recordHistory()
                      }}
                    />
                  )
                }
                if (layer.type === 'text') {
                  return (
                    <CanvasTextItem
                      key={layer.id}
                      layer={layer}
                      isSelected={isSelected}
                      onSelect={() => setActiveLayer(layer.id)}
                      onChange={(updates) => {
                        updateLayer(activeZone.id, layer.id, updates)
                        recordHistory()
                      }}
                    />
                  )
                }
                if (layer.type === 'shape') {
                  return (
                    <CanvasShapeItem
                      key={layer.id}
                      layer={layer}
                      isSelected={isSelected}
                      onSelect={() => setActiveLayer(layer.id)}
                      onChange={(updates) => {
                        updateLayer(activeZone.id, layer.id, updates)
                        recordHistory()
                      }}
                    />
                  )
                }
                return null
              })}

            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Minimum size constraint
                if (newBox.width < 10 || newBox.height < 10) {
                  return oldBox
                }
                return newBox
              }}
              anchorCornerRadius={3}
              anchorSize={8}
              anchorStroke="#10b981"
              anchorFill="#09090b"
              borderStroke="#10b981"
              borderDash={[4, 4]}
            />
          </Layer>
        </Stage>
      </div>

      {/* Floating Canvas Meta Tag */}
      <div className="absolute bottom-2 left-4 text-[10px] text-zinc-500 font-mono">
        Active Zone: <span className="text-emerald-400 font-medium">{activeZone.name}</span> | Canvas:{' '}
        {canvasWidth}x{canvasHeight}px
      </div>
    </div>
  )
}

import { FabricPreset } from '@/types/customization'

export const FABRIC_PRESETS: FabricPreset[] = [
  {
    id: 'cotton-heavyweight',
    name: '100% Combed Heavy Cotton',
    category: 'cotton',
    color: '#18181b',
    roughness: 0.92,
    metalness: 0.0,
    description: 'Crisp, matte finish with fine knit micro-texture. Ideal for oversized streetwear tees.',
  },
  {
    id: 'fleece-400gsm',
    name: 'Heavyweight Fleece (400 GSM)',
    category: 'fleece',
    color: '#27272a',
    roughness: 0.98,
    metalness: 0.0,
    description: 'Plush, non-reflective high-density brushed interior fleece for premium hoodies.',
  },
  {
    id: 'french-terry',
    name: 'French Terry Loopback',
    category: 'terry',
    color: '#f4f4f5',
    roughness: 0.88,
    metalness: 0.0,
    description: 'Medium-weight loopback knit offering soft drape and subtle light diffusion.',
  },
  {
    id: 'vintage-washed',
    name: 'Vintage Washed Charcoal',
    category: 'cotton',
    color: '#3f3f46',
    roughness: 0.94,
    metalness: 0.0,
    description: 'Enzyme-washed distressed cotton with softened seam highlights.',
  },
  {
    id: 'performance-poly',
    name: 'Performance Poly Pique',
    category: 'poly',
    color: '#09090b',
    roughness: 0.62,
    metalness: 0.04,
    description: 'Moisture-wicking athletic knit with subtle specular sheen and technical feel.',
  },
  {
    id: 'duck-canvas',
    name: 'Heavy Duck Canvas',
    category: 'canvas',
    color: '#d4d4d8',
    roughness: 0.89,
    metalness: 0.0,
    description: 'Rugged, structured plain-weave cotton canvas for jackets and bags.',
  },
  {
    id: 'silk-satin',
    name: 'Silk / Satin Sheen',
    category: 'satin',
    color: '#1e1b4b',
    roughness: 0.32,
    metalness: 0.18,
    description: 'High-specular smooth weave with lustrous drape and directional reflections.',
  },
  {
    id: 'matte-ceramic',
    name: 'Matte Powder Coating',
    category: 'ceramic',
    color: '#18181b',
    roughness: 0.55,
    metalness: 0.05,
    description: 'Velvety matte powder-coated finish for bottles, mugs and hardware.',
  },
  {
    id: 'brushed-aluminum',
    name: 'Brushed Aluminum',
    category: 'metal',
    color: '#e4e4e7',
    roughness: 0.28,
    metalness: 0.88,
    description: 'Precision brushed metal for thermal drinkware, accessories, and cans.',
  },
]

export function getFabricPresetById(id: string): FabricPreset | undefined {
  return FABRIC_PRESETS.find((p) => p.id === id)
}

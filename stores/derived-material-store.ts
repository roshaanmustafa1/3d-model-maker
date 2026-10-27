import { create } from 'zustand'
import type { ComposedTarget } from '@/engine/customization/material-composition'
export const useDerivedMaterialStore = create<{ targets: Record<string, ComposedTarget>; publish: (targets: ComposedTarget[]) => void }>(set => ({
  targets: {}, publish: targets => set({ targets: Object.fromEntries(targets.map(target => [target.key, target])) }),
}))

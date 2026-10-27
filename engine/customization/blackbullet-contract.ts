import type { UVBounds } from '@/types/customization'

export const BLACKBULLET_CONTRACT = {
  version: 1,
  profile: 'shirt',
  regions: {
    body_front: 'shirt_front', body_back: 'shirt_back',
    sleeve_left: 'shoulder_left', sleeve_right: 'shoulder_right',
    collar: 'collar', body_sides: 'shirt_base',
  } as Record<string, string>,
  atlas: {
    shirt_front: { minU: .04, maxU: .46, minV: .06, maxV: .96 },
    shirt_back: { minU: .54, maxU: .96, minV: .06, maxV: .96 },
  } as Record<string, UVBounds>,
}

export function regionForMesh(name: string, zone?: string): string | undefined {
  if (BLACKBULLET_CONTRACT.atlas[name]) return name
  if (Object.values(BLACKBULLET_CONTRACT.regions).includes(name)) return name
  return zone ? BLACKBULLET_CONTRACT.regions[zone] : undefined
}

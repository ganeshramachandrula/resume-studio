import type { FontSizeOption, FontSizeKey } from './types'

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'small', label: 'Small', multiplier: 0.85 },
  { id: 'medium', label: 'Medium', multiplier: 1.0 },
  { id: 'large', label: 'Large', multiplier: 1.15 },
]

export function getFontSizeMultiplier(size: FontSizeKey): number {
  return FONT_SIZE_OPTIONS.find((o) => o.id === size)?.multiplier ?? 1.0
}

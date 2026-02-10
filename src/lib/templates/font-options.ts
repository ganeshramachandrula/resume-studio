import type { FontOption } from './types'

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'helvetica',
    name: 'Helvetica',
    family: 'Helvetica',
    familyBold: 'Helvetica-Bold',
    builtIn: true,
  },
  {
    id: 'times',
    name: 'Times Roman',
    family: 'Times-Roman',
    familyBold: 'Times-Bold',
    builtIn: true,
  },
  {
    id: 'courier',
    name: 'Courier',
    family: 'Courier',
    familyBold: 'Courier-Bold',
    builtIn: true,
  },
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter',
    familyBold: 'Inter-Bold',
    builtIn: false,
  },
  {
    id: 'lato',
    name: 'Lato',
    family: 'Lato',
    familyBold: 'Lato-Bold',
    builtIn: false,
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto',
    familyBold: 'Roboto-Bold',
    builtIn: false,
  },
]

export function getFontOption(id: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) || FONT_OPTIONS[0]
}

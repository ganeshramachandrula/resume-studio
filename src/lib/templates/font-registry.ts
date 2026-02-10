import { Font } from '@react-pdf/renderer'

let registered = false

export function registerCustomFonts() {
  if (registered) return
  registered = true

  Font.register({
    family: 'Inter',
    src: '/fonts/Inter-Regular.ttf',
  })
  Font.register({
    family: 'Inter-Bold',
    src: '/fonts/Inter-Bold.ttf',
  })

  Font.register({
    family: 'Lato',
    src: '/fonts/Lato-Regular.ttf',
  })
  Font.register({
    family: 'Lato-Bold',
    src: '/fonts/Lato-Bold.ttf',
  })

  Font.register({
    family: 'Roboto',
    src: '/fonts/Roboto-Regular.ttf',
  })
  Font.register({
    family: 'Roboto-Bold',
    src: '/fonts/Roboto-Bold.ttf',
  })
}

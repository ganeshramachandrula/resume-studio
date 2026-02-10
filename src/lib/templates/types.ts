export type TemplateLayout = 'single-column' | 'two-column-left' | 'two-column-right'

export interface TemplateColors {
  primary: string
  primaryLight: string
  headerBg: string
  headerText: string
  sidebarBg: string
  sidebarText: string
  sidebarAccent: string
  bodyText: string
  bodySecondary: string
  sectionTitle: string
  divider: string
}

export interface TemplateConfig {
  id: string
  name: string
  description: string
  layout: TemplateLayout
  premium: boolean
  colors: TemplateColors
  fonts: {
    heading: string
    headingBold: string
    body: string
    bodyBold: string
  }
  spacing: {
    pagePadding: number
    sectionGap: number
    itemGap: number
    sidebarWidth: string // percentage as string e.g. '35%'
  }
  style: {
    headerCentered: boolean
    sectionTitleUppercase: boolean
    sectionTitleBorder: boolean
    bulletChar: string
    nameSize: number
    titleSize: number
    sectionTitleSize: number
    bodySize: number
    smallSize: number
  }
}

export interface FontOption {
  id: string
  name: string
  family: string
  familyBold: string
  builtIn: boolean // true = no Font.register needed
}

export type FontSizeKey = 'small' | 'medium' | 'large'

export interface FontSizeOption {
  id: FontSizeKey
  label: string
  multiplier: number
}

export interface TemplateEntry {
  id: string
  name: string
  description: string
  premium: boolean
  // For free templates, component is the direct React component
  // For premium templates, config is the TemplateConfig for the configurable engine
  config?: TemplateConfig
}

'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ResumeData } from '@/types/documents'
import type { TemplateConfig, FontSizeKey } from '@/lib/templates/types'
import { getFontSizeMultiplier } from '@/lib/templates/font-sizes'
import { getFontOption } from '@/lib/templates/font-options'
import { registerCustomFonts } from '@/lib/templates/font-registry'
import { WatermarkOverlay } from '../watermark-overlay'

interface Props {
  data: ResumeData
  config: TemplateConfig
  fontOverride?: string
  fontSizeOverride?: FontSizeKey
  watermark?: boolean
}

function s(base: number, mult: number) {
  return Math.round(base * mult * 10) / 10
}

export function ConfigurableTemplate({ data, config, fontOverride, fontSizeOverride, watermark }: Props) {
  // Resolve font
  const fontOpt = fontOverride ? getFontOption(fontOverride) : null
  const headingFont = fontOpt ? fontOpt.family : config.fonts.heading
  const headingBoldFont = fontOpt ? fontOpt.familyBold : config.fonts.headingBold
  const bodyFont = fontOpt ? fontOpt.family : config.fonts.body
  const bodyBoldFont = fontOpt ? fontOpt.familyBold : config.fonts.bodyBold

  // Register custom fonts if needed
  if (fontOpt && !fontOpt.builtIn) {
    registerCustomFonts()
  }

  const sz = getFontSizeMultiplier(fontSizeOverride || 'medium')
  const c = config.colors
  const sp = config.spacing
  const st = config.style

  const styles = StyleSheet.create({
    page: { backgroundColor: '#FFFFFF', fontFamily: bodyFont, fontSize: s(st.bodySize, sz), padding: 0 },
    // Header (single-column: full width block; two-column: in sidebar or main)
    headerBlock: {
      backgroundColor: st.headerCentered ? c.headerBg : 'transparent',
      padding: st.headerCentered ? sp.pagePadding : 0,
      ...(st.headerCentered ? { alignItems: 'center' as const } : {}),
    },
    name: { fontSize: s(st.nameSize, sz), fontFamily: headingBoldFont, color: st.headerCentered ? c.headerText : c.primary, marginBottom: 3 },
    title: { fontSize: s(st.titleSize, sz), fontFamily: headingFont, color: st.headerCentered ? c.headerText : c.primaryLight, marginBottom: 8, opacity: 0.9 },
    contactRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 6 },
    contactItem: { fontSize: s(st.smallSize, sz), color: st.headerCentered ? c.headerText : c.bodySecondary, opacity: 0.8 },
    // Sidebar (for two-column layouts)
    sidebar: { width: sp.sidebarWidth, backgroundColor: c.sidebarBg, padding: sp.pagePadding, color: c.sidebarText },
    sidebarSectionTitle: { fontSize: s(st.sectionTitleSize, sz), fontFamily: headingBoldFont, color: c.sidebarAccent, marginBottom: 6, marginTop: sp.sectionGap, textTransform: st.sectionTitleUppercase ? ('uppercase' as const) : ('none' as const), letterSpacing: st.sectionTitleUppercase ? 1 : 0 },
    sidebarItem: { fontSize: s(st.bodySize * 0.9, sz), marginBottom: 3, color: c.sidebarText },
    sidebarSmall: { fontSize: s(st.smallSize, sz), color: c.sidebarText, opacity: 0.8, marginBottom: 2 },
    // Main
    main: { flex: 1, padding: sp.pagePadding, color: c.bodyText },
    sectionTitle: {
      fontSize: s(st.sectionTitleSize, sz),
      fontFamily: headingBoldFont,
      color: c.sectionTitle,
      marginBottom: 6,
      marginTop: sp.sectionGap,
      textTransform: st.sectionTitleUppercase ? ('uppercase' as const) : ('none' as const),
      letterSpacing: st.sectionTitleUppercase ? 1 : 0,
      ...(st.sectionTitleBorder ? { borderBottomWidth: 1, borderBottomColor: c.divider, paddingBottom: 3 } : {}),
    },
    summary: { fontSize: s(st.bodySize, sz), lineHeight: 1.5, color: c.bodyText },
    expBlock: { marginBottom: sp.itemGap },
    expHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 2 },
    expTitle: { fontSize: s(st.bodySize, sz), fontFamily: bodyBoldFont, color: c.bodyText },
    expDate: { fontSize: s(st.smallSize, sz), color: c.bodySecondary },
    expCompany: { fontSize: s(st.bodySize * 0.9, sz), color: c.bodySecondary, marginBottom: 3 },
    bullet: { fontSize: s(st.bodySize * 0.9, sz), lineHeight: 1.4, color: c.bodyText, marginBottom: 2, paddingLeft: 10 },
    skillItem: { fontSize: s(st.bodySize * 0.9, sz), marginBottom: 2, color: c.bodyText },
    eduInst: { fontSize: s(st.bodySize, sz), fontFamily: bodyBoldFont, color: c.bodyText },
    eduDetail: { fontSize: s(st.smallSize, sz), color: c.bodySecondary, marginBottom: 2 },
  })

  // -- Shared section renderers --
  const renderSummary = () => (
    <View style={{ marginBottom: sp.sectionGap }}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.summary}>{data.summary}</Text>
    </View>
  )

  const renderExperience = () => (
    <View style={{ marginBottom: sp.sectionGap }}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {data.experience?.map((exp, i) => (
        <View key={i} style={styles.expBlock}>
          <View style={styles.expHeader}>
            <Text style={styles.expTitle}>{exp.title}</Text>
            <Text style={styles.expDate}>{exp.start_date} — {exp.end_date}</Text>
          </View>
          <Text style={styles.expCompany}>{exp.company} | {exp.location}</Text>
          {exp.bullets?.map((b, j) => (
            <Text key={j} style={styles.bullet}>{st.bulletChar} {b}</Text>
          ))}
        </View>
      ))}
    </View>
  )

  const renderSkillsSidebar = () => (
    <>
      <View>
        <Text style={styles.sidebarSectionTitle}>Skills</Text>
        {data.skills?.core?.map((sk, i) => <Text key={i} style={styles.sidebarItem}>{sk}</Text>)}
      </View>
      {data.skills?.tools?.length > 0 && (
        <View>
          <Text style={styles.sidebarSectionTitle}>Tools</Text>
          {data.skills.tools.map((t, i) => <Text key={i} style={styles.sidebarItem}>{t}</Text>)}
        </View>
      )}
    </>
  )

  const renderSkillsInline = () => (
    <View style={{ marginBottom: sp.sectionGap }}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <Text style={styles.skillItem}>{[...(data.skills?.core || []), ...(data.skills?.tools || [])].join('  |  ')}</Text>
    </View>
  )

  const renderEducationSidebar = () => (
    <View>
      <Text style={styles.sidebarSectionTitle}>Education</Text>
      {data.education?.map((edu, i) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <Text style={{ ...styles.sidebarItem, fontFamily: bodyBoldFont }}>{edu.institution}</Text>
          <Text style={styles.sidebarSmall}>{edu.degree} in {edu.field}</Text>
          <Text style={styles.sidebarSmall}>{edu.graduation_date}</Text>
        </View>
      ))}
    </View>
  )

  const renderEducationInline = () => (
    <View style={{ marginBottom: sp.sectionGap }}>
      <Text style={styles.sectionTitle}>Education</Text>
      {data.education?.map((edu, i) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <Text style={styles.eduInst}>{edu.institution}</Text>
          <Text style={styles.eduDetail}>{edu.degree} in {edu.field} | {edu.graduation_date}</Text>
        </View>
      ))}
    </View>
  )

  const renderCertifications = (isSidebar = false) => {
    if (!data.certifications?.length) return null
    return (
      <View>
        <Text style={isSidebar ? styles.sidebarSectionTitle : styles.sectionTitle}>Certifications</Text>
        {data.certifications.map((cert, i) => (
          <Text key={i} style={isSidebar ? styles.sidebarItem : styles.skillItem}>{cert}</Text>
        ))}
      </View>
    )
  }

  // -- Layout rendering --
  if (config.layout === 'single-column') {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={styles.name}>{data.header.name}</Text>
            <Text style={styles.title}>{data.header.title}</Text>
            <View style={styles.contactRow}>
              <Text style={styles.contactItem}>{data.header.email}</Text>
              <Text style={styles.contactItem}>{data.header.phone}</Text>
              <Text style={styles.contactItem}>{data.header.location}</Text>
              {data.header.linkedin && <Text style={styles.contactItem}>{data.header.linkedin}</Text>}
            </View>
          </View>
          {/* Body */}
          <View style={styles.main}>
            {renderSummary()}
            {renderExperience()}
            {renderSkillsInline()}
            {renderEducationInline()}
            {renderCertifications()}
          </View>
          {watermark && <WatermarkOverlay />}
        </Page>
      </Document>
    )
  }

  // Two-column layout (left or right sidebar)
  const isLeftSidebar = config.layout === 'two-column-left'
  const sidebarContent = (
    <View style={styles.sidebar}>
      {isLeftSidebar && (
        <>
          <Text style={{ ...styles.name, color: c.sidebarText }}>{data.header.name}</Text>
          <Text style={{ ...styles.title, color: c.sidebarAccent }}>{data.header.title}</Text>
          <Text style={styles.sidebarSmall}>{data.header.email}</Text>
          <Text style={styles.sidebarSmall}>{data.header.phone}</Text>
          <Text style={styles.sidebarSmall}>{data.header.location}</Text>
          {data.header.linkedin && <Text style={styles.sidebarSmall}>{data.header.linkedin}</Text>}
        </>
      )}
      {renderSkillsSidebar()}
      {renderEducationSidebar()}
      {renderCertifications(true)}
      {!isLeftSidebar && (
        <>
          <View style={{ marginTop: sp.sectionGap }}>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>
            <Text style={styles.sidebarSmall}>{data.header.email}</Text>
            <Text style={styles.sidebarSmall}>{data.header.phone}</Text>
            <Text style={styles.sidebarSmall}>{data.header.location}</Text>
            {data.header.linkedin && <Text style={styles.sidebarSmall}>{data.header.linkedin}</Text>}
          </View>
        </>
      )}
    </View>
  )

  const mainContent = (
    <View style={styles.main}>
      {!isLeftSidebar && (
        <>
          <Text style={styles.name}>{data.header.name}</Text>
          <Text style={styles.title}>{data.header.title}</Text>
        </>
      )}
      {renderSummary()}
      {renderExperience()}
    </View>
  )

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, flexDirection: 'row' }}>
        {isLeftSidebar ? (
          <>
            {sidebarContent}
            {mainContent}
          </>
        ) : (
          <>
            {mainContent}
            {sidebarContent}
          </>
        )}
        {watermark && <WatermarkOverlay />}
      </Page>
    </Document>
  )
}

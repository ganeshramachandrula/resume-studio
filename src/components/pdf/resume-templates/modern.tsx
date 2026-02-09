'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { ResumeData } from '@/types/documents'
import { WatermarkOverlay } from '../watermark-overlay'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 0,
  },
  sidebar: {
    width: '35%',
    backgroundColor: '#1A56DB',
    padding: 24,
    color: '#FFFFFF',
  },
  main: {
    width: '65%',
    padding: 24,
    color: '#111827',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 11,
    marginBottom: 16,
    color: '#BFDBFE',
  },
  contactItem: {
    fontSize: 8,
    marginBottom: 4,
    color: '#DBEAFE',
  },
  sidebarSection: {
    marginTop: 20,
  },
  sidebarSectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    color: '#BFDBFE',
  },
  skillItem: {
    fontSize: 9,
    marginBottom: 3,
    color: '#FFFFFF',
  },
  eduInstitution: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  eduDetail: {
    fontSize: 8,
    color: '#DBEAFE',
    marginBottom: 2,
  },
  mainSection: {
    marginBottom: 16,
  },
  mainSectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1A56DB',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    paddingBottom: 4,
  },
  summary: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  expTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  expDate: {
    fontSize: 8,
    color: '#6B7280',
  },
  expCompany: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#374151',
    marginBottom: 2,
    paddingLeft: 10,
  },
  expBlock: {
    marginBottom: 10,
  },
})

export function ModernTemplate({ data, watermark }: { data: ResumeData; watermark?: boolean }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.name}>{data.header.name}</Text>
          <Text style={styles.title}>{data.header.title}</Text>

          {/* Contact */}
          <View>
            <Text style={styles.contactItem}>{data.header.email}</Text>
            <Text style={styles.contactItem}>{data.header.phone}</Text>
            <Text style={styles.contactItem}>{data.header.location}</Text>
            {data.header.linkedin && (
              <Text style={styles.contactItem}>{data.header.linkedin}</Text>
            )}
          </View>

          {/* Skills */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Skills</Text>
            {data.skills?.technical?.map((s, i) => (
              <Text key={i} style={styles.skillItem}>
                {s}
              </Text>
            ))}
          </View>

          {/* Tools */}
          {data.skills?.tools?.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Tools</Text>
              {data.skills.tools.map((t, i) => (
                <Text key={i} style={styles.skillItem}>
                  {t}
                </Text>
              ))}
            </View>
          )}

          {/* Education */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Education</Text>
            {data.education?.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.eduInstitution}>{edu.institution}</Text>
                <Text style={styles.eduDetail}>
                  {edu.degree} in {edu.field}
                </Text>
                <Text style={styles.eduDetail}>{edu.graduation_date}</Text>
              </View>
            ))}
          </View>

          {/* Certifications */}
          {data.certifications?.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Certifications</Text>
              {data.certifications.map((c, i) => (
                <Text key={i} style={styles.skillItem}>
                  {c}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Summary */}
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>

          {/* Experience */}
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Experience</Text>
            {data.experience?.map((exp, i) => (
              <View key={i} style={styles.expBlock}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.title}</Text>
                  <Text style={styles.expDate}>
                    {exp.start_date} — {exp.end_date}
                  </Text>
                </View>
                <Text style={styles.expCompany}>
                  {exp.company} | {exp.location}
                </Text>
                {exp.bullets?.map((b, j) => (
                  <Text key={j} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </View>
        {watermark && <WatermarkOverlay />}
      </Page>
    </Document>
  )
}

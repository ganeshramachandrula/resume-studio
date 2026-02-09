'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ResumeData } from '@/types/documents'
import { WatermarkOverlay } from '../watermark-overlay'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 48,
    color: '#111827',
  },
  name: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
    color: '#111827',
  },
  title: {
    fontSize: 12,
    color: '#1A56DB',
    marginBottom: 8,
  },
  contactLine: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    color: '#6B7280',
    marginBottom: 10,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.6,
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
  },
  expDate: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  expCompany: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 2,
    paddingLeft: 10,
  },
  expBlock: {
    marginBottom: 12,
  },
  skillsText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#374151',
  },
  eduBlock: {
    marginBottom: 6,
  },
  eduName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  eduDetail: {
    fontSize: 9,
    color: '#6B7280',
  },
})

export function MinimalTemplate({ data, watermark }: { data: ResumeData; watermark?: boolean }) {
  const contactParts = [
    data.header.email,
    data.header.phone,
    data.header.location,
  ].filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.header.name}</Text>
        <Text style={styles.title}>{data.header.title}</Text>
        <Text style={styles.contactLine}>{contactParts.join('  /  ')}</Text>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.summary}>{data.summary}</Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience?.map((exp, i) => (
            <View key={i} style={styles.expBlock}>
              <View style={styles.expHeader}>
                <Text style={styles.expTitle}>
                  {exp.title} at {exp.company}
                </Text>
                <Text style={styles.expDate}>
                  {exp.start_date} — {exp.end_date}
                </Text>
              </View>
              <Text style={styles.expCompany}>{exp.location}</Text>
              {exp.bullets?.map((b, j) => (
                <Text key={j} style={styles.bullet}>
                  — {b}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.skillsText}>
            {[
              ...(data.skills?.technical || []),
              ...(data.skills?.tools || []),
            ].join('  ·  ')}
          </Text>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education?.map((edu, i) => (
            <View key={i} style={styles.eduBlock}>
              <Text style={styles.eduName}>
                {edu.degree} in {edu.field}
              </Text>
              <Text style={styles.eduDetail}>
                {edu.institution}  ·  {edu.graduation_date}
              </Text>
            </View>
          ))}
        </View>

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Text style={styles.skillsText}>
              {data.certifications.join('  ·  ')}
            </Text>
          </View>
        )}
        {watermark && <WatermarkOverlay />}
      </Page>
    </Document>
  )
}

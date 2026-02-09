'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ResumeData } from '@/types/documents'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Times-Roman',
    fontSize: 10,
    padding: 40,
    color: '#111827',
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
    paddingBottom: 12,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Times-Bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 9,
    color: '#6B7280',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 3,
  },
  summary: {
    fontSize: 10,
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
    fontFamily: 'Times-Bold',
  },
  expDate: {
    fontSize: 9,
    color: '#6B7280',
    fontFamily: 'Times-Italic',
  },
  expCompany: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#374151',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#374151',
    marginBottom: 2,
    paddingLeft: 12,
  },
  expBlock: {
    marginBottom: 10,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  skillLabel: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    width: 80,
  },
  skillValue: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
  },
  eduBlock: {
    marginBottom: 6,
  },
  eduName: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
  },
  eduDetail: {
    fontSize: 9,
    color: '#374151',
    fontFamily: 'Times-Italic',
  },
})

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const contactParts = [
    data.header.email,
    data.header.phone,
    data.header.location,
    data.header.linkedin,
  ].filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.header.name}</Text>
          <Text style={styles.title}>{data.header.title}</Text>
          <Text style={styles.contactLine}>{contactParts.join(' | ')}</Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{data.summary}</Text>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.experience?.map((exp, i) => (
            <View key={i} style={styles.expBlock}>
              <View style={styles.expHeader}>
                <Text style={styles.expTitle}>{exp.title}</Text>
                <Text style={styles.expDate}>
                  {exp.start_date} — {exp.end_date}
                </Text>
              </View>
              <Text style={styles.expCompany}>
                {exp.company}, {exp.location}
              </Text>
              {exp.bullets?.map((b, j) => (
                <Text key={j} style={styles.bullet}>
                  • {b}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education?.map((edu, i) => (
            <View key={i} style={styles.eduBlock}>
              <Text style={styles.eduName}>{edu.institution}</Text>
              <Text style={styles.eduDetail}>
                {edu.degree} in {edu.field}, {edu.graduation_date}
                {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {data.skills?.technical?.length > 0 && (
            <View style={styles.skillRow}>
              <Text style={styles.skillLabel}>Technical:</Text>
              <Text style={styles.skillValue}>
                {data.skills.technical.join(', ')}
              </Text>
            </View>
          )}
          {data.skills?.tools?.length > 0 && (
            <View style={styles.skillRow}>
              <Text style={styles.skillLabel}>Tools:</Text>
              <Text style={styles.skillValue}>
                {data.skills.tools.join(', ')}
              </Text>
            </View>
          )}
          {data.skills?.soft?.length > 0 && (
            <View style={styles.skillRow}>
              <Text style={styles.skillLabel}>Soft Skills:</Text>
              <Text style={styles.skillValue}>
                {data.skills.soft.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((c, i) => (
              <Text key={i} style={styles.bullet}>
                • {c}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}

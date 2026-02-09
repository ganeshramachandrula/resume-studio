'use client'

import { View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  watermarkText: {
    fontSize: 40,
    color: '#9CA3AF',
    opacity: 0.15,
    transform: 'rotate(-45deg)',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
})

export function WatermarkOverlay() {
  return (
    <View style={styles.watermarkContainer}>
      <Text style={styles.watermarkText}>RESUME STUDIO</Text>
      <Text style={[styles.watermarkText, { fontSize: 24, marginTop: -10 }]}>FREE PREVIEW</Text>
    </View>
  )
}

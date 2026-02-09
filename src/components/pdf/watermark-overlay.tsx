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
  },
  watermarkText: {
    fontSize: 52,
    color: '#000000',
    opacity: 0.07,
    transform: 'rotate(-45deg)',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 4,
  },
  watermarkSubText: {
    fontSize: 28,
    color: '#000000',
    opacity: 0.07,
    transform: 'rotate(-45deg)',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 4,
  },
})

export function WatermarkOverlay() {
  return (
    <View style={styles.watermarkContainer} fixed>
      <Text style={styles.watermarkText}>RESUME STUDIO</Text>
      <Text style={styles.watermarkSubText}>FREE PREVIEW</Text>
    </View>
  )
}

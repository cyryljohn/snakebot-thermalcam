import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeatIndicatorProps {
  presence: boolean;
  hotPixels: number;
  maxTemp: number;
  ambientTemp: number;
}

export function HeatIndicator({ presence, hotPixels, maxTemp, ambientTemp }: HeatIndicatorProps) {
  return (
    <View style={[styles.container, presence && styles.containerActive]}>
      <View style={styles.header}>
        <View style={[styles.indicator, presence ? styles.indicatorActive : styles.indicatorInactive]} />
        <Text style={[styles.title, presence && styles.titleActive]}>
          {presence ? 'PRESENCE DETECTED' : 'No Presence'}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{hotPixels}</Text>
          <Text style={styles.statLabel}>Hot Pixels</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{maxTemp.toFixed(1)}°</Text>
          <Text style={styles.statLabel}>Max Temp</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{ambientTemp.toFixed(1)}°</Text>
          <Text style={styles.statLabel}>Ambient</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    margin: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  containerActive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#f44336',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  indicatorActive: {
    backgroundColor: '#f44336',
  },
  indicatorInactive: {
    backgroundColor: '#9E9E9E',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  titleActive: {
    color: '#f44336',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

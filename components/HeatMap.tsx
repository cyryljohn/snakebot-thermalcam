import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeatMapProps {
  pixels: number[];
  ambientTemp: number;
}

// Convert temperature to color (blue = cold, red = hot)
function tempToColor(temp: number, minTemp: number, maxTemp: number): string {
  const range = maxTemp - minTemp;
  if (range === 0) return '#808080';

  const normalized = Math.max(0, Math.min(1, (temp - minTemp) / range));

  // Color gradient: blue -> cyan -> green -> yellow -> red
  let r: number, g: number, b: number;

  if (normalized < 0.25) {
    // Blue to Cyan
    const t = normalized / 0.25;
    r = 0;
    g = Math.round(255 * t);
    b = 255;
  } else if (normalized < 0.5) {
    // Cyan to Green
    const t = (normalized - 0.25) / 0.25;
    r = 0;
    g = 255;
    b = Math.round(255 * (1 - t));
  } else if (normalized < 0.75) {
    // Green to Yellow
    const t = (normalized - 0.5) / 0.25;
    r = Math.round(255 * t);
    g = 255;
    b = 0;
  } else {
    // Yellow to Red
    const t = (normalized - 0.75) / 0.25;
    r = 255;
    g = Math.round(255 * (1 - t));
    b = 0;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

export function HeatMap({ pixels, ambientTemp }: HeatMapProps) {
  if (!pixels || pixels.length !== 64) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Thermal View (8x8)</Text>
        <View style={styles.noData}>
          <Text style={styles.noDataText}>No sensor data</Text>
        </View>
      </View>
    );
  }

  const minTemp = Math.min(...pixels);
  const maxTemp = Math.max(...pixels);

  // Create 8x8 grid
  const rows: number[][] = [];
  for (let i = 0; i < 8; i++) {
    rows.push(pixels.slice(i * 8, (i + 1) * 8));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thermal View (8x8)</Text>

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((temp, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.cell,
                  { backgroundColor: tempToColor(temp, minTemp, maxTemp) },
                ]}
              >
                <Text style={styles.cellText}>{temp.toFixed(0)}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#0000FF' }]} />
          <Text style={styles.legendText}>{minTemp.toFixed(1)}°C</Text>
        </View>
        <Text style={styles.legendArrow}>→</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF0000' }]} />
          <Text style={styles.legendText}>{maxTemp.toFixed(1)}°C</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  grid: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 36,
    height: 36,
    margin: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  noData: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
  },
  legendArrow: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 12,
  },
});

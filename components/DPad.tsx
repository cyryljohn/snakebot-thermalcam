import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Direction } from '../utils/protocol';

interface DPadProps {
  onPressIn: (direction: Direction) => void;
  onPressOut: () => void;
  disabled?: boolean;
}

export function DPad({ onPressIn, onPressOut, disabled = false }: DPadProps) {
  return (
    <View style={styles.container}>
      {/* Top row - Forward */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPressIn={() => onPressIn('forward')}
          onPressOut={onPressOut}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.arrow}>▲</Text>
        </TouchableOpacity>
      </View>

      {/* Middle row - Left, Stop, Right */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPressIn={() => onPressIn('left')}
          onPressOut={onPressOut}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.arrow}>◀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopButton, disabled && styles.buttonDisabled]}
          onPress={onPressOut}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.stopText}>STOP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPressIn={() => onPressIn('right')}
          onPressOut={onPressOut}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.arrow}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom row - Backward */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPressIn={() => onPressIn('backward')}
          onPressOut={onPressOut}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
    elevation: 0,
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  arrow: {
    fontSize: 32,
    color: 'white',
  },
  stopText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});

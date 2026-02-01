import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface SpeedSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export function SpeedSlider({ value, onValueChange, disabled = false }: SpeedSliderProps) {
  const percentage = Math.round((value / 255) * 100);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        Speed: {percentage}%
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={50}
        maximumValue={255}
        step={5}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={disabled ? '#BDBDBD' : '#4CAF50'}
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor={disabled ? '#9E9E9E' : '#4CAF50'}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  labelDisabled: {
    color: '#9E9E9E',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

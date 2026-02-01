import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionStatus as Status } from '../hooks/useWebSocket';

interface ConnectionStatusProps {
  status: Status;
  ipAddress?: string;
}

const statusColors: Record<Status, string> = {
  disconnected: '#9E9E9E',
  connecting: '#FFC107',
  connected: '#4CAF50',
  error: '#f44336',
};

const statusLabels: Record<Status, string> = {
  disconnected: 'Disconnected',
  connecting: 'Connecting...',
  connected: 'Connected',
  error: 'Error',
};

export function ConnectionStatus({ status, ipAddress }: ConnectionStatusProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: statusColors[status] }]} />
      <Text style={styles.text}>
        {statusLabels[status]}
        {status === 'connected' && ipAddress && ` (${ipAddress})`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

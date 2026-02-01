import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useWebSocket } from './hooks/useWebSocket';
import { DPad } from './components/DPad';
import { ConnectionStatus } from './components/ConnectionStatus';
import { SpeedSlider } from './components/SpeedSlider';
import { HeatIndicator } from './components/HeatIndicator';
import { HeatMap } from './components/HeatMap';
import { DebugPanel } from './components/DebugPanel';
import { createMoveCommand, createStopCommand, Direction } from './utils/protocol';

export default function App() {
  const [ipAddress, setIpAddress] = useState('192.168.4.1');
  const [speed, setSpeed] = useState(200);

  const { status, robotStatus, connect, disconnect, sendCommand, error, logs, clearLogs } = useWebSocket();

  const isConnected = status === 'connected';

  const handleConnect = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect(ipAddress);
    }
  }, [isConnected, ipAddress, connect, disconnect]);

  const handleDirectionPress = useCallback((direction: Direction) => {
    sendCommand(createMoveCommand(direction, speed));
  }, [sendCommand, speed]);

  const handleDirectionRelease = useCallback(() => {
    sendCommand(createStopCommand());
  }, [sendCommand]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Snake Bot Controller</Text>

          {/* Connection Section */}
          <View style={styles.connectionSection}>
            <ConnectionStatus status={status} ipAddress={isConnected ? ipAddress : undefined} />

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, isConnected && styles.inputDisabled]}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="ESP32 IP Address"
                keyboardType="numeric"
                editable={!isConnected}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.connectButton, isConnected && styles.disconnectButton]}
                onPress={handleConnect}
                activeOpacity={0.7}
              >
                <Text style={styles.connectButtonText}>
                  {status === 'connecting' ? '...' : isConnected ? 'Disconnect' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Heat Detection Status */}
          {robotStatus && (
            <HeatIndicator
              presence={robotStatus.presence}
              hotPixels={robotStatus.hotPixels}
              maxTemp={robotStatus.maxTemp}
              ambientTemp={robotStatus.ambientTemp}
            />
          )}

          {/* Thermal Camera View */}
          {robotStatus && robotStatus.pixels && (
            <HeatMap
              pixels={robotStatus.pixels}
              ambientTemp={robotStatus.ambientTemp}
            />
          )}

          {/* Speed Control */}
          <SpeedSlider
            value={speed}
            onValueChange={setSpeed}
            disabled={!isConnected}
          />

          {/* D-Pad Controls */}
          <View style={styles.controlSection}>
            <DPad
              onPressIn={handleDirectionPress}
              onPressOut={handleDirectionRelease}
              disabled={!isConnected}
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>Quick Start:</Text>
            <Text style={styles.instructionText}>1. Connect phone to "SnakeBot" WiFi</Text>
            <Text style={styles.instructionText}>2. Default password: snakebot123</Text>
            <Text style={styles.instructionText}>3. Press Connect (IP: 192.168.4.1)</Text>
            <Text style={styles.instructionText}>4. Use D-Pad to control the robot</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Debug Panel - Floating Button */}
      <DebugPanel logs={logs} onClear={clearLogs} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  connectionSection: {
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  controlSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  instructions: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginTop: 10,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});

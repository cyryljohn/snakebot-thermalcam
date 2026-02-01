import { useState, useEffect, useRef, useCallback } from 'react';
import { RobotStatus, Command, ServerMessage } from '../utils/protocol';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface UseWebSocketReturn {
  status: ConnectionStatus;
  robotStatus: RobotStatus | null;
  connect: (ip: string, port?: number) => void;
  disconnect: () => void;
  sendCommand: (command: Command) => void;
  error: string | null;
  logs: string[];
  clearLogs: () => void;
}

const getTimestamp = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
};

export function useWebSocket(): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [robotStatus, setRobotStatus] = useState<RobotStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((message: string, type: 'INFO' | 'ERROR' | 'SUCCESS' | 'WARN' = 'INFO') => {
    const logEntry = `[${getTimestamp()}] ${type}: ${message}`;
    setLogs(prev => [...prev.slice(-99), logEntry]); // Keep last 100 logs
    console.log(logEntry);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback((ip: string, port: number = 81) => {
    cleanup();
    setStatus('connecting');
    setError(null);

    const wsUrl = `ws://${ip}:${port}`;
    addLog(`Attempting connection to ${wsUrl}`, 'INFO');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      addLog('WebSocket object created', 'INFO');

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          addLog('Connection timeout after 10s', 'ERROR');
          ws.close();
          setStatus('error');
          setError('Connection timeout');
        }
      }, 10000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        addLog('WebSocket connected successfully!', 'SUCCESS');
        setStatus('connected');
        setError(null);

        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
            addLog('Ping sent', 'INFO');
          }
        }, 5000);
      };

      ws.onmessage = (event) => {
        try {
          const data: ServerMessage = JSON.parse(event.data);

          if (data.type === 'status') {
            setRobotStatus(data);
            // Don't log every status update to avoid spam
          } else if (data.type === 'error') {
            addLog(`Robot error: ${data.message}`, 'ERROR');
            setError(data.message);
          } else if (data.type === 'pong') {
            addLog('Pong received', 'INFO');
          }
        } catch (e) {
          addLog(`Failed to parse message: ${e}`, 'ERROR');
        }
      };

      ws.onerror = (event) => {
        clearTimeout(connectionTimeout);
        const errorMsg = `WebSocket error occurred. ReadyState: ${ws.readyState}`;
        addLog(errorMsg, 'ERROR');
        addLog('Possible causes: 1) Not connected to SnakeBot WiFi, 2) ESP32 not running, 3) Wrong IP', 'WARN');
        setError('Connection error - check debug logs');
        setStatus('error');
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        addLog(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`, 'WARN');

        // Decode common close codes
        if (event.code === 1006) {
          addLog('Code 1006: Abnormal closure - connection failed or was interrupted', 'ERROR');
        } else if (event.code === 1000) {
          addLog('Code 1000: Normal closure', 'INFO');
        }

        setStatus('disconnected');
        setRobotStatus(null);
        cleanup();
      };

    } catch (e) {
      addLog(`Exception creating WebSocket: ${e}`, 'ERROR');
      setStatus('error');
      setError(`Failed to create connection: ${e}`);
    }
  }, [cleanup, addLog]);

  const disconnect = useCallback(() => {
    addLog('Disconnecting...', 'INFO');
    cleanup();
    setStatus('disconnected');
    setRobotStatus(null);
    setError(null);
    addLog('Disconnected', 'INFO');
  }, [cleanup, addLog]);

  const sendCommand = useCallback((command: Command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command));
      if (command.type !== 'ping') {
        addLog(`Sent: ${JSON.stringify(command)}`, 'INFO');
      }
    } else {
      addLog(`Cannot send command - WebSocket not open. State: ${wsRef.current?.readyState}`, 'ERROR');
    }
  }, [addLog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    status,
    robotStatus,
    connect,
    disconnect,
    sendCommand,
    error,
    logs,
    clearLogs,
  };
}

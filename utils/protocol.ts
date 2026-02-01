export type Direction = 'forward' | 'backward' | 'left' | 'right' | 'stop';

export interface MoveCommand {
  type: 'move';
  direction: Direction;
  speed?: number;
}

export interface StopCommand {
  type: 'stop';
}

export interface PingCommand {
  type: 'ping';
}

export type Command = MoveCommand | StopCommand | PingCommand;

export interface RobotStatus {
  type: 'status';
  connected: boolean;
  motorA: number;
  motorB: number;
  presence: boolean;
  hotPixels: number;
  maxTemp: number;
  ambientTemp: number;
  pixels: number[];  // 64 temperature values (8x8 grid)
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export interface PongMessage {
  type: 'pong';
}

export type ServerMessage = RobotStatus | ErrorMessage | PongMessage;

export const createMoveCommand = (direction: Direction, speed?: number): MoveCommand => ({
  type: 'move',
  direction,
  ...(speed !== undefined && { speed }),
});

export const createStopCommand = (): StopCommand => ({
  type: 'stop',
});

export const createPingCommand = (): PingCommand => ({
  type: 'ping',
});

#ifndef CONFIG_H
#define CONFIG_H

// ========== WiFi Configuration ==========
#define WIFI_SSID "SnakeBot"
#define WIFI_PASSWORD "snakebot123"  // Minimum 8 characters

// ========== WebSocket Configuration ==========
#define WEBSOCKET_PORT 81

// ========== Motor A (Left) Pins - L298N ==========
#define MOTOR_A_EN 5     // PWM pin for speed control (ENA) - D5
#define MOTOR_A_IN1 17   // Direction pin 1 (IN1) - D17
#define MOTOR_A_IN2 16   // Direction pin 2 (IN2) - D16

// ========== Motor B (Right) Pins - L298N ==========
#define MOTOR_B_EN 2     // PWM pin for speed control (ENB) - D2
#define MOTOR_B_IN1 4    // Direction pin 1 (IN3) - D4
#define MOTOR_B_IN2 15   // Direction pin 2 (IN4) - D15

// ========== PWM Configuration ==========
#define PWM_FREQUENCY 30000
#define PWM_RESOLUTION 8
#define PWM_CHANNEL_A 0
#define PWM_CHANNEL_B 1

// ========== Motor Defaults ==========
#define DEFAULT_SPEED 200  // 0-255

// ========== AMG8833 Heat Sensor ==========
#define HEAT_TEMP_THRESHOLD 6.0   // Degrees above ambient to detect presence
#define HEAT_MIN_HOT_PIXELS 3     // Minimum hot pixels to confirm presence

// ========== Status LED ==========
// Note: GPIO2 is now used for motor, using GPIO13 for LED (or disable if not wired)
#define LED_PIN 13  // Change to any free GPIO, or -1 to disable

// ========== Safety ==========
#define COMMAND_TIMEOUT_MS 1000   // Auto-stop if no command received

#endif

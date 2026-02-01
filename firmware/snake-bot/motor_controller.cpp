#include "motor_controller.h"
#include "config.h"

MotorController::MotorController(uint8_t enPin, uint8_t in1Pin, uint8_t in2Pin, uint8_t pwmChannel)
    : _enPin(enPin),
      _in1Pin(in1Pin),
      _in2Pin(in2Pin),
      _pwmChannel(pwmChannel),
      _currentSpeed(0),
      _movingForward(true) {}

void MotorController::begin() {
    pinMode(_in1Pin, OUTPUT);
    pinMode(_in2Pin, OUTPUT);

    // Configure PWM for speed control (ESP32 Core 3.x API)
    // ledcAttach combines the old ledcSetup + ledcAttachPin
    ledcAttach(_enPin, PWM_FREQUENCY, PWM_RESOLUTION);

    stop();
}

void MotorController::forward(uint8_t speed) {
    _currentSpeed = speed;
    _movingForward = true;
    digitalWrite(_in1Pin, HIGH);
    digitalWrite(_in2Pin, LOW);
    ledcWrite(_enPin, speed);  // Use pin instead of channel in Core 3.x
}

void MotorController::backward(uint8_t speed) {
    _currentSpeed = speed;
    _movingForward = false;
    digitalWrite(_in1Pin, LOW);
    digitalWrite(_in2Pin, HIGH);
    ledcWrite(_enPin, speed);  // Use pin instead of channel in Core 3.x
}

void MotorController::stop() {
    _currentSpeed = 0;
    digitalWrite(_in1Pin, LOW);
    digitalWrite(_in2Pin, LOW);
    ledcWrite(_enPin, 0);  // Use pin instead of channel in Core 3.x
}

uint8_t MotorController::getCurrentSpeed() {
    return _currentSpeed;
}

bool MotorController::isMovingForward() {
    return _movingForward;
}

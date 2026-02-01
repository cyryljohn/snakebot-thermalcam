#ifndef MOTOR_CONTROLLER_H
#define MOTOR_CONTROLLER_H

#include <Arduino.h>

class MotorController {
public:
    MotorController(uint8_t enPin, uint8_t in1Pin, uint8_t in2Pin, uint8_t pwmChannel);

    void begin();
    void forward(uint8_t speed);
    void backward(uint8_t speed);
    void stop();

    uint8_t getCurrentSpeed();
    bool isMovingForward();

private:
    uint8_t _enPin;
    uint8_t _in1Pin;
    uint8_t _in2Pin;
    uint8_t _pwmChannel;
    uint8_t _currentSpeed;
    bool _movingForward;
};

#endif

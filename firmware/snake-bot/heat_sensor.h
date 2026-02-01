#ifndef HEAT_SENSOR_H
#define HEAT_SENSOR_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_AMG88xx.h>

struct HeatStatus {
    bool presenceDetected;
    int hotPixelCount;
    float maxTemp;
    float ambientTemp;
};

class HeatSensor {
public:
    HeatSensor();

    bool begin();
    void calibrateAmbient();
    void update();

    HeatStatus getStatus();
    bool isPresenceDetected();
    int getHotPixelCount();
    float getMaxTemp();
    float getAmbientTemp();
    const float* getPixels();  // Returns pointer to 64-element pixel array (8x8 grid)

private:
    Adafruit_AMG88xx _amg;
    float _pixels[AMG88xx_PIXEL_ARRAY_SIZE];
    float _ambientTemp;
    bool _presenceDetected;
    int _hotPixelCount;
    float _maxTemp;
    float _tempThreshold;
    int _minHotPixels;
};

#endif

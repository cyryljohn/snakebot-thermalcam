#include "heat_sensor.h"
#include "config.h"

HeatSensor::HeatSensor()
    : _ambientTemp(0),
      _presenceDetected(false),
      _hotPixelCount(0),
      _maxTemp(0),
      _tempThreshold(HEAT_TEMP_THRESHOLD),
      _minHotPixels(HEAT_MIN_HOT_PIXELS) {}

bool HeatSensor::begin() {
    Wire.begin();

    if (!_amg.begin()) {
        Serial.println("Could not find AMG88xx sensor!");
        return false;
    }

    Serial.println("AMG8833 initialized!");
    delay(100);

    return true;
}

void HeatSensor::calibrateAmbient() {
    Serial.println("Calibrating ambient temperature...");
    Serial.println("Make sure no one is in front of the sensor!");

    delay(2000);

    float tempSum = 0;
    int samples = 10;

    for (int i = 0; i < samples; i++) {
        _amg.readPixels(_pixels);
        for (int j = 0; j < AMG88xx_PIXEL_ARRAY_SIZE; j++) {
            tempSum += _pixels[j];
        }
        delay(100);
    }

    _ambientTemp = tempSum / (AMG88xx_PIXEL_ARRAY_SIZE * samples);

    Serial.print("Ambient temperature calibrated: ");
    Serial.print(_ambientTemp);
    Serial.println(" C");
}

void HeatSensor::update() {
    _amg.readPixels(_pixels);

    _hotPixelCount = 0;
    _maxTemp = 0;

    for (int i = 0; i < AMG88xx_PIXEL_ARRAY_SIZE; i++) {
        if (_pixels[i] > (_ambientTemp + _tempThreshold)) {
            _hotPixelCount++;
            if (_pixels[i] > _maxTemp) {
                _maxTemp = _pixels[i];
            }
        }
    }

    bool wasDetected = _presenceDetected;
    _presenceDetected = (_hotPixelCount >= _minHotPixels);

    if (_presenceDetected && !wasDetected) {
        Serial.println(">>> PRESENCE DETECTED <<<");
    } else if (!_presenceDetected && wasDetected) {
        Serial.println(">>> PRESENCE CLEARED <<<");
    }
}

HeatStatus HeatSensor::getStatus() {
    HeatStatus status;
    status.presenceDetected = _presenceDetected;
    status.hotPixelCount = _hotPixelCount;
    status.maxTemp = _maxTemp;
    status.ambientTemp = _ambientTemp;
    return status;
}

bool HeatSensor::isPresenceDetected() {
    return _presenceDetected;
}

int HeatSensor::getHotPixelCount() {
    return _hotPixelCount;
}

float HeatSensor::getMaxTemp() {
    return _maxTemp;
}

float HeatSensor::getAmbientTemp() {
    return _ambientTemp;
}

const float* HeatSensor::getPixels() {
    return _pixels;
}

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

#include "config.h"
#include "motor_controller.h"
#include "heat_sensor.h"

// Motor instances
MotorController motorA(MOTOR_A_EN, MOTOR_A_IN1, MOTOR_A_IN2, PWM_CHANNEL_A);
MotorController motorB(MOTOR_B_EN, MOTOR_B_IN1, MOTOR_B_IN2, PWM_CHANNEL_B);

// Heat sensor instance
HeatSensor heatSensor;

// WebSocket server
WebSocketsServer webSocket = WebSocketsServer(WEBSOCKET_PORT);

// State
uint8_t currentSpeed = DEFAULT_SPEED;
unsigned long lastCommandTime = 0;
bool clientConnected = false;

void setup() {
    Serial.begin(115200);
    Serial.println("\n=== Snake Bot Starting ===");

    // Initialize LED
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    // Initialize motors
    Serial.println("Initializing motors...");
    motorA.begin();
    motorB.begin();

    // Initialize heat sensor
    Serial.println("Initializing heat sensor...");
    if (!heatSensor.begin()) {
        Serial.println("WARNING: Heat sensor not found, continuing without it");
    } else {
        heatSensor.calibrateAmbient();
    }

    // Setup WiFi Access Point
    Serial.println("Setting up WiFi Access Point...");
    WiFi.softAP(WIFI_SSID, WIFI_PASSWORD);

    IPAddress IP = WiFi.softAPIP();
    Serial.print("AP IP address: ");
    Serial.println(IP);
    Serial.print("SSID: ");
    Serial.println(WIFI_SSID);

    // Start WebSocket server
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);

    Serial.println("WebSocket server started on port 81");
    Serial.println("=== Snake Bot Ready ===\n");
}

void loop() {
    webSocket.loop();

    // Update heat sensor
    static unsigned long lastHeatUpdate = 0;
    if (millis() - lastHeatUpdate > 200) {
        lastHeatUpdate = millis();
        heatSensor.update();

        // Update LED based on presence
        digitalWrite(LED_PIN, heatSensor.isPresenceDetected() ? HIGH : LOW);
    }

    // Safety: stop motors if no command received recently
    if (clientConnected && (millis() - lastCommandTime > COMMAND_TIMEOUT_MS)) {
        motorA.stop();
        motorB.stop();
    }

    // Send periodic status to connected clients
    static unsigned long lastStatusSend = 0;
    if (clientConnected && (millis() - lastStatusSend > 500)) {
        lastStatusSend = millis();
        broadcastStatus();
    }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            clientConnected = false;
            // Safety: stop motors when client disconnects
            motorA.stop();
            motorB.stop();
            break;

        case WStype_CONNECTED: {
            IPAddress ip = webSocket.remoteIP(num);
            Serial.printf("[%u] Connected from %s\n", num, ip.toString().c_str());
            clientConnected = true;
            lastCommandTime = millis();
            sendStatus(num);
            break;
        }

        case WStype_TEXT:
            handleCommand(num, payload, length);
            break;
    }
}

void handleCommand(uint8_t num, uint8_t* payload, size_t length) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        sendError(num, "Invalid JSON");
        Serial.println("JSON parse error");
        return;
    }

    const char* type = doc["type"];
    lastCommandTime = millis();

    if (strcmp(type, "move") == 0) {
        const char* direction = doc["direction"];
        uint8_t speed = doc["speed"] | currentSpeed;
        currentSpeed = speed;

        Serial.printf("Move: %s at speed %d\n", direction, speed);

        if (strcmp(direction, "forward") == 0) {
            motorA.forward(speed);
            motorB.forward(speed);
        } else if (strcmp(direction, "backward") == 0) {
            motorA.backward(speed);
            motorB.backward(speed);
        } else if (strcmp(direction, "left") == 0) {
            motorA.forward(speed);
            motorB.backward(speed);
        } else if (strcmp(direction, "right") == 0) {
            motorA.backward(speed);
            motorB.forward(speed);
        } else if (strcmp(direction, "stop") == 0) {
            motorA.stop();
            motorB.stop();
        }

    } else if (strcmp(type, "stop") == 0) {
        Serial.println("Stop command received");
        motorA.stop();
        motorB.stop();

    } else if (strcmp(type, "ping") == 0) {
        webSocket.sendTXT(num, "{\"type\":\"pong\"}");
        return;  // Don't send status for ping
    }

    sendStatus(num);
}

void sendStatus(uint8_t num) {
    StaticJsonDocument<1536> doc;
    doc["type"] = "status";
    doc["connected"] = true;
    doc["motorA"] = motorA.getCurrentSpeed();
    doc["motorB"] = motorB.getCurrentSpeed();

    HeatStatus heat = heatSensor.getStatus();
    doc["presence"] = heat.presenceDetected;
    doc["hotPixels"] = heat.hotPixelCount;
    doc["maxTemp"] = heat.maxTemp;
    doc["ambientTemp"] = heat.ambientTemp;

    // Add 8x8 pixel array (64 temperature values)
    JsonArray pixels = doc.createNestedArray("pixels");
    const float* pixelData = heatSensor.getPixels();
    for (int i = 0; i < 64; i++) {
        pixels.add(round(pixelData[i] * 10) / 10.0);  // 1 decimal place
    }

    String output;
    serializeJson(doc, output);
    webSocket.sendTXT(num, output);
}

void broadcastStatus() {
    StaticJsonDocument<1536> doc;
    doc["type"] = "status";
    doc["connected"] = true;
    doc["motorA"] = motorA.getCurrentSpeed();
    doc["motorB"] = motorB.getCurrentSpeed();

    HeatStatus heat = heatSensor.getStatus();
    doc["presence"] = heat.presenceDetected;
    doc["hotPixels"] = heat.hotPixelCount;
    doc["maxTemp"] = heat.maxTemp;
    doc["ambientTemp"] = heat.ambientTemp;

    // Add 8x8 pixel array (64 temperature values)
    JsonArray pixels = doc.createNestedArray("pixels");
    const float* pixelData = heatSensor.getPixels();
    for (int i = 0; i < 64; i++) {
        pixels.add(round(pixelData[i] * 10) / 10.0);  // 1 decimal place
    }

    String output;
    serializeJson(doc, output);
    webSocket.broadcastTXT(output);
}

void sendError(uint8_t num, const char* message) {
    StaticJsonDocument<128> doc;
    doc["type"] = "error";
    doc["message"] = message;

    String output;
    serializeJson(doc, output);
    webSocket.sendTXT(num, output);
}

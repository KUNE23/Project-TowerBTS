#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define TEMP_PIN 4
#define DOOR_PIN 32
#define CABLE_PIN 33
#define LED_CONNECTED 25
#define LED_CUT 26

const char* WIFI_SSID = "Sabyan";
const char* WIFI_PASSWORD = "Berlian23";

const char* API_URL = "http://192.168.1.16:5000/api/sensor-logs";
const char* DEVICE_API_KEY = "btsense_device_secret";
const char* DEVICE_CODE = "BTS-DEMO-001";

OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000;

String getTemperatureStatus(float temperature) {
  if (temperature >= 50) return "critical";
  if (temperature >= 40) return "warning";
  return "normal";
}

String getOverallStatus(String temperatureStatus, String fanStatus, String cableStatus, String doorStatus) {
  if (temperatureStatus == "critical" || cableStatus == "cut") return "critical";
  if (temperatureStatus == "warning" || doorStatus == "open") return "warning";
  return "normal";
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi");

  unsigned long startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 15000) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection failed");
  }
}

float readTemperature() {
  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);

  if (temperature == DEVICE_DISCONNECTED_C || temperature < -50 || temperature > 125) {
    return 0;
  }

  return temperature;
}

void updateCableLed(String cableStatus) {
  if (cableStatus == "connected") {
    digitalWrite(LED_CONNECTED, HIGH);
    digitalWrite(LED_CUT, LOW);
  } else {
    digitalWrite(LED_CONNECTED, LOW);
    digitalWrite(LED_CUT, HIGH);
  }
}

void printSensorData(
  float temperature,
  String temperatureStatus,
  String fanStatus,
  int fanRpm,
  String cableStatus,
  String doorStatus,
  String overallStatus
) {
  Serial.print("Temp: ");
  Serial.print(temperature);
  Serial.print(" C | Temp Status: ");
  Serial.print(temperatureStatus);
  Serial.print(" | Fan: ");
  Serial.print(fanStatus);
  Serial.print(" | RPM: ");
  Serial.print(fanRpm);
  Serial.print(" | Cable: ");
  Serial.print(cableStatus);
  Serial.print(" | Door: ");
  Serial.print(doorStatus);
  Serial.print(" | Overall: ");
  Serial.println(overallStatus);
}

void sendToBackend(
  float temperature,
  String temperatureStatus,
  String fanStatus,
  int fanRpm,
  String cableStatus,
  String doorStatus,
  String overallStatus
) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  StaticJsonDocument<512> doc;

  doc["device_code"] = DEVICE_CODE;
  doc["temperature"] = temperature;
  doc["temperature_status"] = temperatureStatus;
  doc["fan_status"] = fanStatus;
  doc["fan_rpm"] = fanRpm;
  doc["cable_status"] = cableStatus;
  doc["door_status"] = doorStatus;
  doc["overall_status"] = overallStatus;

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-api-key", DEVICE_API_KEY);

  int responseCode = http.POST(payload);
  String responseBody = responseCode > 0 ? http.getString() : "";

  Serial.println("================================");
  Serial.println(payload);
  Serial.print("HTTP Response: ");
  Serial.println(responseCode);

  if (responseBody.length() > 0) {
    Serial.println(responseBody);
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  sensors.begin();

  pinMode(DOOR_PIN, INPUT_PULLUP);
  pinMode(CABLE_PIN, INPUT_PULLUP);

  pinMode(LED_CONNECTED, OUTPUT);
  pinMode(LED_CUT, OUTPUT);

  digitalWrite(LED_CONNECTED, LOW);
  digitalWrite(LED_CUT, LOW);

  connectWiFi();

  Serial.println("BTSense started without relay");
}

void loop() {
  float temperature = readTemperature();
  String temperatureStatus = getTemperatureStatus(temperature);

  int doorRead = digitalRead(DOOR_PIN);
  String doorStatus = doorRead == LOW ? "closed" : "open";

  int cableRead = digitalRead(CABLE_PIN);
  String cableStatus = cableRead == LOW ? "connected" : "cut";

  updateCableLed(cableStatus);

  String fanStatus = "running";
  int fanRpm = 0;

  String overallStatus = getOverallStatus(temperatureStatus, fanStatus, cableStatus, doorStatus);

  printSensorData(
    temperature,
    temperatureStatus,
    fanStatus,
    fanRpm,
    cableStatus,
    doorStatus,
    overallStatus
  );

  unsigned long now = millis();

  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    sendToBackend(
      temperature,
      temperatureStatus,
      fanStatus,
      fanRpm,
      cableStatus,
      doorStatus,
      overallStatus
    );
  }

  delay(500);
}
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <MAX30100_PulseOximeter.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// =========================
// WIFI
// =========================
const char* ssid = "VITC-TECHNO";
const char* password = "Med@15&16#";

const char* SERVER_URL =
  "http://172.16.131.118:8000/sensor";

// Send data every 3 seconds
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 3000;

// =========================
// OLED
// =========================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// =========================
// PINS
// =========================
#define ECG_PIN 34

// =========================
// MAX30100
// =========================
PulseOximeter pox;

float heartRate = 0;
float spo2 = 0;

// =========================
// USER INPUTS
// =========================
int pain = 0;
int fatigue = 0;
int stress = 0;
int flow = 0;

// =========================
// EWE SCORES
// =========================
int painScore = 0;
int stressScore = 0;
int anemiaRisk = 0;

// =========================
// DISPLAY
// =========================
int page = 0;
unsigned long lastPageChange = 0;
const unsigned long PAGE_TIME = 4000;

// =========================
// SETUP
// =========================
void setup() {

  Serial.begin(115200);

  Wire.begin(21, 22);

  // =========================
  // OLED
  // =========================
  if (!display.begin(
        SSD1306_SWITCHCAPVCC,
        OLED_ADDR)) {

    Serial.println("OLED FAILED");

    while (1);
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  display.setTextSize(2);
  display.setCursor(10, 10);
  display.println("PERIO");

  display.setTextSize(1);
  display.setCursor(20, 38);
  display.println("System Ready");

  display.display();

  delay(2000);

  // =========================
  // MAX30100
  // =========================
  Serial.println("Starting MAX30100...");

  if (!pox.begin()) {

    Serial.println("MAX30100 FAILED");

  } else {

    Serial.println("MAX30100 SUCCESS!");
  }

  // =========================
  // WIFI
  // =========================
  Serial.println();
  Serial.println("Connecting to WiFi...");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected!");

  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  Serial.print("Server: ");
  Serial.println(SERVER_URL);

  // =========================
  // USER INPUT
  // =========================
  Serial.println();
  Serial.println("================================");
  Serial.println("        PERIO INPUT SYSTEM");
  Serial.println("================================");

  Serial.println("Enter values from 0 to 10.");
  Serial.println();

  Serial.print("Pain (0-10): ");
  pain = readNumber();

  Serial.print("Fatigue (0-10): ");
  fatigue = readNumber();

  Serial.print("Stress (0-10): ");
  stress = readNumber();

  Serial.print("Flow (0-10): ");
  flow = readNumber();

  calculateScores();

  Serial.println();
  Serial.println("================================");
  Serial.println("        PERIO RESULTS");
  Serial.println("================================");

  Serial.print("Pain Score: ");
  Serial.println(painScore);

  Serial.print("Stress Score: ");
  Serial.println(stressScore);

  Serial.print("Risk Indicator: ");
  Serial.println(anemiaRisk);

  Serial.println();
  Serial.println("Starting personalized monitoring...");
}

// =========================
// LOOP
// =========================
void loop() {

  pox.update();

  // Read ECG
  int ecgValue = analogRead(ECG_PIN);

  // =========================
  // SEND DATA TO SERVER
  // =========================
  if (millis() - lastSend >= SEND_INTERVAL) {

    sendSensorData();

    lastSend = millis();
  }

  // =========================
  // OLED PAGE
  // =========================
  if (millis() - lastPageChange >= PAGE_TIME) {

    page++;

    if (page > 3) {
      page = 0;
    }

    lastPageChange = millis();
  }

  showPage(page);

  delay(50);
}

// =========================
// READ USER NUMBER
// =========================
int readNumber() {

  while (Serial.available() == 0) {

    pox.update();

    delay(10);
  }

  int value = Serial.parseInt();

  while (Serial.available()) {
    Serial.read();
  }

  value = constrain(value, 0, 10);

  Serial.println(value);

  return value;
}

// =========================
// CALCULATE EWE
// =========================
void calculateScores() {

  // Prototype/demo weights

  painScore =
    pain * 10;

  stressScore =
    stress * 7 +
    pain * 2 +
    fatigue;

  anemiaRisk =
    fatigue * 6 +
    flow * 3 +
    stress;

  painScore =
    constrain(painScore, 0, 100);

  stressScore =
    constrain(stressScore, 0, 100);

  anemiaRisk =
    constrain(anemiaRisk, 0, 100);
}

// =========================
// SEND SENSOR DATA
// =========================
void sendSensorData() {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi disconnected.");

    WiFi.begin(ssid, password);

    return;
  }

  HTTPClient http;

  http.begin(SERVER_URL);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  // Get current MAX30100 values
  float hr = pox.getHeartRate();
  float oxygen = pox.getSpO2();

  // Keep invalid readings as 0
  // instead of sending impossible values
  if (hr < 40 || hr > 200) {
    hr = 0;
  }

  if (oxygen < 70 || oxygen > 100) {
    oxygen = 0;
  }

  // Current ECG value
  int ecgValue =
    analogRead(ECG_PIN);

  // Create JSON
  String json = "{";

  json += "\"heartRate\":";
  json += String(hr, 1);

  json += ",\"spo2\":";
  json += String(oxygen, 1);

  json += ",\"ecg\":";
  json += String(ecgValue);

  json += ",\"pain\":";
  json += String(pain);

  json += ",\"fatigue\":";
  json += String(fatigue);

  json += ",\"stress\":";
  json += String(stress);

  json += ",\"flow\":";
  json += String(flow);

  json += ",\"painScore\":";
  json += String(painScore);

  json += ",\"stressScore\":";
  json += String(stressScore);

  json += ",\"anemiaRisk\":";
  json += String(anemiaRisk);

  json += "}";

  // Send POST request
  int httpResponseCode =
    http.POST(json);

  Serial.println();
  Serial.println("----- SERVER UPDATE -----");

  Serial.print("JSON: ");
  Serial.println(json);

  Serial.print("HTTP Response: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {

    Serial.println("Data sent successfully!");

  } else {

    Serial.println("Failed to send data.");
  }

  http.end();
}

// =========================
// DRAW HEADER
// =========================
void header(String title) {

  display.clearDisplay();

  display.setTextSize(1);
  display.setCursor(0, 0);

  display.println("PERIO | " + title);

  display.drawLine(
    0, 10,
    127, 10,
    SSD1306_WHITE
  );
}

// =========================
// PAGE 0
// SENSOR STATUS
// =========================
void showSensorPage() {

  header("SENSORS");

  float hr = pox.getHeartRate();
  float oxygen = pox.getSpO2();

  display.setTextSize(1);

  display.setCursor(0, 16);

  if (hr >= 40 && hr <= 200) {

    display.print("HR: ");
    display.print(hr, 0);
    display.println(" BPM");

  } else {

    display.println("HR: --");
  }

  display.setCursor(0, 28);

  if (oxygen >= 70 && oxygen <= 100) {

    display.print("SpO2: ");
    display.print(oxygen, 0);
    display.println("%");

  } else {

    display.println("SpO2: --");
  }

  int ecgValue =
    analogRead(ECG_PIN);

  display.setCursor(0, 40);

  display.print("ECG signal: ");
  display.println(ecgValue);

  display.setCursor(0, 54);
  display.println("Live physiological data");

  display.display();
}

// =========================
// PAGE 1
// EWE SCORES
// =========================
void showScorePage() {

  header("EWE SCORES");

  display.setTextSize(1);

  display.setCursor(0, 16);
  display.print("PAIN   : ");
  display.println(painScore);

  display.setCursor(0, 28);
  display.print("STRESS : ");
  display.println(stressScore);

  display.setCursor(0, 40);
  display.print("RISK   : ");
  display.println(anemiaRisk);

  display.setCursor(0, 54);
  display.println("Explainable prototype");

  display.display();
}

// =========================
// PAGE 2
// WHY SCORE
// =========================
void showWhyPage() {

  header("WHY?");

  display.setTextSize(1);

  display.setCursor(0, 15);
  display.print("Pain     : ");
  display.println(pain);

  display.setCursor(0, 27);
  display.print("Fatigue  : ");
  display.println(fatigue);

  display.setCursor(0, 39);
  display.print("Stress   : ");
  display.println(stress);

  display.setCursor(0, 51);
  display.print("Flow     : ");
  display.println(flow);

  display.display();
}

// =========================
// PAGE 3
// RESPONSE
// =========================
void showResponsePage() {

  header("RESPONSE");

  display.setTextSize(1);

  display.setCursor(0, 16);

  if (painScore >= 70) {

    display.println("PAIN: HIGH");

    display.setCursor(0, 30);
    display.println("Take a rest break.");

    display.setCursor(0, 44);
    display.println("Monitor symptoms.");

  }

  else if (stressScore >= 60) {

    display.println("STRESS: HIGH");

    display.setCursor(0, 30);
    display.println("Try a quiet break.");

    display.setCursor(0, 44);
    display.println("Slow breathing.");

  }

  else if (anemiaRisk >= 60) {

    display.println("RISK: ELEVATED");

    display.setCursor(0, 30);
    display.println("Monitor fatigue");

    display.setCursor(0, 44);
    display.println("and bleeding.");

  }

  else {

    display.println("STATUS: STABLE");

    display.setCursor(0, 30);
    display.println("Continue monitoring.");

    display.setCursor(0, 44);
    display.println("PERIO is tracking.");
  }

  display.display();
}

// =========================
// PAGE CONTROLLER
// =========================
void showPage(int currentPage) {

  switch (currentPage) {

    case 0:
      showSensorPage();
      break;

    case 1:
      showScorePage();
      break;

    case 2:
      showWhyPage();
      break;

    case 3:
      showResponsePage();
      break;
  }
}
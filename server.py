from http.server import BaseHTTPRequestHandler, HTTPServer
import json

HOST = "0.0.0.0"
PORT = 8000

# =========================================================
# ESP32 DATA
# =========================================================

sensor_data = {
    "heartRate": 0,
    "spo2": 0,
    "ecg": 0,

    "painScore": 0,
    "stressScore": 0,
    "anemiaRisk": 0,

    "connected": False
}

# =========================================================
# DASHBOARD ASSESSMENT DATA
# =========================================================

assessment_data = {
    "pain": 0,
    "fatigue": 0,
    "stress": 0,
    "flow": "light",
    "symptoms": []
}


# =========================================================
# HANDLER
# =========================================================

class PERIOHandler(BaseHTTPRequestHandler):

    # -----------------------------------------------------
    # CORS HEADERS
    # -----------------------------------------------------

    def send_cors_headers(self):
        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

    # -----------------------------------------------------
    # OPTIONS
    # -----------------------------------------------------

    def do_OPTIONS(self):

        self.send_response(200)

        self.send_cors_headers()

        self.end_headers()

    # =====================================================
    # GET
    # =====================================================

    def do_GET(self):

        # -------------------------------------------------
        # ESP32 SENSOR DATA
        # -------------------------------------------------

        if self.path == "/sensor":

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.send_cors_headers()

            self.end_headers()

            self.wfile.write(
                json.dumps(sensor_data).encode()
            )

        # -------------------------------------------------
        # DASHBOARD ASSESSMENT
        # -------------------------------------------------

        elif self.path == "/assessment":

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.send_cors_headers()

            self.end_headers()

            self.wfile.write(
                json.dumps(assessment_data).encode()
            )

        # -------------------------------------------------
        # COMBINED PERIO RESULT
        # -------------------------------------------------

        elif self.path == "/result":

            combined_data = {
                "assessment": assessment_data,
                "sensors": sensor_data
            }

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.send_cors_headers()

            self.end_headers()

            self.wfile.write(
                json.dumps(combined_data).encode()
            )

        # -------------------------------------------------
        # SERVER TEST
        # -------------------------------------------------

        elif self.path == "/":

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "text/plain"
            )

            self.send_cors_headers()

            self.end_headers()

            self.wfile.write(
                b"PERIO server is running"
            )

        # -------------------------------------------------
        # NOT FOUND
        # -------------------------------------------------

        else:

            self.send_response(404)

            self.send_header(
                "Content-Type",
                "text/plain"
            )

            self.send_cors_headers()

            self.end_headers()

            self.wfile.write(
                b"Not found"
            )

    # =====================================================
    # POST
    # =====================================================

    def do_POST(self):

        # =================================================
        # DASHBOARD ASSESSMENT
        # =================================================

        if self.path == "/assessment":

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )

            body = self.rfile.read(
                content_length
            )

            try:

                data = json.loads(
                    body.decode()
                )

                # Update assessment data

                if "pain" in data:
                    assessment_data["pain"] = data["pain"]

                if "fatigue" in data:
                    assessment_data["fatigue"] = data["fatigue"]

                if "stress" in data:
                    assessment_data["stress"] = data["stress"]

                if "flow" in data:
                    assessment_data["flow"] = data["flow"]

                if "symptoms" in data:
                    assessment_data["symptoms"] = data["symptoms"]

                # Print received assessment

                print()
                print("--------------------------------")
                print("    DASHBOARD ASSESSMENT")
                print("--------------------------------")
                print(
                    "Pain:",
                    assessment_data["pain"]
                )
                print(
                    "Fatigue:",
                    assessment_data["fatigue"]
                )
                print(
                    "Stress:",
                    assessment_data["stress"]
                )
                print(
                    "Flow:",
                    assessment_data["flow"]
                )
                print(
                    "Symptoms:",
                    assessment_data["symptoms"]
                )
                print("--------------------------------")

                # Response

                self.send_response(200)

                self.send_header(
                    "Content-Type",
                    "application/json"
                )

                self.send_cors_headers()

                self.end_headers()

                self.wfile.write(
                    json.dumps({
                        "status": "success",
                        "message": "Assessment received"
                    }).encode()
                )

            except Exception as e:

                print(
                    "Assessment error:",
                    e
                )

                self.send_response(400)

                self.send_header(
                    "Content-Type",
                    "application/json"
                )

                self.send_cors_headers()

                self.end_headers()

                self.wfile.write(
                    json.dumps({
                        "status": "error",
                        "message": str(e)
                    }).encode()
                )

        # =================================================
        # ESP32 SENSOR DATA
        # =================================================

        elif self.path == "/sensor":

            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )

            body = self.rfile.read(
                content_length
            )

            try:

                data = json.loads(
                    body.decode()
                )

                # Update sensor values

                if "heartRate" in data:
                    sensor_data["heartRate"] = data["heartRate"]

                if "spo2" in data:
                    sensor_data["spo2"] = data["spo2"]

                if "ecg" in data:
                    sensor_data["ecg"] = data["ecg"]

                if "painScore" in data:
                    sensor_data["painScore"] = data["painScore"]

                if "stressScore" in data:
                    sensor_data["stressScore"] = data["stressScore"]

                if "anemiaRisk" in data:
                    sensor_data["anemiaRisk"] = data["anemiaRisk"]

                # ESP32 is connected

                sensor_data["connected"] = True

                # Print ESP32 data

                print()
                print("--------------------------------")
                print("       ESP32 DATA RECEIVED")
                print("--------------------------------")

                print(
                    "Heart Rate:",
                    sensor_data["heartRate"],
                    "BPM"
                )

                print(
                    "SpO2:",
                    sensor_data["spo2"],
                    "%"
                )

                print(
                    "ECG:",
                    sensor_data["ecg"]
                )

                print(
                    "Pain Score:",
                    sensor_data["painScore"]
                )

                print(
                    "Stress Score:",
                    sensor_data["stressScore"]
                )

                print(
                    "Risk Indicator:",
                    sensor_data["anemiaRisk"]
                )

                print("--------------------------------")

                # Response

                self.send_response(200)

                self.send_header(
                    "Content-Type",
                    "application/json"
                )

                self.send_cors_headers()

                self.end_headers()

                self.wfile.write(
                    json.dumps({
                        "status": "success"
                    }).encode()
                )

            except Exception as e:

                print(
                    "Sensor error:",
                    e
                )

                self.send_response(400)

                self.send_header(
                    "Content-Type",
                    "application/json"
                )

                self.send_cors_headers()

                self.end_headers()

                self.wfile.write(
                    json.dumps({
                        "status": "error",
                        "message": str(e)
                    }).encode()
                )

        # =================================================
        # UNKNOWN POST
        # =================================================

        else:

            self.send_response(404)

            self.send_header(
                "Content-Type",
                "text/plain"
            )

            self.send_cors_headers()

            self.end_headers()

            self.wfile.write(
                b"Not found"
            )


# =========================================================
# START SERVER
# =========================================================

server = HTTPServer(
    (HOST, PORT),
    PERIOHandler
)

print("--------------------------------")
print("          PERIO SERVER")
print("--------------------------------")

print(
    "Server running on port:",
    PORT
)

print()

print("ESP32 endpoint:")
print(
    "http://localhost:8000/sensor"
)

print()

print("Dashboard endpoint:")
print(
    "http://localhost:8000/assessment"
)

print()

print("Combined result endpoint:")
print(
    "http://localhost:8000/result"
)

print()

print(
    "Waiting for ESP32 and dashboard data..."
)

print("--------------------------------")

server.serve_forever()
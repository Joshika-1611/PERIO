// ==========================================
// PERIO DASHBOARD
// MEMBER 3
// STEP 2 - COMBINED RESULT SYSTEM
// ==========================================


// ==========================================
// SERVER URLS
// ==========================================

const RESULT_URL = "http://localhost:8000/result";
const ASSESSMENT_URL = "http://localhost:8000/assessment";


// ==========================================
// SENSOR DATA
// ==========================================

let sensorData = {
    heartRate: 0,
    spo2: 0,
    ecg: 0,
    painScore: 0,
    stressScore: 0,
    anemiaRisk: 0,
    connected: false
};


// ==========================================
// USER ASSESSMENT DATA
// ==========================================

let userData = {
    pain: 0,
    stress: 0,
    fatigue: 0,
    flow: "light",
    symptoms: []
};


// ==========================================
// DOM ELEMENTS
// ==========================================

const welcomeScreen = document.getElementById("welcomeScreen");
const assessmentScreen = document.getElementById("assessmentScreen");
const resultsScreen = document.getElementById("resultsScreen");

const startButton = document.getElementById("startButton");
const analyzeButton = document.getElementById("analyzeButton");
const breathingButton = document.getElementById("breathingButton");
const reassessButton = document.getElementById("reassessButton");

const painSlider = document.getElementById("pain");
const stressSlider = document.getElementById("stress");
const fatigueSlider = document.getElementById("fatigue");

const painValue = document.getElementById("painValue");
const stressValue = document.getElementById("stressValue");
const fatigueValue = document.getElementById("fatigueValue");

const heartRateElement = document.getElementById("heartRate");
const spo2Element = document.getElementById("spo2");
const ecgElement = document.getElementById("ecg");

const painScoreElement = document.getElementById("painScore");
const stressScoreElement = document.getElementById("stressScore");
const anemiaScoreElement = document.getElementById("anemiaScore");

const painStatusElement = document.getElementById("painStatus");
const stressStatusElement = document.getElementById("stressStatus");
const anemiaStatusElement = document.getElementById("anemiaStatus");

const explanationElement = document.getElementById("explanation");
const recommendationsElement = document.getElementById("recommendations");

const warningBox = document.getElementById("warningBox");

const breathingBox = document.getElementById("breathingBox");
const breathingCircle = document.getElementById("breathingCircle");
const breathingText = document.getElementById("breathingText");
const stopBreathing = document.getElementById("stopBreathing");


// ==========================================
// SLIDER EVENTS
// ==========================================

if (painSlider) {
    painSlider.addEventListener("input", function () {
        painValue.textContent = this.value;
    });
}

if (stressSlider) {
    stressSlider.addEventListener("input", function () {
        stressValue.textContent = this.value;
    });
}

if (fatigueSlider) {
    fatigueSlider.addEventListener("input", function () {
        fatigueValue.textContent = this.value;
    });
}


// ==========================================
// START ASSESSMENT
// ==========================================

if (startButton) {
    startButton.addEventListener("click", function () {

        welcomeScreen.classList.remove("active");
        welcomeScreen.classList.add("hidden");

        assessmentScreen.classList.add("active");
        assessmentScreen.classList.remove("hidden");

    });
}


// ==========================================
// COLLECT USER INPUT
// ==========================================

function collectUserInput() {

    userData.pain = Number(painSlider.value);
    userData.stress = Number(stressSlider.value);
    userData.fatigue = Number(fatigueSlider.value);


    // Flow

    const selectedFlow = document.querySelector(
        'input[name="flow"]:checked'
    );

    if (selectedFlow) {
        userData.flow = selectedFlow.value;
    }


    // Symptoms

    const selectedSymptoms = document.querySelectorAll(
        ".symptom:checked"
    );

    userData.symptoms = [];

    selectedSymptoms.forEach(function (checkbox) {
        userData.symptoms.push(checkbox.value);
    });


    console.log("USER ASSESSMENT:", userData);
}


// ==========================================
// SEND ASSESSMENT TO SERVER
// ==========================================

async function sendAssessmentToServer() {

    try {

        console.log("Sending assessment to PERIO server...");

        const response = await fetch(
            ASSESSMENT_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(userData)
            }
        );


        if (!response.ok) {
            throw new Error("Assessment server error");
        }


        const result = await response.json();

        console.log(
            "ASSESSMENT SENT SUCCESSFULLY:",
            result
        );

        return true;

    }

    catch (error) {

        console.error(
            "FAILED TO SEND ASSESSMENT:",
            error
        );

        return false;
    }
}


// ==========================================
// GET COMBINED RESULT
// ==========================================

async function getCombinedResult() {

    try {

        console.log(
            "Getting combined PERIO result..."
        );

        const response = await fetch(
            RESULT_URL
        );


        if (!response.ok) {
            throw new Error("Result server error");
        }


        const result = await response.json();


        console.log(
            "COMBINED RESULT:",
            result
        );


        // Update assessment

        if (result.assessment) {

            userData = result.assessment;
        }


        // Update sensors

        if (result.sensors) {

            sensorData = result.sensors;
        }


        return true;

    }

    catch (error) {

        console.error(
            "FAILED TO GET COMBINED RESULT:",
            error
        );

        return false;
    }
}


// ==========================================
// UPDATE LIVE SENSOR DISPLAY
// ==========================================

function updateLiveData() {

    // Heart Rate

    if (
        sensorData.heartRate >= 40 &&
        sensorData.heartRate <= 200
    ) {

        heartRateElement.textContent =
            Math.round(sensorData.heartRate) + " BPM";

    }

    else {

        heartRateElement.textContent = "--";
    }


    // SpO2

    if (
        sensorData.spo2 >= 70 &&
        sensorData.spo2 <= 100
    ) {

        spo2Element.textContent =
            Math.round(sensorData.spo2) + "%";

    }

    else {

        spo2Element.textContent = "--";
    }


    // ECG

    if (
        sensorData.ecg !== undefined &&
        sensorData.ecg !== null
    ) {

        ecgElement.textContent =
            sensorData.ecg;

    }

    else {

        ecgElement.textContent = "--";
    }
}


// ==========================================
// UPDATE SCORES
// ==========================================

function updateScores() {

    painScoreElement.textContent =
        sensorData.painScore;

    stressScoreElement.textContent =
        sensorData.stressScore;

    anemiaScoreElement.textContent =
        sensorData.anemiaRisk;


    painStatusElement.textContent =
        getStatus(sensorData.painScore);

    stressStatusElement.textContent =
        getStatus(sensorData.stressScore);

    anemiaStatusElement.textContent =
        getStatus(sensorData.anemiaRisk);
}


// ==========================================
// STATUS
// ==========================================

function getStatus(score) {

    if (score <= 25) {
        return "LOW";
    }

    if (score <= 50) {
        return "MODERATE";
    }

    if (score <= 75) {
        return "ELEVATED";
    }

    return "HIGH";
}


// ==========================================
// SHOW RESULTS
// ==========================================

async function showResults() {

    assessmentScreen.classList.remove("active");
    assessmentScreen.classList.add("hidden");

    resultsScreen.classList.add("active");
    resultsScreen.classList.remove("hidden");


    // Get latest combined data

    await getCombinedResult();


    // Update dashboard

    updateLiveData();
    updateScores();

    generateExplanation();
    generateRecommendations();
    generateWarning();
}


// ==========================================
// EXPLANATION
// ==========================================

function generateExplanation() {

    explanationElement.innerHTML = "";


    // PAIN

    if (userData.pain >= 7) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>High discomfort reported</strong>
                <p>
                    Your pain rating indicates significant
                    menstrual discomfort.
                </p>
            </div>
        `;

    }

    else if (userData.pain >= 4) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Moderate discomfort reported</strong>
                <p>
                    Your pain rating indicates noticeable
                    menstrual discomfort.
                </p>
            </div>
        `;

    }

    else {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Mild discomfort reported</strong>
                <p>
                    Your reported pain level is relatively low.
                </p>
            </div>
        `;
    }


    // STRESS

    if (userData.stress >= 7) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Higher stress reported</strong>
                <p>
                    Your stress rating suggests that
                    stress may be contributing to how
                    you are feeling.
                </p>
            </div>
        `;

    }

    else if (userData.stress >= 4) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Moderate stress reported</strong>
                <p>
                    Your reported stress level is moderate.
                </p>
            </div>
        `;
    }


    // FATIGUE

    if (userData.fatigue >= 7) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>High fatigue reported</strong>
                <p>
                    Significant fatigue was reported
                    during the assessment.
                </p>
            </div>
        `;

    }

    else if (userData.fatigue >= 4) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Moderate fatigue reported</strong>
                <p>
                    You reported a noticeable level
                    of fatigue.
                </p>
            </div>
        `;
    }


    // FLOW

    if (userData.flow === "heavy") {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Heavy menstrual flow reported</strong>
                <p>
                    Heavy flow was selected during
                    your assessment.
                </p>
            </div>
        `;
    }


    // SYMPTOMS

    if (
        userData.symptoms &&
        userData.symptoms.length > 0
    ) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Reported symptoms</strong>
                <p>
                    ${userData.symptoms.join(", ")}
                </p>
            </div>
        `;
    }


    // PHYSIOLOGICAL DATA

    if (sensorData.connected) {

        explanationElement.innerHTML += `
            <div class="explanation-item">
                <strong>Physiological data received</strong>
                <p>
                    Your PERIO device is providing
                    live physiological measurements
                    including heart rate, SpO₂ and ECG.
                </p>
            </div>
        `;
    }
}


// ==========================================
// RECOMMENDATIONS
// ==========================================

function generateRecommendations() {

    recommendationsElement.innerHTML = "";


    // PAIN

    if (userData.pain >= 6) {

        recommendationsElement.innerHTML += `
            <div class="recommendation-item">
                <strong>Manage discomfort</strong>
                <p>
                    Consider rest, gentle movement,
                    hydration and a comfortable
                    warm environment.
                </p>
            </div>
        `;
    }


    // STRESS

    if (userData.stress >= 6) {

        recommendationsElement.innerHTML += `
            <div class="recommendation-item">
                <strong>Reduce stress</strong>
                <p>
                    Try the guided breathing exercise
                    below and take a short period
                    of quiet rest.
                </p>
            </div>
        `;
    }


    // FATIGUE

    if (userData.fatigue >= 6) {

        recommendationsElement.innerHTML += `
            <div class="recommendation-item">
                <strong>Prioritize rest</strong>
                <p>
                    Allow yourself time to rest and
                    maintain adequate hydration
                    and nutrition.
                </p>
            </div>
        `;
    }


    // HEAVY FLOW

    if (userData.flow === "heavy") {

        recommendationsElement.innerHTML += `
            <div class="recommendation-item">
                <strong>Monitor heavy flow</strong>
                <p>
                    Keep track of your menstrual flow
                    and how long heavy bleeding continues.
                </p>
            </div>
        `;
    }


    // DIZZINESS

    if (
        userData.symptoms &&
        userData.symptoms.includes("dizziness")
    ) {

        recommendationsElement.innerHTML += `
            <div class="recommendation-item">
                <strong>Dizziness reported</strong>
                <p>
                    Sit or lie down if you feel dizzy.
                    If dizziness is severe, persistent,
                    or accompanied by other concerning
                    symptoms, seek medical care.
                </p>
            </div>
        `;
    }


    // DEFAULT

    if (recommendationsElement.innerHTML === "") {

        recommendationsElement.innerHTML = `
            <div class="recommendation-item">
                <strong>Continue self-care</strong>
                <p>
                    Stay hydrated, rest when needed,
                    and continue monitoring how
                    you feel.
                </p>
            </div>
        `;
    }
}


// ==========================================
// WARNING
// ==========================================

function generateWarning() {

    warningBox.classList.add("hidden");


    let warning = "";


    if (userData.pain >= 9) {

        warning =
            "Severe pain has been reported. " +
            "If the pain is unusual, severe, " +
            "or worsening, consider seeking " +
            "medical advice.";

    }

    else if (
        userData.flow === "heavy" &&
        userData.symptoms &&
        userData.symptoms.includes("dizziness")
    ) {

        warning =
            "Heavy flow and dizziness were reported " +
            "together. If symptoms are severe, " +
            "persistent, or worsening, seek medical care.";
    }


    if (warning !== "") {

        warningBox.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div>
                <strong>
                    Please pay attention to your symptoms
                </strong>
                <p>
                    ${warning}
                </p>
            </div>
        `;

        warningBox.classList.remove("hidden");
    }
}


// ==========================================
// GUIDED BREATHING
// ==========================================

let breathingInterval = null;


if (breathingButton) {

    breathingButton.addEventListener(
        "click",
        function () {

            breathingBox.classList.remove("hidden");


            let phase = 0;


            function breathingCycle() {

                if (phase === 0) {

                    breathingText.textContent =
                        "Breathe in...";

                    breathingCircle.classList.add(
                        "expand"
                    );

                    phase = 1;

                }

                else {

                    breathingText.textContent =
                        "Breathe out...";

                    breathingCircle.classList.remove(
                        "expand"
                    );

                    phase = 0;
                }
            }


            breathingCycle();


            clearInterval(breathingInterval);

            breathingInterval =
                setInterval(
                    breathingCycle,
                    4000
                );
        }
    );
}


// ==========================================
// STOP BREATHING
// ==========================================

if (stopBreathing) {

    stopBreathing.addEventListener(
        "click",
        function () {

            clearInterval(
                breathingInterval
            );

            breathingInterval = null;

            breathingBox.classList.add(
                "hidden"
            );
        }
    );
}


// ==========================================
// REASSESS
// ==========================================

if (reassessButton) {

    reassessButton.addEventListener(
        "click",
        function () {

            resultsScreen.classList.remove(
                "active"
            );

            resultsScreen.classList.add(
                "hidden"
            );

            assessmentScreen.classList.add(
                "active"
            );

            assessmentScreen.classList.remove(
                "hidden"
            );
        }
    );
}


// ==========================================
// ANALYZE BUTTON
// ==========================================

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        async function () {

            collectUserInput();

            await sendAssessmentToServer();

            await showResults();
        }
    );
}


// ==========================================
// INITIALIZE
// ==========================================

async function initializePERIO() {

    console.log(
        "PERIO dashboard starting..."
    );


    const success =
        await getCombinedResult();


    if (success) {

        updateLiveData();

        console.log(
            "PERIO combined data loaded."
        );
    }
}


// ==========================================
// LIVE SENSOR REFRESH
// ==========================================

async function refreshLiveData() {

    try {

        const response =
            await fetch(
                RESULT_URL
            );


        if (!response.ok) {
            throw new Error(
                "Unable to get live data"
            );
        }


        const result =
            await response.json();


        if (result.sensors) {

            sensorData =
                result.sensors;
        }


        updateLiveData();

    }

    catch (error) {

        console.error(
            "Live data error:",
            error
        );
    }
}


// ==========================================
// START SYSTEM
// ==========================================

initializePERIO();


// Refresh sensor data every 2 seconds

setInterval(
    refreshLiveData,
    2000
);
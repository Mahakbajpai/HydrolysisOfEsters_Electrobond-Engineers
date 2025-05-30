document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Script is running."); // Debugging line

    const instructions = [
        "Welcome to the Ester Hydrolysis Virtual Lab! In this simulation, you will determine the rate constant of the acid-catalyzed hydrolysis of an ester.",
        "Step 1: Gather your reagents. You will need a solution of ethyl acetate, a solution of hydrochloric acid (catalyst), and a standard solution of sodium hydroxide.",
        "Step 2: Prepare the reaction mixture. Pipette 10 mL of ethyl acetate solution into a clean, dry conical flask. Then, add 10 mL of 0.5 M HCl solution to the same flask. (Click 'Next Step' to simulate mixing).",
        "Step 3: Start the timer immediately upon mixing the reactants. This is crucial for determining the initial concentration and subsequent readings. (Click 'Start Reaction' button).",
        "Step 4: Take initial reading (t=0). Immediately withdraw 5 mL of the reaction mixture and add it to a separate conical flask containing about 20 mL of distilled water and 2-3 drops of phenolphthalein indicator. Titrate this solution against the standard 0.1 M NaOH solution from the burette until a permanent faint pink color appears. Record the burette reading. (Click 'Take Reading' and input the value).",
        "Step 5: Continue taking readings at regular intervals (e.g., every 10 minutes). For each reading, withdraw 5 mL of the reaction mixture, dilute, and titrate with NaOH. Record the time and burette reading. (Click 'Take Reading' to simulate a new time interval).",
        "Step 6: You will take readings at 0, 10, 20, 30, 40, and 50 minutes. After taking all readings, we will proceed to data analysis. (Simulating all readings now...)",
        "Step 7: Data collection complete. Now, click 'Analyze Data' to calculate the rate constant.",
        "Analysis: The reaction is pseudo-first order. We will use the integrated rate law: $k = (2.303 / t) * \\log((V_{\\infty} - V_0) / (V_{\\infty} - V_t))$, where $V_0$, $V_t$, and $V_{\\infty}$ are the volumes of NaOH consumed at time 0, time t, and infinite time (after complete hydrolysis). For this simulation, we'll assume $V_{\\infty}$ is the maximum possible titration volume at complete hydrolysis. In a real lab, you'd heat to ensure complete hydrolysis for $V_{\\infty}$.",
        "Congratulations! You have completed the virtual lab simulation. The calculated rate constant for the hydrolysis of ethyl acetate is: "
    ];

    let currentInstructionIndex = 0;
    const instructionBox = document.getElementById('instructions-box');
    const currentInstructionPara = document.getElementById('current-instruction');
    const nextStepBtn = document.getElementById('next-step-btn');
    const experimentSetupDiv = document.getElementById('experiment-setup');
    const startReactionBtn = document.getElementById('start-reaction-btn');
    const takeReadingBtn = document.getElementById('take-reading-btn');
    const buretteReadingInput = document.getElementById('burette-reading-input');
    const submitReadingBtn = document.getElementById('submit-reading-btn');
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const dataCollectionDiv = document.getElementById('data-collection');
    const dataTableBody = document.getElementById('data-table-body');
    const analyzeDataBtn = document.getElementById('analyze-data-btn');
    const resultsArea = document.getElementById('results-area');
    const calculatedKPara = document.getElementById('calculated-k');

    // Check if all elements are found
    if (!currentInstructionPara || !nextStepBtn) {
        console.error("Critical HTML elements not found! Check your HTML IDs.");
        return; // Stop script execution if essential elements are missing
    }

    let reactionStarted = false;
    let timerInterval;
    let startTime;
    let readings = []; // Stores { time: minutes, reading: mL }
    let simulatedTimes = [0, 10, 20, 30, 40, 50]; // Minutes
    let currentSimulatedTimeIndex = 0;
    let simulatedBuretteReadings = [ // Placeholder simulated data for demonstration
        2.5, // t=0
        3.8, // t=10
        4.9, // t=20
        5.7, // t=30
        6.2, // t=40
        6.5  // t=50 (approaching V_infinity)
    ];

    const V_infinity = 7.0; // mL, assuming complete hydrolysis would consume this much NaOH

    function showInstruction(index) {
        console.log(`Showing instruction: ${index}`); // Debugging line
        currentInstructionPara.innerHTML = instructions[index];
        nextStepBtn.classList.remove('hidden'); // Ensure the button is visible
        if (index === 0) {
            nextStepBtn.textContent = 'Begin Simulation';
        } else {
            nextStepBtn.textContent = 'Next Step';
        }
        // Ensure the instruction box itself is visible
        instructionBox.classList.remove('hidden');
    }

    function updateStopwatch() {
        if (!startTime) return;
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);
        stopwatchDisplay.textContent =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
    }

    function addDataRow(time, reading) {
        const row = dataTableBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.textContent = time;
        cell2.textContent = reading;
    }

    function calculateRateConstant() {
        let sumK = 0;
        let count = 0;

        const V0 = readings[0].reading;

        for (let i = 1; i < readings.length; i++) {
            const Vt = readings[i].reading;
            const t = readings[i].time;

            if (V_infinity - Vt !== 0) {
                // Using the pseudo-first order integrated rate law
                const k = (2.303 / t) * Math.log10( (V_infinity - V0) / (V_infinity - Vt) );
                if (!isNaN(k) && isFinite(k)) {
                    sumK += k;
                    count++;
                }
            }
        }

        if (count > 0) {
            const averageK = sumK / count;
            calculatedKPara.innerHTML = `Calculated Rate Constant (k): ${averageK.toFixed(4)} min⁻¹`; // Use innerHTML for potential LaTeX later
        } else {
            calculatedKPara.innerHTML = `Could not calculate rate constant. Please ensure all readings are valid.`;
        }

        resultsArea.classList.remove('hidden');
    }

    nextStepBtn.addEventListener('click', () => {
        console.log(`Next Step button clicked. Current index: ${currentInstructionIndex}`); // Debugging
        nextStepBtn.classList.add('hidden'); // Hide until next step is ready

        currentInstructionIndex++; // Increment first

        if (currentInstructionIndex >= instructions.length) {
            console.warn("Attempted to go beyond last instruction.");
            return; // Prevent errors if clicking past the end
        }

        // Logic for specific steps
        if (currentInstructionIndex === 1) {
            showInstruction(currentInstructionIndex);
        } else if (currentInstructionIndex === 2) {
            showInstruction(currentInstructionIndex);
            experimentSetupDiv.classList.remove('hidden');
        } else if (currentInstructionIndex === 3) {
            showInstruction(currentInstructionIndex);
            startReactionBtn.classList.remove('hidden');
        } else if (currentInstructionIndex === 4) {
            showInstruction(currentInstructionIndex);
            // Prepare for first reading (t=0)
            takeReadingBtn.classList.remove('hidden');
            buretteReadingInput.classList.remove('hidden');
            submitReadingBtn.classList.remove('hidden');
            takeReadingBtn.disabled = true; // User must input reading
            // Set placeholder for the initial reading
            buretteReadingInput.placeholder = `Enter reading for t=0 min`;
        } else if (currentInstructionIndex === 6) {
            // This is the instruction just before simulating all readings
            showInstruction(currentInstructionIndex);
            takeReadingBtn.classList.add('hidden');
            buretteReadingInput.classList.add('hidden');
            submitReadingBtn.classList.add('hidden');
            dataCollectionDiv.classList.remove('hidden');

            // Simulate adding all readings to the table
            simulatedTimes.forEach((time, index) => {
                const reading = simulatedBuretteReadings[index];
                readings.push({ time: time, reading: reading });
                addDataRow(time, reading);
            });

            // After all readings are added, move to the next instruction
            setTimeout(() => {
                currentInstructionIndex++; // Now instruction 7: Data collection complete
                showInstruction(currentInstructionIndex);
                analyzeDataBtn.classList.remove('hidden');
            }, 2000); // Small delay to show readings being added
        } else if (currentInstructionIndex === instructions.length - 1) {
            // Last instruction, analysis complete (shows the K value)
            showInstruction(currentInstructionIndex);
        } else {
            // Default: just show the next instruction
            showInstruction(currentInstructionIndex);
        }
    });

    startReactionBtn.addEventListener('click', () => {
        console.log("Start Reaction button clicked."); // Debugging
        if (!reactionStarted) {
            startTime = Date.now();
            timerInterval = setInterval(updateStopwatch, 10);
            reactionStarted = true;
            startReactionBtn.disabled = true;
            // Now, after starting reaction, the user should proceed to take t=0 reading.
            // The "Next Step" button needs to be re-enabled here if it was disabled.
            // In the previous logic, clicking 'Next Step' takes user to 'Step 4'
            // which then enables 'Take Reading'. So, we don't need to enable 'Next Step' here directly
            // unless we want to allow skipping the immediate t=0 reading.
            // For a sequential lab, we expect them to do t=0 reading next.
            // However, the `nextStepBtn` is hidden by default after its click.
            // It needs to be explicitly re-shown if we want to prompt the user to click it again.
            // Let's re-enable it here to guide them to the next instruction.
            nextStepBtn.classList.remove('hidden'); // Enable "Next Step" to go to Step 4.
        }
    });

    takeReadingBtn.addEventListener('click', () => {
        console.log("Take Reading button clicked."); // Debugging
        // This button is meant to appear at each simulated time point.
        // It should hide itself and show input field and submit button.
        buretteReadingInput.value = ''; // Clear previous input
        buretteReadingInput.placeholder = `Enter reading for t=${simulatedTimes[currentSimulatedTimeIndex]} min`;
        buretteReadingInput.classList.remove('hidden');
        submitReadingBtn.classList.remove('hidden');
        takeReadingBtn.disabled = true; // Disable "Take Reading" until submitted
    });

    submitReadingBtn.addEventListener('click', () => {
        console.log("Submit Reading button clicked."); // Debugging
        const reading = parseFloat(buretteReadingInput.value);
        if (!isNaN(reading) && reading >= 0) { // Reading can be 0 or positive
            const time = simulatedTimes[currentSimulatedTimeIndex];
            readings.push({ time: time, reading: reading });
            addDataRow(time, reading);

            buretteReadingInput.classList.add('hidden');
            submitReadingBtn.classList.add('hidden');

            currentSimulatedTimeIndex++; // Move to the next simulated time point

            if (currentSimulatedTimeIndex < simulatedTimes.length) {
                // More readings are expected. Guide user to take next reading.
                takeReadingBtn.disabled = false; // Enable "Take Reading" for the next interval
                // The 'Next Step' button should be controlled by the main instruction flow,
                // not by individual reading submissions.
                // We are at step 5 in the general flow if we are taking subsequent readings.
                if (currentInstructionIndex === 4) { // If currently on "Take initial reading (t=0)"
                    currentInstructionIndex = 5; // Move to "Continue taking readings"
                    showInstruction(currentInstructionIndex);
                    // Do not show nextStepBtn here as we want user to click 'Take Reading' again
                    nextStepBtn.classList.add('hidden');
                } else if (currentInstructionIndex === 5) { // If already on "Continue taking readings"
                    // Just ensure takeReadingBtn is enabled for next reading
                    takeReadingBtn.classList.remove('hidden');
                    // Ensure the instruction remains the same, no need to call showInstruction
                }
            } else {
                // All simulated readings have been entered manually
                clearInterval(timerInterval); // Stop the stopwatch as readings are complete
                stopwatchDisplay.textContent = "00:00:00 (Simulation Complete)";

                currentInstructionIndex = 7; // Direct to "Data collection complete" instruction
                showInstruction(currentInstructionIndex);
                takeReadingBtn.classList.add('hidden'); // Hide it since no more readings
                analyzeDataBtn.classList.remove('hidden'); // Show analyze button
            }
        } else {
            alert("Please enter a valid positive burette reading.");
        }
    });

    analyzeDataBtn.addEventListener('click', () => {
        console.log("Analyze Data button clicked."); // Debugging
        calculateRateConstant();
        analyzeDataBtn.classList.add('hidden');
        currentInstructionIndex = 8; // Move to analysis instruction
        showInstruction(currentInstructionIndex);
        setTimeout(() => {
            currentInstructionIndex = 9; // Move to final result instruction
            showInstruction(currentInstructionIndex);
        }, 3000); // Small delay to show results being calculated
    });

    // Initial instruction display
    // THIS IS THE MOST IMPORTANT PART FOR THE INITIAL DISPLAY
    showInstruction(0);
});
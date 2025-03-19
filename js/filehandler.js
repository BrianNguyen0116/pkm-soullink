/* =============================
        JSON Utility
============================= */

import { getPC } from "./data.js";
import { showModalAlert } from "./qol.js";
import { processInput } from "./core.js";

export function uploadJSON(event) {
    const file = event.target.files[0]; 

    if (!file) {
        showModalAlert("Missing file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result); 
            const jsonString = JSON.stringify(jsonData, null, 4);

            document.getElementById("jsonInput").value = jsonString;
            localStorage.setItem('jsonInput', jsonString);

            processInput();

        } catch (error) {
            showModalAlert("Error parsing JSON: " + error.message, error);
        }
    };

    reader.readAsText(file);
}

export async function saveJSON() {
    if (!getPC()) {
        showModalAlert("PC data is required to save the JSON.");
        return
    }

    if (!window.showSaveFilePicker) {
        showModalAlert("Your browser does not support file saving.");
        return;
    }

    const jsonString = JSON.stringify(getPC(), null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });

    localStorage.setItem('jsonInput', jsonString);

    const handle = await window.showSaveFilePicker({
        suggestedName: 'soullink-save.json',
        types: [
            {
                description: "JSON",
                accept: { "application/json": [".json"] },
            },
        ],
    });

    const writableStream = await handle.createWritable();

    await writableStream.write(blob);

    await writableStream.close();
}

export function applyJSON() {
    document.getElementById("jsonInput").value = JSON.stringify(getPC(), null, 4);
    localStorage.setItem('jsonInput',  document.getElementById("jsonInput").value);
}
let allCombinations = [];
let PC_1 = [];
let PC_2 = [];

// Massive Poke-dictionary because no-nodejs fun times
const poketypes = [
    { type: "Normal", strongTo: [], weakTo: ["Fighting"] },
    { type: "Fire", strongTo: ["Bug", "Grass", "Ice", "Steel"], weakTo: ["Ground", "Rock", "Water"] },
    { type: "Water", strongTo: ["Fire", "Ground", "Rock"], weakTo: ["Electric", "Grass"] },
    { type: "Grass", strongTo: ["Water", "Ground", "Rock"], weakTo: ["Fire", "Bug", "Flying", "Poison"] },
    { type: "Electric", strongTo: ["Water", "Flying"], weakTo: ["Ground"] },
    { type: "Ice", strongTo: ["Flying", "Ground", "Grass", "Dragon"], weakTo: ["Fire", "Fighting", "Steel"] },
    { type: "Fighting", strongTo: ["Normal", "Rock", "Steel", "Ice", "Dark"], weakTo: ["Flying", "Psychic", "Fairy"] },
    { type: "Poison", strongTo: ["Grass", "Fairy"], weakTo: ["Ground", "Psychic"] },
    { type: "Ground", strongTo: ["Electric", "Poison", "Rock", "Steel", "Fire"], weakTo: ["Water", "Grass", "Ice"] },
    { type: "Flying", strongTo: ["Fighting", "Bug", "Grass"], weakTo: ["Electric", "Ice", "Rock"] },
    { type: "Psychic", strongTo: ["Fighting", "Poison"], weakTo: ["Bug", "Dark", "Psychic"] },
    { type: "Bug", strongTo: ["Grass", "Dark", "Psychic"], weakTo: ["Fire", "Flying", "Rock"] },
    { type: "Rock", strongTo: ["Bug", "Ice", "Flying", "Fire"], weakTo: ["Fighting", "Ground", "Water", "Steel"] },
    { type: "Ghost", strongTo: ["Ghost", "Psychic"], weakTo: ["Ghost", "Dark"] },
    { type: "Dragon", strongTo: ["Dragon"], weakTo: ["Ice", "Dragon", "Fairy"] },
    { type: "Dark", strongTo: ["Ghost", "Psychic"], weakTo: ["Fighting", "Bug", "Fairy"] },
    { type: "Steel", strongTo: ["Rock", "Ice", "Fairy"], weakTo: ["Fighting", "Ground", "Fire"] },
    { type: "Fairy", strongTo: ["Dragon", "Fighting", "Dark"], weakTo: ["Poison", "Steel"] }
];

window.onload = () => {
    const jsonData = JSON.parse(document.getElementById("jsonInput").value);

    PC_1 = jsonData.PC_1;
    PC_2 = jsonData.PC_2;

    displayEditableLists();
}

/* =============================
        Input Section
============================= */
function processInput() {
    document.getElementById("errorMessage").textContent = "";
    document.getElementById("combinations").innerHTML = "<h3>Valid Combinations:</h3>";

    try {
        const jsonData = JSON.parse(document.getElementById("jsonInput").value);

        if (!jsonData.PC_1 || !jsonData.PC_2 || !Array.isArray(jsonData.PC_1) || !Array.isArray(jsonData.PC_2)) {
            throw new Error("JSON must contain 'PC_1' and 'PC_2' as arrays.");
        }

        PC_1 = jsonData.PC_1;
        PC_2 = jsonData.PC_2;

        if (PC_1.length !== PC_2.length) {
            throw new Error("'PC_1' and 'PC_2' must have the same number of elements.");
        }

        for (const obj of [...PC_1, ...PC_2]) {
            if (!obj.name || !obj.type) {
                throw new Error("Each object must have 'name' and 'type' attributes.");
            }

            if (!poketypes.some(p => p.type === obj.type)) {
                throw new Error(`Invalid type "${obj.type}" found. Must be one of: ${poketypes.map(p => p.type).join(", ")}`);
            }
        }

        displayEditableLists();

    } catch (e) {
        showModalAlert("Invalid JSON: " + e.message);
        return;
    }

    const linkMap = {};

    for (let i = 0; i < PC_1.length; i++) {
        linkMap[PC_1[i].name] = PC_2.find(obj => obj.name === PC_1[i].name);
    }

    findValidCombinations(PC_1, linkMap);
}


/* =============================
        JSON Utility
============================= */

function uploadJSON(event) {
    const file = event.target.files[0]; 

    if (!file)
        showModalAlert("Missing file.");

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result); 
            if (!jsonData.PC_1 || !jsonData.PC_2 || !Array.isArray(jsonData.PC_1) || !Array.isArray(jsonData.PC_2)) {
                throw new Error("Invalid JSON format. Must contain 'PC_1' and 'PC_2' as arrays.");
            }

            document.getElementById("jsonInput").value = JSON.stringify(jsonData, null, 4);

            processInput();

        } catch (error) {
            showModalAlert("Error parsing JSON: " + error.message);
        }
    };

    reader.readAsText(file);
}

function saveJSON() {
    const updatedJSON = {
        PC_1: PC_1,
        PC_2: PC_2
    };
    const jsonString = JSON.stringify(updatedJSON, null, 4);
    
    const blob = new Blob([jsonString], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "PC_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function applyJSON() {
    const updatedJSON = {
        PC_1: PC_1,
        PC_2: PC_2
    };
    document.getElementById("jsonInput").value = JSON.stringify(updatedJSON, null, 4);
}


/* =============================
        Combination Section
============================= */

function findCombinations(index, PC_1, linkMap, chosenPC_1, chosenPC_2, usedAttributes, results) {
    if (index === PC_1.length) {
        results.push({ PC_1: [...chosenPC_1], PC_2: [...chosenPC_2] });
        return;
    }

    const item1 = PC_1[index];
    const item2 = linkMap[item1.name];

    if (item2 && !usedAttributes.has(item1.type) && !usedAttributes.has(item2.type)) {
        chosenPC_1.push(item1);
        chosenPC_2.push(item2);
        usedAttributes.add(item1.type);
        usedAttributes.add(item2.type);

        findCombinations(index + 1, PC_1, linkMap, chosenPC_1, chosenPC_2, usedAttributes, results);

        chosenPC_1.pop();
        chosenPC_2.pop();
        usedAttributes.delete(item1.type);
        usedAttributes.delete(item2.type);
    }

    findCombinations(index + 1, PC_1, linkMap, chosenPC_1, chosenPC_2, usedAttributes, results);
}

function removeSubsets(results) {
    return results.filter((combo, i, allResults) =>
        !allResults.some((otherCombo, j) =>
            j !== i &&
            combo.PC_1.length < otherCombo.PC_1.length &&
            combo.PC_1.every(obj => otherCombo.PC_1.some(o => o.name === obj.name))
        )
    );
}

function findValidCombinations(PC_1, linkMap) {
    allCombinations = [];
    findCombinations(0, PC_1, linkMap, [], [], new Set(), allCombinations);
    allCombinations = removeSubsets(allCombinations);
    showFilterPopup();
}


/* =============================
        Filter Section
============================= */

function showFilterPopup() {
    const filterPopup = document.getElementById("filterPopup");
    const overlay = document.getElementById("overlay");
    const filterOptions = document.getElementById("filterOptions");

    const filterTable = document.createElement("div");
    filterTable.classList.add("filter-table");

    filterOptions.innerHTML = "";

    const uniqueNames = [...new Set(allCombinations.flatMap(combo => combo.PC_1.map(item => item.name)))];

    const column1 = document.createElement("div");
    column1.classList.add("filter-column");
    const column2 = document.createElement("div");
    column2.classList.add("filter-column");

    uniqueNames.forEach((name, index) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${name}"> ${name}`;

        if (index % 2 === 0) {
            column1.appendChild(label);
        } else {
            column2.appendChild(label);
        }
    });

    filterTable.appendChild(column1);
    filterTable.appendChild(column2);
    filterOptions.appendChild(filterTable);

    filterPopup.style.display = "block";
    overlay.style.display = "block";
}

function applyFilter() {
    const selectedNames = [...document.querySelectorAll('#filterOptions input:checked')].map(input => input.value);
    displayCombinations(selectedNames);
    document.getElementById("filterPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function closeFilterPopup() {
    document.getElementById("filterPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("combinations").innerHTML = `<div id="grass"></div>`;
}


/* =============================
        Output Section
============================= */

function displayCombinations(selectedNames) {
    const combinationsDiv = document.getElementById("combinations");
    combinationsDiv.innerHTML = "<h3>Valid Combinations:</h3>";

    const filteredCombinations = allCombinations.filter(combo =>
        selectedNames.every(name => combo.PC_1.some(item => item.name === name))
    );

    if (filteredCombinations.length == 0) {
        const element = document.createElement("p");
        element.innerHTML = "None";
        combinationsDiv.appendChild(element);
    } else {
            filteredCombinations.forEach(combo => {
            const div = document.createElement("div");
            div.classList.add("combination");
            div.innerHTML = `${combo.PC_1.map(i => i.name).join(", ")}`;
            div.onclick = () => showCombinationDetails(combo);
            combinationsDiv.appendChild(div);
        });
    }
}

function showCombinationDetails(combo) {
    let modal = document.getElementById("combinationModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "combinationModal";
        modal.classList.add("modal-overlay");
        modal.innerHTML = `
            <div class="modal-box">
                <h3>Combination Details</h3>
                <div id="combinationDetails"></div>
                <div id="coverageSummary"></div>
                <button onclick="closeCombinationModal()">Close</button>
            </div>`;
        document.body.appendChild(modal);
    }

    const modalContent = document.getElementById("combinationDetails");
    modalContent.classList.add("table-container");
    modalContent.innerHTML = "";

    const tablePC1 = document.createElement("table");
    tablePC1.classList.add("combo-table");
    tablePC1.innerHTML = "<tr><th>PC 1 Name</th><th>Type</th></tr>";

    const tablePC2 = document.createElement("table");
    tablePC2.classList.add("combo-table");
    tablePC2.innerHTML = "<tr><th>PC 2 Name</th><th>Type</th></tr>";

    let pc1StrengthsSet = new Set();
    let pc1WeaknessesSet = new Set();
    let pc2StrengthsSet = new Set();
    let pc2WeaknessesSet = new Set();

    combo.PC_1.forEach((pc1, index) => {
        const pc2 = combo.PC_2[index];

        const pc1TypeData = poketypes.find(t => t.type === pc1.type);
        const pc2TypeData = poketypes.find(t => t.type === pc2.type);

        pc1TypeData.strongTo.forEach(type => pc1StrengthsSet.add(type));
        pc1TypeData.weakTo.forEach(type => pc1WeaknessesSet.add(type));

        pc2TypeData.strongTo.forEach(type => pc2StrengthsSet.add(type));
        pc2TypeData.weakTo.forEach(type => pc2WeaknessesSet.add(type));

        const row1 = document.createElement("tr");
        row1.innerHTML = `
            <td>${pc1.name}</td>
            <td>${pc1.type}</td>`;
        tablePC1.appendChild(row1);

        const row2 = document.createElement("tr");
        row2.innerHTML = `
            <td>${pc2.name}</td>
            <td>${pc2.type}</td>`;
        tablePC2.appendChild(row2);
    });

    modalContent.appendChild(tablePC1);
    modalContent.appendChild(tablePC2);

    const finalPC1Strengths = new Set(pc1StrengthsSet);
    const finalPC1Weaknesses = new Set(pc1WeaknessesSet);

    pc1StrengthsSet.forEach(type => {
        if (pc1WeaknessesSet.has(type)) {
            finalPC1Strengths.delete(type);
            finalPC1Weaknesses.delete(type);
        }
    });

    const finalPC2Strengths = new Set(pc2StrengthsSet);
    const finalPC2Weaknesses = new Set(pc2WeaknessesSet);

    pc2StrengthsSet.forEach(type => {
        if (pc2WeaknessesSet.has(type)) {
            finalPC2Strengths.delete(type);
            finalPC2Weaknesses.delete(type);
        }
    });

    const coverageSummary = document.getElementById("coverageSummary");
    coverageSummary.innerHTML = `
        <h4>PC 1 Coverage</h4>
        <p><strong>Strengths:</strong> ${Array.from(finalPC1Strengths).join(", ") || "None"}</p>
        <p><strong>Weaknesses:</strong> ${Array.from(finalPC1Weaknesses).join(", ") || "None"}</p>
        <h4>PC 2 Coverage</h4>
        <p><strong>Strengths:</strong> ${Array.from(finalPC2Strengths).join(", ") || "None"}</p>
        <p><strong>Weaknesses:</strong> ${Array.from(finalPC2Weaknesses).join(", ") || "None"}</p>
    `;

    modal.style.display = "block";
}

function countTypeOccurrences(types) {
    const typeCount = {};
    types.forEach(type => {
        typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return Object.entries(typeCount)
        .map(([type, count]) => (count > 1 ? `2x ${type}` : type))
        .join(", ");
}

function closeCombinationModal() {
    document.getElementById("combinationModal").style.display = "none";
}


/* =============================
        Form Section 
============================= */

function displayEditableLists() {
    const pc1List = document.getElementById("pc1List");
    const pc2List = document.getElementById("pc2List");
    pc1List.innerHTML = "";
    pc2List.innerHTML = "";

    PC_1.forEach((item, index) => {
        pc1List.appendChild(createEditableRow(item, index, "PC_1"));
    });

    PC_2.forEach((item, index) => {
        pc2List.appendChild(createEditableRow(item, index, "PC_2"));
    });
}

function createEditableRow(item, index, setName) {
    const div = document.createElement("div");
    div.classList.add("entry");

    const nameInput = document.createElement("input");
    nameInput.value = item.name;
    nameInput.oninput = (event) => debouncedUpdateData(index, setName, "name", event.target.value);

    const typeSelect = document.createElement("select");
    poketypes.forEach(pokeType => {
        const option = document.createElement("option");
        option.value = pokeType.type;
        option.textContent = pokeType.type;
        if (pokeType.type === item.type) {
            option.selected = true;
        }
        typeSelect.appendChild(option);
    });

    typeSelect.onchange = (event) => debouncedUpdateData(index, setName, "type", event.target.value);

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-button");
    removeBtn.textContent = "X";
    removeBtn.onclick = () => removeRow(index, setName);

    div.appendChild(nameInput);
    div.appendChild(typeSelect);
    div.appendChild(removeBtn);

    return div;
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const debouncedUpdateData = debounce((index, setName, key, value) => {
    if (setName === "PC_1") {
        PC_1[index][key] = value;
        if (key === "name") PC_2[index][key] = value;
    } else {
        PC_2[index][key] = value;
        if (key === "name") PC_1[index][key] = value;
    }

    displayEditableLists();
    applyJSON();
}, 300);

function addRow() {
    const newRow = { name: "", type: poketypes[0].type };

    PC_1.push(newRow);
    PC_2.push(newRow);

    displayEditableLists();
}

function removeRow(index, setName) {
    if (PC_1.length > 1 || PC_2.length > 1) {
        if (setName === "PC_1") {
            PC_1.splice(index, 1);
            PC_2.splice(index, 1); 
        } else {
            PC_2.splice(index, 1);
            PC_1.splice(index, 1);
        }

        displayEditableLists();
    } else {
        showModalAlert("You must have at least one row.");
    }
}

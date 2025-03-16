let allCombinations = [];
let PC = [];

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
    PC = jsonData;

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

        PC = jsonData;

        for (const obj of [...PC]) {
            if (!obj.name1 || !obj.name2 || !obj.type1 || !obj.type2 || !obj.area) {
                throw new Error("Each object must have 'name', 'type' and 'area' attributes.");
            }

            if (!poketypes.some(p => p.type === obj.type1) || !poketypes.some(p => p.type === obj.type2)) {
                throw new Error(`Invalid type "${obj.type}" found. Must be one of: ${poketypes.map(p => p.type).join(", ")}`);
            }
        }

        displayEditableLists();

    } catch (e) {
        showModalAlert("Invalid JSON: " + e.message);
        return;
    }

    findValidCombinations(PC);
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

            document.getElementById("jsonInput").value = JSON.stringify(jsonData, null, 4);

            processInput();

        } catch (error) {
            showModalAlert("Error parsing JSON: " + error.message);
        }
    };

    reader.readAsText(file);
}

async function saveJSON() {
    const updatedJSON = {
        PC: PC,
    };

    const jsonString = JSON.stringify(updatedJSON, null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });

    const handle = await window.showSaveFilePicker({
        suggestedName: 'soullink-save.json',
        types: [
            {
                description: "JSON",
                accept: { "application/json": [".json"] },
            },
        ],
    });

    const writableStream = await handle.createWritable(opts);

    await writableStream.write(blob);

    await writableStream.close();
}

function applyJSON() {
    const updatedJSON = {
        PC: PC,
    };
    document.getElementById("jsonInput").value = JSON.stringify(updatedJSON, null, 4);
}


/* =============================
        Combination Section
============================= */

function findValidCombinations(PC) {
    allCombinations = [];
    findCombinations(0, PC, [], new Set(), allCombinations);
    allCombinations = removeSubsets(allCombinations);
    showFilterPopup();
}

function findCombinations(index, PC, chosenPC, usedAttributes, results) {
    if (index === PC.length) {
        // Push a copy of the chosenPC array if it's not empty
        if (chosenPC.length > 0) {
            results.push([...chosenPC]);
        }
        return;
    }

    const pokemon = PC[index];
    const item1 = pokemon.type1;
    const item2 = pokemon.type2;

    if (!usedAttributes.has(item1) && !usedAttributes.has(item2)) {
        chosenPC.push(pokemon);
        usedAttributes.add(item1);
        usedAttributes.add(item2);

        findCombinations(index + 1, PC, chosenPC, usedAttributes, results);

        chosenPC.pop();
        usedAttributes.delete(item1);
        usedAttributes.delete(item2);
    }

    findCombinations(index + 1, PC, chosenPC, usedAttributes, results);
}

function removeSubsets(results) {
    return results.filter((combo, i, allResults) =>
        !allResults.some((otherCombo, j) =>
            j !== i &&
            combo.length < otherCombo.length &&
            combo.every(obj => otherCombo.some(o => o.nickname === obj.nickname))
        )
    );
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

    const uniqueNames = [...new Set(allCombinations.flatMap(combo => combo.map(item => item.nickname)))];

    const column1 = document.createElement("div");
    column1.classList.add("filter-column");
    const column2 = document.createElement("div");
    column2.classList.add("filter-column");

    uniqueNames.forEach((nickname, index) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" value="${nickname}"> ${nickname}`;

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
        selectedNames.every(nickname => combo.some(item => item.nickname === nickname))
    );

    if (filteredCombinations.length == 0) {
        const element = document.createElement("p");
        element.innerHTML = "None";
        combinationsDiv.appendChild(element);
    } else {
            filteredCombinations.forEach(combo => {
            const div = document.createElement("div");
            div.classList.add("combination");
            div.innerHTML = `${combo.map(i => i.nickname).join(", ")}`;
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

    combo.forEach((poke) => {
        const row1 = document.createElement("tr");
        row1.innerHTML = `
            <td>${poke.name1}</td>
            <td>${poke.type1}</td>`;
        tablePC1.appendChild(row1);

        const row2 = document.createElement("tr");
        row2.innerHTML = `
            <td>${poke.name2}</td>
            <td>${poke.type2}</td>`;
        tablePC2.appendChild(row2);
    });

    modalContent.appendChild(tablePC1);
    modalContent.appendChild(tablePC2);

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
    const pcList = document.getElementById("pcList");
    pcList.innerHTML = "";

    PC.forEach((item, index) => {
        pcList.appendChild(createEditableRow(item, index, "PC"));
    });
}

function createEditableRow(item, index, setName) {

    const nicknameInput = document.createElement("input");
    nicknameInput.value = item.nickname;
    nicknameInput.classList.add("nickname-input");

    const nameInput1 = document.createElement("input");
    nameInput1.value = item.name1;
    nameInput1.classList.add("name-input");

    const nameInput2 = document.createElement("input");
    nameInput2.value = item.name2;
    nameInput2.classList.add("name-input");

    const areaInput = document.createElement("input");
    areaInput.value = item.area;
    areaInput.classList.add("area-input");

    const typeSelect1 = document.createElement("select");
    poketypes.forEach(pokeType => {
        const option = document.createElement("option");
        option.value = pokeType.type;
        option.textContent = pokeType.type;
        if (pokeType.type === item.type1) {
            option.selected = true;
        }
        typeSelect1.appendChild(option);
    });
    typeSelect1.classList.add("type-input");

    const typeSelect2 = document.createElement("select");
    poketypes.forEach(pokeType => {
        const option = document.createElement("option");
        option.value = pokeType.type;
        option.textContent = pokeType.type;
        if (pokeType.type === item.type2) {
            option.selected = true;
        }
        typeSelect2.appendChild(option);
    });
    typeSelect2.classList.add("type-input");

    nicknameInput.oninput = (event) => debouncedUpdateData(index, setName, "nickname", event.target.value);
    nameInput1.oninput = (event) => debouncedUpdateData(index, setName, "name1", event.target.value);
    nameInput2.oninput = (event) => debouncedUpdateData(index, setName, "name2", event.target.value);
    areaInput.oninput = (event) => debouncedUpdateData(index, setName, "area", event.target.value);
    typeSelect1.onchange = (event) => debouncedUpdateData(index, setName, "type1", event.target.value);
    typeSelect2.onchange = (event) => debouncedUpdateData(index, setName, "type2", event.target.value);

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-button");
    removeBtn.textContent = "X";
    removeBtn.onclick = () => removeRow(index, setName);

    const basic = document.createElement("div");
    basic.classList.add("basic");
    basic.appendChild(nicknameInput);
    basic.appendChild(areaInput);

    const poke1 = document.createElement("div");
    poke1.classList.add("pc1");
    poke1.appendChild(nameInput1);
    poke1.appendChild(typeSelect1);

    const poke2 = document.createElement("div");
    poke2.classList.add("pc2");
    poke2.appendChild(nameInput2);
    poke2.appendChild(typeSelect2);

    const team = document.createElement("div");
    team.classList.add("team");
    team.appendChild(poke1);
    team.appendChild(poke2);

    const div = document.createElement("div");
    div.classList.add("entry");
    div.appendChild(basic);
    div.appendChild(team);
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
    PC[index][key] = value;
    displayEditableLists();
    applyJSON();
}, 300);

function addRow() {
    const newRow = { nickname: "", name1: "", name2: "", area: "", type: poketypes[0].type };

    PC.push(newRow);

    displayEditableLists();
}

function removeRow(index) {
    if (PC.length > 1) {
        PC.splice(index, 1);
        displayEditableLists();
    } else {
        showModalAlert("You must have at least one row.");
    }
}

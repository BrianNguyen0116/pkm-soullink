let allCombinations = [];
let PC = [];

// Massive Poke-dictionary because no-nodejs fun times
const poketypes = [
    { type: "Normal", resistantTo: [], weakTo: ["Fighting"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/1.png" },
    { type: "Fire", resistantTo: ["Bug", "Fairy", "Fire", "Grass", "Ice", "Steel"], weakTo: ["Ground", "Rock", "Water"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/10.png" },
    { type: "Water", resistantTo: ["Fire", "Ice", "Steel"], weakTo: ["Electric", "Grass"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/11.png" },
    { type: "Grass", resistantTo: ["Electric", "Ground", "Water"], weakTo: ["Fire", "Ice", "Flying", "Bug", "Poison"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/12.png" },
    { type: "Electric", resistantTo: ["Flying", "Steel"], weakTo: ["Ground"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/13.png" },
    { type: "Ice", resistantTo: ["Flying", "Dragon", "Grass", "Ground"], weakTo: ["Fire", "Fighting", "Rock", "Steel"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/15.png" },
    { type: "Fighting", resistantTo: ["Bug", "Dark", "Rock"], weakTo: ["Fairy", "Flying", "Psychic"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/2.png" },
    { type: "Poison", resistantTo: ["Bug", "Fairy"], weakTo: ["Ground", "Psychic"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/4.png" },
    { type: "Ground", resistantTo: ["Electric", "Poison", "Rock", "Steel", "Fire"], weakTo: ["Water", "Ice", "Grass"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/5.png" },
    { type: "Flying", resistantTo: ["Bug", "Fairy", "Fighting"], weakTo: ["Electric", "Ice", "Rock"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/3.png" },
    { type: "Psychic", resistantTo: ["Fighting", "Psychic"], weakTo: ["Bug", "Dark", "Ghost"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/14.png" },
    { type: "Bug", resistantTo: ["Fighting", "Grass", "Psychic"], weakTo: ["Fire", "Flying", "Rock"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/7.png" },
    { type: "Rock", resistantTo: ["Bug", "Fire", "Flying", "Normal"], weakTo: ["Fighting", "Ground", "Steel", "Water"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/6.png" },
    { type: "Ghost", resistantTo: ["Bug", "Ghost", "Psychic"], weakTo: ["Dark", "Ghost"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/8.png" },
    { type: "Dragon", resistantTo: ["Dragon"], weakTo: ["Fairy", "Ice", "Dragon"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/16.png" },
    { type: "Dark", resistantTo: ["Ghost", "Psychic"], weakTo: ["Fighting", "Bug", "Fairy"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/17.png" },
    { type: "Steel", resistantTo: ["Bug", "Dark", "Dragon", "Fairy", "Flying", "Grass", "Ice", "Normal", "Psychic", "Rock", "Steel"], weakTo: ["Fighting", "Fire", "Ground"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/9.png" },
    { type: "Fairy", resistantTo: ["Dark", "Dragon", "Fighting"], weakTo: ["Poison", "Steel"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/18.png" }
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
    document.getElementById("combinations").innerHTML = "<h3>Valid Combinations:</h3>";

    try {
        const jsonData = JSON.parse(document.getElementById("jsonInput").value);

        PC = jsonData;

        const req = [
            { key: "name1" },
            { key: "name2" },
            { key: "type1" },
            { key: "type2" }
        ];

        for (const obj of [...PC]) {

            const missing = req.filter(attr => !obj[attr.key]);
            if (missing.length) {
                throw new Error(`Missing attributes: ${obj.nickname}`);
            }
            
            // Validate types in one step
            ["type1", "type2"].forEach(typeKey => {
                if (!poketypes.some(p => p.type === obj[typeKey])) {
                    throw new Error(`Invalid type "${obj[typeKey]}" found. Must be one of: ${poketypes.map(p => p.type).join(", ")}`);
                }
            });
        }

        displayEditableLists();

    } catch (e) {
        showModalAlert("Invalid JSON: " + e.message);
        return;
    }

    findValidCombinations(PC);
}


/* =============================
        Poke Util Section 
============================= */

async function getPokemonInfo() {
    const pokemonName = document.getElementById('pokemonNameInput').value.toLowerCase();
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`;

    document.getElementById('pokemonInfo').innerHTML = '';

    try {
        const response = await fetch(pokemonUrl);
        const data = await response.json();

        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        
        const captureRate = speciesData.capture_rate;
        const captureRatePercentage = Math.abs(((255 - (captureRate * 255)) / 255) / 255).toFixed(2) * 100;

        const types = data.types.map(typeInfo => String(typeInfo.type.name).charAt(0).toUpperCase() + String(typeInfo.type.name).slice(1));
        const { resistantTo, weakTo } = getStrengthsAndWeaknesses(types);

        const createInfoElement = (id, label, content) => {
            const div = document.createElement("div");
            div.id = id;
            div.innerHTML = `<strong>${label}:</strong> ${content}`;
            return div;
        };
        
        const pokeName = document.createElement("h3");
        pokeName.id = "pokemonName";
        pokeName.innerText = `${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)} Info`;
        
        const pokeImg = document.createElement("img");
        pokeImg.src = await getPokemonImage(pokemonName);
        
        const pokeTypes = createInfoElement("types", "Types", types.join(", "));
        const pokeCapture = createInfoElement("captureRate", "Capture Rate", `${captureRate} (${captureRatePercentage}%)`);

        // Create Weaknesses and Resistances Div Containers
        const createTypeImageCollection = (types, label) => {
            const containerDiv = document.createElement("div");
            const labelElement = document.createElement("h3");
            labelElement.innerText = label;
            containerDiv.appendChild(labelElement);

            const imagesDiv = document.createElement("div");
            imagesDiv.classList.add("collection");

            types.forEach(type => {
                const typeInfo = poketypes.find(t => t.type === type);
                if (typeInfo) {
                    const img = document.createElement("img");
                    img.src = typeInfo.image; // Use the image URL from poketypes
                    img.alt = type;
                    imagesDiv.appendChild(img);
                }
            });
            
            containerDiv.appendChild(imagesDiv);
            return containerDiv;
        };

        const pokeResist = createTypeImageCollection(resistantTo, "Resistances");
        const pokeWeak = createTypeImageCollection(weakTo, "Weaknesses");
        
        const div = document.createElement("div");
        div.append(pokeName, pokeImg, pokeCapture, pokeTypes, pokeResist, pokeWeak);
        
        document.getElementById('pokemonInfo').appendChild(div);
    } catch (error) {
        showModalAlert('Error fetching Pokémon data. Please try again.');
    }
}

function getStrengthsAndWeaknesses(types) {
    let resistantTo = [];
    let weakTo = [];

    // Loop through each type and add corresponding resistances and weaknesses
    types.forEach(type => {
        const typeInfo = poketypes.find(t => t.type === type);
        if (typeInfo) {
            resistantTo = [...new Set([...resistantTo, ...typeInfo.resistantTo])];
            weakTo = [...new Set([...weakTo, ...typeInfo.weakTo])];
        }
    });

    // Now we need to handle the case where types both strong and weak to another type
    let finalStrongTo = [];
    let finalWeakTo = [];

    // Determine final resistances and weaknesses by checking for conflicts
    resistantTo.forEach(str => {
        if (weakTo.includes(str)) {
            // Remove from both if it's in both
            weakTo = weakTo.filter(item => item !== str);
        } else {
            finalStrongTo.push(str);
        }
    });

    weakTo.forEach(weak => {
        if (!resistantTo.includes(weak)) {
            finalWeakTo.push(weak);
        }
    });

    return { resistantTo: finalStrongTo, weakTo: finalWeakTo };
}


async function getPokemonImage(name) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!response.ok) throw new Error("Pokemon not found");
        const data = await response.json();
        return data.sprites.front_default;
    } catch (error) {
        showModalAlert(`Error fetching image for ${name}:`, error);
        return "";
    }
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

    if (!PC) {
        throw new Error("PC data is required to save the JSON.");
    }

    const jsonString = JSON.stringify(PC, null, 4);
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

    const writableStream = await handle.createWritable();

    await writableStream.write(blob);

    await writableStream.close();
}

function applyJSON() {
    document.getElementById("jsonInput").value = JSON.stringify(PC, null, 4);
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
        selectedNames.every(nickname => combo.some(item => item.nickname === nickname)),
    );

    filteredCombinations.sort((a, b) => b.length - a.length);

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

async function displayEditableLists() {
    const pcList = document.getElementById("pcList");
    pcList.innerHTML = "";

    for (const [index, item] of PC.entries()) {
        const row = await createEditableRow(item, index, "PC");
        pcList.appendChild(row);  // Ensure this is always a valid DOM node
    }
}

async function createEditableRow(item, index, setName) {
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
            typeSelect1.classList.add(pokeType.type);
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
            typeSelect2.classList.add(pokeType.type);
        }
        typeSelect2.appendChild(option);
    });
    typeSelect2.classList.add("type-input");

    const addInputEvents = (element, attr, eventType) => {
        element[eventType] = (event) => debouncedUpdateData(index, attr, event.target.value);
        element.onblur = (event) => updateData(index, attr, event.target.value);
    };
    
    addInputEvents(nicknameInput, "nickname", "oninput");
    addInputEvents(nameInput1, "name1", "oninput");
    addInputEvents(nameInput2, "name2", "oninput");
    addInputEvents(areaInput, "area", "oninput");
    addInputEvents(typeSelect1, "type1", "onchange");
    addInputEvents(typeSelect2, "type2", "onchange");

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

    const name1Img = document.createElement("img");
    const name2Img = document.createElement("img");

    name1Img.src = await getPokemonImage(item.name1);
    name2Img.src = await getPokemonImage(item.name2);

    name1Img.alt = item.name1;
    name2Img.alt = item.name2;

    const display = document.createElement("div");
    display.classList.add("display");
    display.appendChild(name1Img);
    display.appendChild(name2Img);

    const div = document.createElement("div");
    div.classList.add("entry");
    div.appendChild(basic);
    div.appendChild(display);
    div.appendChild(team);
    div.appendChild(removeBtn);

    return div;
}

function updateSelectBoxes() {
    const selectBoxes = document.querySelectorAll("#pcList select");

    selectBoxes.forEach(select => {
        const selectedValue = select.value;
        select.className = "";
        select.classList.add("type-input", selectedValue); 
    });
}

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

const debouncedUpdateData = debounce((index, key, value) => {
    PC[index][key] = value;
    updateSelectBoxes();
    applyJSON();
}, 300);

function updateData(index, key, value) {
    PC[index][key] = value;
    updateSelectBoxes();
    applyJSON();
}

function addRow() {
    const newRow = { nickname: "", name1: "", name2: "", area: "", type1: poketypes[0].type, type2: poketypes[0].type };

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


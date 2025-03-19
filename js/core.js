import { showModalAlert, closeCombinationModal } from "./qol.js";
import { showFilterPopup } from "./filter.js";
import * as element from "./element.js";
import * as interact from "./element-interact.js";
import { getPrimaryType, getPokemonList } from "./poke.js";
import { poketypes } from "./poke-types.js";
import { setPC, getPC, getCombinations, setCombinations } from "./data.js";
import { applyJSON } from "./filehandler.js";

/* =============================
        Input Section
============================= */
export function processInput() {
    document.getElementById("combinations").innerHTML = "<h3>Valid Combinations:</h3>";

    try {
        const jsonData = JSON.parse(document.getElementById("jsonInput").value);

        setPC(jsonData);

        const req = [
            { key: "name1" },
            { key: "name2" },
            { key: "type1" },
            { key: "type2" }
        ];

        for (const obj of [...getPC()]) {

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

    findValidCombinations(getPC());
}


/* =============================
        Combination Section
============================= */

function findValidCombinations(PC) {
    const combinations = [];
    findCombinations(0, PC, [], new Set(), combinations);
    setCombinations(combinations);
    showFilterPopup();
}

function findCombinations(index, PC, chosenPC, usedAttributes, results) {
    if (index === PC.length) {
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


/* =============================
        Output Section
============================= */

export function displayCombinations(selectedNames) {
    const combinationsDiv = document.getElementById("combinations");
    combinationsDiv.innerHTML = "<h3>Valid Combinations:</h3>";

    const filteredCombinations = getCombinations().filter(combo =>
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
                <button id="closeCombinationModal">Close</button>
            </div>`;
        document.body.appendChild(modal);
    }

    document.getElementById("closeCombinationModal").addEventListener("click", function () {
        closeCombinationModal();
    });

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

/* =============================
        Form Section 
============================= */

export async function displayEditableLists() {
    const pcList = document.getElementById("pcList");
    pcList.innerHTML = "";

    const rows = await Promise.all(getPC().map((item, index) => createEditableRow(item, index, "PC")));
    pcList.append(...rows);
}

async function createEditableRow(item, index, setName) {
    const nicknameInput = element.createInputElement("nickname-input", item.nickname);
    const areaInput = element.createInputElement("area-input", item.area);

    const typeSelect1 = element.createTypeSelect(item.type1);
    const typeSelect2 = element.createTypeSelect(item.type2);    

    const nameSelect1 = element.createSearchableSelect(await getPokemonList(), index, "name1", item.name1);
    const nameSelect2 = element.createSearchableSelect(await getPokemonList(), index, "name2", item.name2);

    interact.addInputEvents(nicknameInput, index, "nickname", "oninput");
    interact.addInputEvents(areaInput, index, "area", "oninput");
    interact.addInputEvents(typeSelect1, index, "type1", "onchange");
    interact.addInputEvents(typeSelect2, index, "type2", "onchange");

    const removeBtn = element.createRemoveButton(index, setName);

    const basic = element.createDivWithClass("basic", nicknameInput, areaInput);
    const poke1 = element.createDivWithClass("pc1", nameSelect1, typeSelect1);
    const poke2 = element.createDivWithClass("pc2", nameSelect2, typeSelect2);
    const team = element.createDivWithClass("team", poke1, poke2);

    const [name1Img, name2Img] = await element.createPokemonImages(item.name1, item.name2);
    interact.attachImageClickEvent(name1Img, item.name1);
    interact.attachImageClickEvent(name2Img, item.name2);
    name1Img.classList.add("name1");
    name2Img.classList.add("name2");
    const display = element.createDivWithClass("display", name1Img, name2Img);
    
    const div = document.createElement("div");
    div.classList.add("entry");
    div.appendChild(basic);
    div.appendChild(display);
    div.appendChild(team);
    div.appendChild(removeBtn);

    return div;
}

export function updateSelectBoxes() {
    const selectBoxes = document.querySelectorAll("#pcList select");

    selectBoxes.forEach(select => {
        const selectedValue = select.value;
        select.className = "";
        select.classList.add("type-input", selectedValue); 
    });
}

export async function updateImage(index, attr, newName) {
    try {
        const entry = document.querySelectorAll(".entry")[index];
        if (!entry) {
            console.warn(`Entry at index ${index} not found.`);
            return;
        }

        const imageSelector = attr === "name1" ? ".display .name1" : ".display .name2";
        const image = entry.querySelector(imageSelector);

        if (!image) {
            console.warn(`Image element for ${attr} not found in entry ${index}.`);
            return;
        }

        if (image.alt.trim().toLowerCase() !== newName.trim().toLowerCase()) {
            const newSrc = await getPokemonImage(newName);
            if (newSrc && newSrc !== image.src) {
                image.src = newSrc;
                image.alt = newName;
                console.log(`Updated ${attr} image to: ${newSrc}`);
            }
        }
    } catch (error) {
        showModalAlert(`Error updating image for ${attr} at index ${index}:`, error);
    }
}

export async function addRow() {
    const pokemonList = await getPokemonList();
    const pokemon1 = pokemonList[Math.floor(Math.random() * 1303)];
    const pokemon2 = pokemonList[Math.floor(Math.random() * 1303)];

    const newRow = { 
        nickname: "", 
        name1: pokemon1, 
        name2: pokemon2, 
        area: "", 
        type1: await getPrimaryType(pokemon1), 
        type2: await getPrimaryType(pokemon2) 
    };

    let temp = getPC();
    temp.push(newRow);
    setPC(temp);

    applyJSON();
    displayEditableLists();
}

export function removeRow(index) {
    let temp = getPC();

    if (temp.length > 1) {
        temp.splice(index, 1);
        setPC(temp);
        applyJSON();
        displayEditableLists();
    } else {
        showModalAlert("You must have at least one row.");
    }
}


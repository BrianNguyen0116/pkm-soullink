import { processInput,  addRow, displayEditableLists } from "./core.js";
import { setPC } from "./data.js";
import { applyFilter, closeFilterPopup } from "./filter.js";
import { closeModalAlert, closeCombinationModal, insertTabCharacter } from "./qol.js";
import { addSearchEvent } from "./element-interact.js";
import { getPokemonList } from "./poke.js";
import { saveJSON, uploadJSON } from "./filehandler.js";

window.onload = async () => {
    const savedJsonInput = localStorage.getItem('jsonInput');

    if (savedJsonInput) {
        document.getElementById('jsonInput').value = savedJsonInput;
        setPC(JSON.parse(savedJsonInput));
    } else {
        localStorage.setItem('jsonInput', document.getElementById('jsonInput').value);
        setPC(JSON.parse(document.getElementById('jsonInput').value));
    }
    
    document.getElementById('jsonInput').addEventListener('input', (e) => {
        localStorage.setItem('jsonInput', e.target.value);
    });

    document.getElementById('save').addEventListener("click", async function () {
        await saveJSON();
    });    
    
    document.getElementById('file').addEventListener("change", (e) => {
        uploadJSON(e);
    });

    document.getElementById('upload').addEventListener("click", () => {
        document.getElementById('file').click();
    });

    document.getElementById('process').addEventListener("click", function () {
        processInput();
    });

    document.getElementById('applyFilter').addEventListener("click", function () {
        applyFilter();
    });    
    
    document.getElementById('closeFilter').addEventListener("click", function () {
        closeFilterPopup();
    });
    
    document.getElementById("row-button").addEventListener("click", async function () {
        await addRow();
    });

    document.getElementById("closeModal").addEventListener("click", function () {
        closeModalAlert();
    });


    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape')
            if (document.getElementById("customAlert").style.display === "block") {
            closeModalAlert();
            } else if (document.getElementById("combinationModal").style.display === "block") {
                closeCombinationModal();
            }
        }
    );

    document.querySelector("textarea").addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertTabCharacter();
        }
    });
    
    document.getElementById('pokemonNameInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            getPokemonInfo();
        }
    });
    


    const pokemonInput = document.getElementById("pokemonNameInput");
    const dropdown = document.createElement("div");
    dropdown.classList.add("searchable-dropdown");
    document.getElementById("calculator").appendChild(dropdown);
    addSearchEvent(await getPokemonList(), pokemonInput, dropdown);
    displayEditableLists();
}
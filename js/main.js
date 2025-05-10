import { processInput, addRow, displayEditableLists } from "./core.js";
import { setPC } from "./data.js";
import { applyFilter, closeFilterPopup } from "./filter.js";
import { closeModalAlert, closeCombinationModal, insertTabCharacter, showModalAlert } from "./qol.js";
import { addSearchEvent } from "./element-interact.js";
import { getPokemonList } from "./poke.js";
import { saveJSON, uploadJSON } from "./filehandler.js";

window.onload = async () => {
    const elements = {
        jsonInput: document.getElementById("jsonInput"),
        saveBtn: document.getElementById("save"),
        fileInput: document.getElementById("file"),
        uploadBtn: document.getElementById("upload"),
        processBtn: document.getElementById("process"),
        applyFilterBtn: document.getElementById("applyFilter"),
        closeFilterBtn: document.getElementById("closeFilter"),
        rowButton: document.getElementById("row-button"),
        closeModalBtn: document.getElementById("closeModal"),
        pokemonInput: document.getElementById("pokemonNameInput"),
        calculator: document.getElementById("calculator"),
    };

    const eventMap = [
        { element: elements.jsonInput, event: "input", handler: (e) => localStorage.setItem("jsonInput", e.target.value) },
        { element: elements.saveBtn, event: "click", handler: async () => await saveJSON() },
        { element: elements.fileInput, event: "change", handler: uploadJSON },
        { element: elements.uploadBtn, event: "click", handler: () => elements.fileInput.click() },
        { element: elements.processBtn, event: "click", handler: processInput },
        { element: elements.applyFilterBtn, event: "click", handler: applyFilter },
        { element: elements.closeFilterBtn, event: "click", handler: closeFilterPopup },
        { element: elements.rowButton, event: "click", handler: async () => await addRow() },
        { element: elements.closeModalBtn, event: "click", handler: closeModalAlert },
    ];

    ;

    try {
        const savedJsonInput = localStorage.getItem("jsonInput");
        if (savedJsonInput) {
            elements.jsonInput.value = savedJsonInput;
            setPC(JSON.parse(savedJsonInput));
        } else {
            localStorage.setItem("jsonInput", elements.jsonInput.value);
            setPC(JSON.parse(elements.jsonInput.value));
        }
    } catch (error) {
        showModalAlert("Error reading JSON data.", error);
    }

    eventMap.forEach(({ element, event, handler }) => {
        if (element) element.addEventListener(event, handler);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "Enter" ) {
            if (document.getElementById("customAlert").style.display === "block") {
                closeModalAlert();
            } else if (document.getElementById("combinationModal").style.display === "block") {
                closeCombinationModal();
            }
        }
    });

    document.querySelector("textarea").addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            insertTabCharacter();
        }
    });

    elements.pokemonInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            getPokemonInfo();
        }
    });

    const dropdown = document.createElement("div");
    dropdown.classList.add("searchable-dropdown");
    elements.calculator.appendChild(dropdown);
    addSearchEvent(await getPokemonList(), elements.pokemonInput, dropdown);

    displayEditableLists();
};
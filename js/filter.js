/* =============================
        Filter Section
============================= */

import { getCombinations } from "./data.js";
import { displayCombinations } from "./core.js";

export function showFilterPopup() {
    const filterPopup = document.getElementById("filterPopup");
    const overlay = document.getElementById("overlay");
    const filterOptions = document.getElementById("filterOptions");

    const filterTable = document.createElement("div");
    filterTable.classList.add("filter-table");

    filterOptions.innerHTML = "";

    const uniqueNames = [...new Set(getCombinations().flatMap(combo => combo.map(item => item.nickname)))];

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

export function applyFilter() {
    const selectedNames = [...document.querySelectorAll('#filterOptions input:checked')].map(input => input.value);
    displayCombinations(selectedNames);
    document.getElementById("filterPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

export function closeFilterPopup() {
    document.getElementById("filterPopup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    document.getElementById("combinations").innerHTML = `<div id="grass"></div>`;
}
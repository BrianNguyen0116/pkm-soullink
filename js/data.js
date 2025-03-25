/* =============================
        PC Section
============================= */
import { updateSelectBoxes, updateImage, displayEditableLists } from "./core.js";
import { showModalAlert } from "./qol.js";
import { getPrimaryType } from "./poke.js";
import { applyJSON } from "./filehandler.js";

let PC = [];
let allCombinations = [];

export function setPC(obj) {
    try {
        PC = obj;
    } catch (error) {
        showModalAlert("Error setting PC object.", error )
    }
}

export function setPCValue(index, key, value) {
    try {
        PC[index][key] = value;
    } catch (error) {
        showModalAlert("Error while setting PC value.", error)
    }
}

export function getPC() {
    return PC;
}

/* =============================
    Combination Section
============================= */

export function setCombinations(obj) {
    try {
        allCombinations = removeSubsets(obj);
    } catch (error) {
        showModalAlert("Error setting combination object.", error )
    }
}

export function getCombinations() {
    return allCombinations;
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

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

export const debouncedUpdateData = debounce((index, key, value) => {
    PC[index][key] = value;
    updateSelectBoxes();
    applyJSON();
}, 300);

export async function updateData(index, key, value) {
    PC[index][key] = value;

    if (key === "name1" || key === "name2") {
        await updateImage(index, key, value);
        PC[index][`type${key.charAt(key.length - 1)}`] = await getPrimaryType(value);
        displayEditableLists();
    }

    applyJSON();
}
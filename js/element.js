import { poketypes } from "./poke-types.js";
import { getPokemonImage } from "./poke.js";
import { addSelectEvents } from "./element-interact.js";
import { removeRow } from "./core.js";

export function createTypeImageCollection (types, label) {
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("stats");

    const labelElement = document.createElement("div");
    labelElement.innerText = label;
    labelElement.classList.add(label);
    labelElement.classList.add("label");
    containerDiv.appendChild(labelElement);

    const imagesDiv = document.createElement("div");
    imagesDiv.classList.add(`${label}-sub`);
    imagesDiv.classList.add("collection");

    types.forEach(type => {
        const typeInfo = poketypes.find(t => t.type === type);
        if (typeInfo) {
            const img = document.createElement("img");
            img.src = typeInfo.image; 
            img.alt = type;
            imagesDiv.appendChild(img);
        }
    });
    
    containerDiv.appendChild(imagesDiv);
    return containerDiv;
};

export function createInputElement(className, value) {
    const input = document.createElement("input");
    input.value = value;
    input.classList.add(className);
    return input;
}

export function createTypeSelect(selectedType) {
    const select = document.createElement("select");
    select.classList.add(selectedType);
    poketypes.forEach(pokeType => {
        const option = document.createElement("option");
        option.value = pokeType.type;
        option.textContent = pokeType.type;
        if (pokeType.type === selectedType) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    select.classList.add("type-input");
    return select;
}

export function createSearchableSelect(list, index, attr, selectedValue) {
    const container = document.createElement("div");
    container.classList.add("searchable-container");

    const input = document.createElement("input");
    input.type = "text";
    input.value = selectedValue || "";
    input.setAttribute("autocomplete", "off");

    const dropdown = document.createElement("div");
    dropdown.classList.add("searchable-dropdown");

    addSelectEvents(list, input, dropdown, index, attr);

    container.appendChild(input);
    container.appendChild(dropdown);
    return container;
}


export function createRemoveButton(index, setName) {
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-button");
    removeBtn.textContent = "X";
    removeBtn.onclick = () => removeRow(index, setName);
    return removeBtn;
}

export function createDivWithClass(className, ...children) {
    const div = document.createElement("div");
    div.classList.add(className);
    div.append(...children);
    return div;
}

export async function createPokemonImages(name1, name2) {
    const name1Img = await createPokemonImage(name1);
    const name2Img = await createPokemonImage(name2);
    return [name1Img, name2Img];
}

export async function createPokemonImage(pokemonName) {
    const img = document.createElement("img");
    try {
        img.classList.add(pokemonName);
        img.src = await getPokemonImage(pokemonName);
    } catch {
        img.classList.add;
        img.src = '';
    }
    img.alt = pokemonName;
    return img;
}
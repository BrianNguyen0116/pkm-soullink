
import { updateData, debouncedUpdateData } from "./data.js";
import { getPokemonInfo, getPokemonList } from "./poke.js";

export function attachImageClickEvent(image, pokemonName) {
    try {
        image.addEventListener('click', () => {
            document.getElementById('pokemonNameInput').value = pokemonName;
            getPokemonInfo();
        });
    } catch {
        return '';
    }
}

export function addInputEvents(element, index, attr, eventType) {
    element[eventType] = (event) => {
        const newValue = event.target.value;
        debouncedUpdateData(index, attr, newValue);
    };

    element.onblur = (event) => updateData(index, attr, event.target.value);
}

export function addSearchEvent(list, item, dropdown) {
    item.addEventListener("input", () => {
        dropdown.innerHTML = "";
        const searchValue = item.value.toLowerCase();
        if (!searchValue) {
            dropdown.style.display = "none";
            return;
        }
        
        const filteredList = list.filter(pokemon => pokemon
            .toLowerCase()
            .includes(searchValue))
            .slice(0, 10);

        filteredList.forEach(name => {
            const option = document.createElement("div");
            option.textContent = name;
            option.classList.add("dropdown-item");

            option.onclick = () => {
                item.value = name;
                dropdown.style.display = "none";
            };

            dropdown.appendChild(option);
        });

        dropdown.style.display = "block"; 
    });

    item.addEventListener("blur", () => {
        setTimeout(() => {
            dropdown.style.display = "none";
            getPokemonInfo();
        }, 200);
    });
}

export function addSelectEvents(list, item, dropdown, index, attr) {
    item.addEventListener("input", () => {
        dropdown.innerHTML = "";
        const searchValue = item.value.toLowerCase();
        if (!searchValue) {
            dropdown.style.display = "none";
            return;
        }

        const filteredList = list.filter(pokemon => pokemon
            .toLowerCase()
            .includes(searchValue))
            .slice(0, 10);

        filteredList.forEach(name => {
            const option = document.createElement("div");
            option.textContent = name;
            option.classList.add("dropdown-item");
            option.onclick = () => {
                item.value = name;
                dropdown.style.display = "none";
            };
            dropdown.appendChild(option);
        });
        dropdown.style.display = "block";
    });

    item.addEventListener("blur", () => {
        setTimeout(() => {
            const newValue = item.value;
            dropdown.style.display = "none";
            updateData(index, attr, newValue);            
        }, 200);
    });
}
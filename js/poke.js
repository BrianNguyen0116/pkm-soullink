/* =============================
        Poke Util Section 
============================= */
import { showModalAlert } from "./qol.js";
import { getStrengthsAndWeaknesses } from "./poke-types.js"
import { createTypeImageCollection } from "./element.js";

export let pokemonList = []; 

export async function getPokemonInfo() {
    const pokemonName = document.getElementById('pokemonNameInput').value.toLowerCase();
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

    document.getElementById('pokemonInfo').innerHTML = '';

    try {
        const response = await fetch(pokemonUrl);
        const data = await response.json();

        const speciesUrl = data.species.url ? data.species.url : `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`;

        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        
        const captureRate = speciesData.capture_rate;

        const types = data.types.map(typeInfo => String(typeInfo.type.name).charAt(0).toUpperCase() + String(typeInfo.type.name).slice(1));
        const { resistantTo, weakTo, immuneTo } = getStrengthsAndWeaknesses(types);

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
        
        const pokeTypes = createTypeImageCollection(types, "Types");
        const pokeCapture = createInfoElement("captureRate", "Capture Rate", `${captureRate}`);

        const pokeResist = createTypeImageCollection(resistantTo, "Resistances");
        const pokeWeak = createTypeImageCollection(weakTo, "Weaknesses");
        const pokeImmune = createTypeImageCollection(immuneTo, "Immunities");

        const div = document.createElement("div");
        div.append(pokeName, pokeImg, pokeCapture, pokeTypes, pokeResist, pokeWeak, pokeImmune);
        
        document.getElementById('pokemonInfo').appendChild(div);
    } catch (error) {
        showModalAlert('Error fetching Pokémon data. Please try again.', error);
    }
}

export async function getPrimaryType(name) {
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${name}`;

    try {
        const response = await fetch(pokemonUrl);
        const data = await response.json();
        const type = String(data.types[0].type.name);
        return type.charAt(0).toUpperCase() + String(type).slice(1);
    } catch (error) {
        showModalAlert('Error fetching Pokémon data. Please try again.', error);
    }
}

export async function getPokemonImage(name) {
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

export async function getPokemonList() {
    if (pokemonList.length == 0) {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
        const data = await response.json();
        const dataUpper = data.results.map(pokemon => pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1));
        pokemonList = dataUpper;
        return dataUpper;
    } else {
        return pokemonList;
    }
}

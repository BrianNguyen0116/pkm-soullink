// Massive Poke-dictionary because no-nodejs fun times
export const poketypes = [
    { type: "Normal", resistantTo: [], weakTo: ["Fighting"], immuneTo: ["Ghost"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/1.png" },
    { type: "Fire", resistantTo: ["Bug", "Fire", "Grass", "Ice", "Steel", "Fairy"], weakTo: ["Ground", "Rock", "Water"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/10.png" },
    { type: "Water", resistantTo: ["Fire", "Water", "Ice", "Steel"], weakTo: ["Electric", "Grass"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/11.png" },
    { type: "Grass", resistantTo: ["Electric", "Ground", "Water"], weakTo: ["Fire", "Ice", "Flying", "Bug", "Poison"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/12.png" },
    { type: "Electric", resistantTo: ["Flying", "Electric", "Steel"], weakTo: ["Ground"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/13.png" },
    { type: "Ice", resistantTo: ["Ice"], weakTo: ["Fire", "Fighting", "Rock", "Steel"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/15.png" },
    { type: "Fighting", resistantTo: ["Bug", "Dark", "Rock"], weakTo: ["Fairy", "Flying", "Psychic"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/2.png" },
    { type: "Poison", resistantTo: ["Grass", "Fighting", "Poison", "Bug", "Fairy"], weakTo: ["Ground", "Psychic"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/4.png" },
    { type: "Ground", resistantTo: ["Poison", "Rock"], weakTo: ["Water", "Ice", "Grass"], immuneTo: ["Electric"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/5.png" },
    { type: "Flying", resistantTo: ["Bug", "Grass", "Fighting"], weakTo: ["Electric", "Ice", "Rock"], immuneTo: ["Ground"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/3.png" },
    { type: "Psychic", resistantTo: ["Fighting", "Psychic"], weakTo: ["Bug", "Dark", "Ghost"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/14.png" },
    { type: "Bug", resistantTo: ["Fighting", "Grass", "Ground"], weakTo: ["Fire", "Flying", "Rock"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/7.png" },
    { type: "Rock", resistantTo: ["Poison", "Fire", "Flying", "Normal"], weakTo: ["Fighting", "Ground", "Steel", "Water", "Grass"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/6.png" },
    { type: "Ghost", resistantTo: ["Bug", "Ghost"], weakTo: ["Dark", "Ghost"], immuneTo: ["Normal", "Fighting"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/8.png" },
    { type: "Dragon", resistantTo: ["Fire", "Water", "Grass", "Electric"], weakTo: ["Fairy", "Ice", "Dragon"], immuneTo: [], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/16.png" },
    { type: "Dark", resistantTo: ["Ghost", "Dark"], weakTo: ["Fighting", "Bug", "Fairy"], immuneTo: ["Psychic"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/17.png" },
    { type: "Steel", resistantTo: ["Bug", "Dark", "Dragon", "Fairy", "Flying", "Grass", "Ice", "Normal", "Psychic", "Rock", "Steel"], weakTo: ["Fighting", "Fire", "Ground"], immuneTo: ["Poison"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/9.png" },
    { type: "Fairy", resistantTo: ["Dark", "Dragon", "Fighting"], weakTo: ["Poison", "Steel"], immuneTo: ["Dark"], image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/legends-arceus/18.png" }
];

export function getStrengthsAndWeaknesses(types) {
    let resistantTo = [];
    let weakTo = [];
    let immuneTo = [];

    types.forEach(type => {
        const typeInfo = poketypes.find(t => t.type === type);
        if (typeInfo) {
            resistantTo = [...new Set([...resistantTo, ...typeInfo.resistantTo])];
            weakTo = [...new Set([...weakTo, ...typeInfo.weakTo])];
            immuneTo = [...new Set([...immuneTo, ...typeInfo.immuneTo])];
        }
    });

    let finalResistTo = [];
    let finalWeakTo = [];

    resistantTo.forEach(res => {
        if (weakTo.includes(res)) {
            weakTo = weakTo.filter(item => item !== res);
        } else {
            finalResistTo.push(res);
        }
    });

    weakTo.forEach(weak => {
        if (!resistantTo.includes(weak)) {
            finalWeakTo.push(weak);
        }
    });

    return { resistantTo: finalResistTo, weakTo: finalWeakTo, immuneTo };
}
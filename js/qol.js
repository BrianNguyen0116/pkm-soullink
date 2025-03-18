function showModalAlert(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("customAlert").style.display = "block";
}

function closeModalAlert() {
    document.getElementById("customAlert").style.display = "none";
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape')
        if (document.getElementById("customAlert").style.display === "block") {
        closeModalAlert();
        } else if (document.getElementById("combinationModal").style.display === "block") {
            closeCombinationModal();
        }
    }
);

const textarea = document.querySelector("textarea");

const insertTabCharacter = () => {
    const { value, selectionEnd } = textarea;

    textarea.value = `${value.substring(0, selectionEnd)}\t${value.substring(selectionEnd)}`;

    textarea.selectionStart = textarea.selectionEnd = selectionEnd + 1;
};

textarea.addEventListener('keydown', (e) => {
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
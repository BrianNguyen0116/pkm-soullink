function showModalAlert(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("customAlert").style.display = "block";
}

function closeModalAlert() {
    document.getElementById("customAlert").style.display = "none";
}

const textarea = document.querySelector("textarea");

const insertTabCharacter = () => {
    const { value, selectionStart, selectionEnd } = textarea;

    textarea.value = `${value.substring(0, selectionEnd)}\t${value.substring(selectionEnd)}`;

    textarea.selectionStart = textarea.selectionEnd = selectionEnd + 1;
};

textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        insertTabCharacter();
    }
});

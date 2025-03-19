export function showModalAlert(message, error) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("customAlert").style.display = "block";
    console.log(error);
}

export function closeModalAlert() {
    document.getElementById("customAlert").style.display = "none";
}

export function closeCombinationModal() {
    document.getElementById("combinationModal").style.display = "none";
}

export const insertTabCharacter = () => {
    textarea = document.querySelector("textarea");

    const { value, selectionEnd } = textarea;

    textarea.value = `${value.substring(0, selectionEnd)}\t${value.substring(selectionEnd)}`;

    textarea.selectionStart = textarea.selectionEnd = selectionEnd + 1;
};
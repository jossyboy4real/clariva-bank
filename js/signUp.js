let eyeIcon = document.getElementById("eyeIcon");
let eyeSlashIcon = document.getElementById("eyeSlashIcon");
let eyeIcons = document.getElementById("eyeIcons");
let eyeSlashIcons = document.getElementById("eyeSlashIcons");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmPassword");


eyeIcon.style.display = "none";
eyeSlashIcon.style.display = "none";
eyeIcons.style.display = "none";
eyeSlashIcons.style.display = "none";


password.addEventListener("input", () => {
    if (password.value.length === 0) {
        eyeIcon.style.display = "none";
        eyeSlashIcon.style.display = "none";
        password.type = "password";
    } else {
        eyeIcon.style.display = "block";
        eyeSlashIcon.style.display = "none";
    }
});

eyeIcon.addEventListener("click", () => {
    password.type = "text";
    eyeIcon.style.display = "none";
    eyeSlashIcon.style.display = "block";
});

eyeSlashIcon.addEventListener("click", () => {
    password.type = "password";
    eyeIcon.style.display = "block";
    eyeSlashIcon.style.display = "none";
});


confirmPassword.addEventListener("input", () => {
    if (confirmPassword.value.length === 0) { 
        eyeIcons.style.display = "none";
        eyeSlashIcons.style.display = "none";
        confirmPassword.type = "password"; 
    } else {
        eyeIcons.style.display = "block";
        eyeSlashIcons.style.display = "none";
    }
});

eyeIcons.addEventListener("click", () => {
    confirmPassword.type = "text";  
    eyeIcons.style.display = "none";
    eyeSlashIcons.style.display = "block";
});

eyeSlashIcons.addEventListener("click", () => {
    confirmPassword.type = "password"; 
    eyeIcons.style.display = "block";
    eyeSlashIcons.style.display = "none";
});
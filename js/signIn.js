
let email = document.getElementById("email");
let password = document.getElementById("password");
let signInBtn = document.getElementById("signInBtn");
let eyeIcon = document.getElementById("eyeIcon");
let eyeSlashIcon = document.getElementById("eyeSlashIcon");


 eyeIcon.style.display = "none"
    eyeSlashIcon.style.display = "none"

password.addEventListener("input", ()=>{
   if (password.value.length === 0) {
    eyeIcon.style.display = "none";
    eyeSlashIcon.style.display = "none";
    password.type = "password";
   } else {
    eyeIcon.style.display = "block";
    eyeSlashIcon.style.display = "none";
   }
});

eyeIcon.addEventListener("click", ()=>{
    if (password.type === "text") {
        password.type = "password";
        eyeIcon.style.display = "block";
        eyeSlashIcon.style.display = "none";
    } else {
        password.type = "text";
        eyeIcon.style.display = "none";
        eyeSlashIcon.style.display = "block";
    }
});

eyeSlashIcon.addEventListener("click", ()=>{
    if (password.type === password) {
        password.type = "text";
        eyeIcon.style.display = "none";
        eyeSlashIcon.style.display = "block";
    } else {
        password.type = "password";
        eyeIcon.style.display = "block";
        eyeSlashIcon.style.display = "none";
    }
});


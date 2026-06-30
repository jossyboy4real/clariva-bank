
let signIn =document.getElementById("signIn");

signIn.addEventListener("click", ()=>{
    window.location.href = "../signUp and signIn/signIn.html"
})



const phrases = [
    "Clariva Bank offers a new standard in financial services - combining institutional-grade security with the personal attention your wealth deserves."
];

const el = document.getElementById("typewriter");
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;

function type() {
    const current = phrases[phraseIndex];

    if (!deleting) {
        el.textContent = current.slice(0, ++charIndex);
        
        if (charIndex === current.length) {
            deleting = true;
            setTimeout(type, 1000);
            return;
        }

        setTimeout(type, 40);
        return;
    }

    el.textContent = current.slice(0, --charIndex);

    if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 50);
        return;
    }

    setTimeout(type, 10);
}

if (el) {
    setTimeout(type, 900);
}

let btn = document.getElementById("btn");

if (btn) {
    btn.addEventListener('click', () => {
        window.location.href = "./signUp and signIn/signup.html";
    });
}

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        mainNav.classList.toggle("active");
    });
}

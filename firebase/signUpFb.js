import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCN-IGECBY_PoTy4lW4OUU5WaVHx1q2A4s",
    authDomain: "clariva-297a8.firebaseapp.com",
    projectId: "clariva-297a8",
    storageBucket: "clariva-297a8.firebasestorage.app",
    messagingSenderId: "284798003607",
    appId: "1:284798003607:web:45d1f3a62d16301332bcd2",
    measurementId: "G-DED0W0JKWR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colref = collection(db, "users");
const auth = getAuth(app);

// Custom SweetAlert configuration for the dark theme
const swalConfig = {
    background: '#111',
    color: '#f5f0e8',
    confirmButtonColor: '#007bff',
};

// ACCOUNT NUMBER GENERATED
let accountNumber = Math.trunc(Math.random() * 10000000000);

let signupform = document.getElementById("signup");

signupform.addEventListener("click", async (e) => {
    e.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const userEmail = document.getElementById("email").value.trim();
    const userPhonenumber = document.getElementById("phonenumber").value.trim();
    const userPassword = document.getElementById("password").value.trim();
    const confirmPasswordVal = document.getElementById("confirmPassword").value.trim();
    const agreeTerms = document.getElementById("agree").checked; 

    const activeGenderBtn = document.querySelector("#genderRow .gender-btn.active");
    const gender = activeGenderBtn ? activeGenderBtn.textContent.trim() : "";
    const balance = document.getElementById("displayBal");

    // Global Empty Form Validation
    if (!fullname && !userEmail && !userPhonenumber && !userPassword && !confirmPasswordVal && !agreeTerms) {
        return Swal.fire({ ...swalConfig, title: "Empty Form", text: "Please fill in all the fields above.", icon: "warning" });
    }

    if (fullname === "") {
        return Swal.fire({ ...swalConfig, title: "Missing Field", text: "Please enter your full name.", icon: "warning" });
    }

    if (userEmail === "" || !userEmail.includes("@") || !userEmail.includes(".") || userEmail.indexOf("@") > userEmail.lastIndexOf(".")) {
        return Swal.fire({ ...swalConfig, title: "Invalid Email", text: "Please enter a valid email address.", icon: "warning" });
    }

    if (userPhonenumber === "") {
        return Swal.fire({ ...swalConfig, title: "Missing Field", text: "Please enter your phone number.", icon: "warning" });
    }

    if (userPhonenumber.length < 7 || userPhonenumber.length > 15 || isNaN(userPhonenumber)) {
        return Swal.fire({ ...swalConfig, title: "Invalid Phone", text: "Please enter a valid phone number (7–15 digits only).", icon: "warning" });
    }

    if (userPassword === "") {
        return Swal.fire({ ...swalConfig, title: "Missing Field", text: "Please enter a password.", icon: "warning" });
    }

    if (userPassword.length < 8) {
        return Swal.fire({ ...swalConfig, title: "Weak Password", text: "Password must be at least 8 characters.", icon: "warning" });
    }

    if (confirmPasswordVal === "") {
        return Swal.fire({ ...swalConfig, title: "Missing Field", text: "Please confirm your password.", icon: "warning" });
    }

    if (confirmPasswordVal !== userPassword) {
        return Swal.fire({ ...swalConfig, title: "Password Mismatch", text: "Passwords do not match.", icon: "warning" });
    }

    if (!agreeTerms) { 
        return Swal.fire({ ...swalConfig, title: "Terms Required", text: "Please agree to the Terms of Service to proceed.", icon: "warning" });
    }

    try {
        const userCredentials = await createUserWithEmailAndPassword(auth, userEmail, userPassword);

        await addDoc(colref, {
            uid: userCredentials.user.uid,
            fullname,
            userEmail,
            userPhonenumber,
            gender,
            agreeTerms,
            accountNumber,
            balance: 0
        });

        await Swal.fire({ 
            ...swalConfig,
            title: "Account Created!",
            text: "Your account has been successfully created.",
            icon: "success",
            confirmButtonText: "OK"
        });

        window.location.href = "../signUp and signIn/signIn.html";

    } catch (error) {
        console.error(error.message);

        if (error.code === "auth/email-already-in-use") {
            Swal.fire({ ...swalConfig, title: "Email Taken", text: "An account with this email already exists.", icon: "error" });
        } else if (error.code === "auth/invalid-email") {
            Swal.fire({ ...swalConfig, title: "Invalid Email", text: "Please enter a valid email address.", icon: "error" });
        } else {
            Swal.fire({ ...swalConfig, title: "Error", text: error.message, icon: "error" });
        }
    }
});

// Continue with Google
let googleSignUpBtn = document.getElementById("googleSignUpBtn");

googleSignUpBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const provider = new GoogleAuthProvider(); 

    try {
        const result = await signInWithPopup(auth, provider); 
        const user = result.user;

        await addDoc(colref, {
            uid: user.uid,
            fullname: user.displayName,
            userEmail: user.email,
            accountNumber: Math.trunc(Math.random() * 10000000000),
            balance: 0
        });

        window.location.href = "../signUp and signIn/signIn.html";

    } catch (error) {
        console.error(error.message);
        Swal.fire({ ...swalConfig, title: "Google Sign-Up Failed", text: error.message, icon: "error" });
    }
});

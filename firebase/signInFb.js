// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCN-IGECBY_PoTy4lW4OUU5WaVHx1q2A4s",
    authDomain: "clariva-297a8.firebaseapp.com",
    projectId: "clariva-297a8",
    storageBucket: "clariva-297a8.firebasestorage.app",
    messagingSenderId: "284798003607",
    appId: "1:284798003607:web:45d1f3a62d16301332bcd2",
    measurementId: "G-DED0W0JKWR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Email Sign In ---

// Renamed to avoid conflicts
const emailSignInBtn = document.getElementById("signInBtn");

if (emailSignInBtn) {
    emailSignInBtn.addEventListener("click", () => {
        // Correctly grabbing the input elements to check them
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!emailInput || !passwordInput || emailInput.value.trim() === "" || passwordInput.value.trim() === "") {
            Swal.fire({
                title: 'Warning!',
                text: 'Fill all The Fields Above...',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        const userEmail = emailInput.value.trim();
        const userPassword = passwordInput.value.trim();


        emailSignInBtn.innerText = "Signing in...";
        emailSignInBtn.disabled = true;

        signInWithEmailAndPassword(auth, userEmail, userPassword)
            .then((userCredential) => {
                console.log(userCredential.user);

                // Moved successful SweetAlert here so it only triggers on actual success
                Swal.fire({
                    title: 'Login Successful!',
                    text: 'Your account is successfully logged in.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
                window.location.href = "../Dashboard/userDashboard.html"

            })
            .catch((error) => {
                console.error("Login Error code:", error.code);

                if (error.code === "auth/network-request-failed") {
                    Swal.fire({ title: 'Error!', text: 'Poor internet connection.', icon: 'error' });
                } else {
                    Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
                }
            });
    });
}

// --- Google Sign In ---

const provider = new GoogleAuthProvider();
const googleSignInBtn = document.getElementById("googleSignInBtn");
let displayUser = document.getElementById("display");

if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then((response) => {
                console.log(response);

                Swal.fire({
                    title: 'Login Successful!',
                    text: 'Logged in with Google successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })


                window.location.href = "../Dashboard/userDashboard.html"
            })
            .catch(error => {
                console.log("Google sign-in error:", error.message);
                Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
            });
    });
}

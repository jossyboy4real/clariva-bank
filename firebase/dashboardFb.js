import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, runTransaction, serverTimestamp, addDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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
const auth = getAuth();
const db = getFirestore(app);


let currentLoggedUserDocId = null;
let currentLoggedUserData = null;
let targetRecipientDocId = null;
let targetRecipientData = null;

const swalTheme = { popup: 'custom-swal-popup' };

// ==========================================
// CORE AUTHENTICATION & INITIAL STATE MONITOR
// ==========================================
onAuthStateChanged(auth, async (user) => {
    const userName = document.getElementById("userName");
    const accountNumber = document.getElementById("accountNumber");
    const balance = document.getElementById("displayBal");
    const firstLetter = document.getElementById("firstLetter");
    const virtualCardHolder = document.getElementById("virtualCardHolder");
    const virtualCardNumber = document.getElementById("cardNumberMasked");
    const cardLinkedAccount = document.getElementById("cardLinkedAccount");

    if (!user) {
        if (userName) userName.textContent = "User 👋";
        if (accountNumber) accountNumber.textContent = "Not signed in";
        if (balance) balance.textContent = "₦ --";
        if (firstLetter) firstLetter.textContent = "?";
        if (virtualCardHolder) virtualCardHolder.textContent = "VALID USER";
        if (virtualCardNumber) virtualCardNumber.textContent = "•••• •••• •••• ••••";
        if (cardLinkedAccount) cardLinkedAccount.textContent = "No account linked";
        return;
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            currentLoggedUserDocId = querySnapshot.docs[0].id;
            currentLoggedUserData = querySnapshot.docs[0].data();

            let userCardNumber = currentLoggedUserData.cardNumber;
            const fullNameInput = document.getElementById("fullName");
            const emailInput = document.getElementById("email");
            const phoneInput = document.getElementById("phone");

            if (window.setupDetailsToggle && userCardNumber) {
                window.setupDetailsToggle(userCardNumber);
            }

            if (!userCardNumber) {
                let cardNum = "4";
                for (let i = 0; i < 15; i++) {
                    cardNum += Math.floor(Math.random() * 10);
                }
                userCardNumber = cardNum.match(/.{1,4}/g).join(" ");

                const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js");
                const userDocRef = doc(db, "users", currentLoggedUserDocId);
                await updateDoc(userDocRef, { cardNumber: userCardNumber });

                currentLoggedUserData.cardNumber = userCardNumber;
            }

            if (userName) userName.textContent = currentLoggedUserData.fullname || "User";
            if (firstLetter) {
                firstLetter.textContent = (currentLoggedUserData.fullname || "").trim().charAt(0).toUpperCase() || '?';
            }
            if (accountNumber) {
                accountNumber.textContent = currentLoggedUserData.accountNumber || "Account missing";
            }

            if (virtualCardHolder) {
                virtualCardHolder.textContent = currentLoggedUserData.fullname || "Clariva User";
            }

            if (virtualCardNumber) {
                if (userCardNumber) {
                    const firstFourDigits = userCardNumber.substring(0, 4);
                    virtualCardNumber.textContent = `${firstFourDigits} •••• •••• ••••`;
                } else {
                    virtualCardNumber.textContent = "•••• •••• •••• ••••";
                }
            }

            if (cardLinkedAccount) {
                cardLinkedAccount.textContent = currentLoggedUserData.accountNumber || "No account number found";
            }

       
            if (fullNameInput) fullNameInput.value = currentLoggedUserData.fullname || "";
            if (emailInput) emailInput.value = currentLoggedUserData.email || user.email || "";
            if (phoneInput) phoneInput.value = currentLoggedUserData.userPhonenumber || "";

            const loginTimeElement = document.getElementById("loginTime");
            if (loginTimeElement) {
                const currentSessionDate = new Date();
                const formattedLoginTime = currentSessionDate.toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }) + " at " + currentSessionDate.toLocaleTimeString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                });
                loginTimeElement.textContent = `Logged in: ${formattedLoginTime}`;
            }

            if (typeof window.captureProfileSnapshot === "function") {
                window.captureProfileSnapshot();
            }

            if (currentLoggedUserData.balance !== undefined && currentLoggedUserData.balance !== null) {
                const formattedBalance = Number(currentLoggedUserData.balance).toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN"
                });
                if (balance) balance.textContent = formattedBalance;

               
                document.querySelectorAll(".balance-strip-val").forEach(strip => {
                    strip.textContent = formattedBalance;
                });
            } else {
                if (balance) balance.textContent = "₦0.00";
                document.querySelectorAll(".balance-strip-val").forEach(strip => {
                    strip.textContent = "₦0.00";
                });
            }

            fetchTransactionHistory(user.uid);

        } else {
            console.warn("No user document found matching uid:", user.uid);
            if (accountNumber) accountNumber.textContent = "No data found";
            if (cardLinkedAccount) cardLinkedAccount.textContent = "Unlinked";
        }
    } catch (err) {
        console.error("Failed to load user data from Firestore:", err);
    }
});


// DEPOSIT, LOOKUP & PEER TRANSFER ENGINE

document.addEventListener("DOMContentLoaded", () => {
    const depositForm = document.getElementById("depositForm");
    const recipientAcctInput = document.getElementById("transfer-account");
    const recipientNameInput = document.getElementById("transfer-recipient-name");
    const confirmSendBtn = document.getElementById("confirmSend");
    const amountInput = document.getElementById("transfer-amount");
    const noteInput = document.getElementById("transfer-note");
    const transferContinueBtn = document.getElementById("transferContinueBtn");

  
    // ACTIVE CASH DEPOSIT / ADD MONEY SYSTEM ---
    if (depositForm) {
        depositForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const depositAmountInput = document.getElementById("depositAmount");
            const amount = parseFloat(depositAmountInput?.value);

            if (!amount || amount <= 0 || !currentLoggedUserDocId || !auth.currentUser) {
                Swal.fire("Error", "Please input a valid top-up value.", "warning");
                return;
            }

            try {
                const userDocRef = doc(db, "users", currentLoggedUserDocId);
                const userUid = auth.currentUser.uid;

                await runTransaction(db, async (transaction) => {
                    const sfDoc = await transaction.get(userDocRef);
                    const currentBal = parseFloat(sfDoc.data().balance || 0);
                    transaction.update(userDocRef, { balance: currentBal + amount });
                });

                await addDoc(collection(db, "transactions"), {
                    uid: userUid,
                    type: "Deposit",
                    amount: amount,
                    description: "Cash Deposit via Wallet Top-up",
                    timestamp: serverTimestamp(),
                });

                Swal.fire({
                    title: "Deposit successful",
                    text: `Successfully deposited ₦${amount.toLocaleString()} into your wallet!`,
                    icon: "success",
                    confirmButtonText: "success",

                });

                const overlay = document.getElementById("depositOverlay");
                if (overlay) overlay.style.display = "none";
                depositForm.reset();

          
                currentLoggedUserData.balance = parseFloat(currentLoggedUserData.balance || 0) + amount;
                const balanceDisplay = document.getElementById("displayBal");
                if (balanceDisplay) {
                    balanceDisplay.textContent = Number(currentLoggedUserData.balance).toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN"
                    });
                }

                document.querySelectorAll(".balance-strip-val").forEach(strip => {
                    strip.textContent = Number(currentLoggedUserData.balance).toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN"
                    });
                });

                fetchTransactionHistory(userUid);

            } catch (err) {
                console.error("Deposit processing failure:", err);
                Swal.fire("Transaction Aborted", "Could not complete top-up sequence.", "error");
            }
        });
    }

    
        if (recipientAcctInput) {
            recipientAcctInput.addEventListener("input", async () => {
                const acctNumberStr = recipientAcctInput.value.replace(/\s+/g, '');
                const nameWrap = document.getElementById("transfer-recipient-name-wrap");

                if (acctNumberStr.length === 10) {
                    if (recipientNameInput) recipientNameInput.value = "Verifying account data...";
                    if (nameWrap) nameWrap.style.display = "block";

                    try {
                        const usersRef = collection(db, "users");
                        const qStr = query(usersRef, where("accountNumber", "==", Number(acctNumberStr)));
                        let snapStr = await getDocs(qStr);

                        if (snapStr.empty) {
                            const qStr2 = query(usersRef, where("accountNumber", "==", String(acctNumberStr)));
                            snapStr = await getDocs(qStr2);
                        }

                        if (!snapStr.empty) {
                            targetRecipientDocId = snapStr.docs[0].id;
                            targetRecipientData = snapStr.docs[0].data();

                            if (auth.currentUser && targetRecipientData.uid === auth.currentUser.uid) {
                                if (recipientNameInput) {
                                    recipientNameInput.value = "You cannot transfer to yourself";
                                    recipientNameInput.style.color = "#f87171";
                                }
                                if (transferContinueBtn) transferContinueBtn.disabled = true;
                                if (confirmSendBtn) confirmSendBtn.disabled = true;
                                targetRecipientDocId = null;
                            } else {
                                if (recipientNameInput) {
                                    recipientNameInput.value = targetRecipientData.fullname || "Unnamed Account";
                                    recipientNameInput.style.color = "#34d399";
                                }
                                if (transferContinueBtn) transferContinueBtn.disabled = false;
                                if (confirmSendBtn) confirmSendBtn.disabled = false;
                            }
                        } else {
                            if (recipientNameInput) {
                                recipientNameInput.value = "Account number not found";
                                recipientNameInput.style.color = "#f87171";
                            }
                            if (transferContinueBtn) transferContinueBtn.disabled = true;
                            if (confirmSendBtn) confirmSendBtn.disabled = true;
                            targetRecipientDocId = null;
                        }
                    } catch (error) {
                        console.error("Error looking up recipient account:", error);
                        if (recipientNameInput) {
                            recipientNameInput.value = "Error executing lookup";
                            recipientNameInput.style.color = "#f87171";
                        }
                        if (transferContinueBtn) transferContinueBtn.disabled = true;
                        if (confirmSendBtn) confirmSendBtn.disabled = true;
                    }
                } else {
                    if (recipientNameInput) recipientNameInput.value = "";
                    if (nameWrap) nameWrap.style.display = "none";
                    if (transferContinueBtn) transferContinueBtn.disabled = true;
                    if (confirmSendBtn) confirmSendBtn.disabled = true;
                    targetRecipientDocId = null;
                }
            });
        }

    if (confirmSendBtn) {
        confirmSendBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            if (!auth.currentUser || !currentLoggedUserDocId || !targetRecipientDocId) {
                Swal.fire("Error", "Authentication or recipient mapping is incomplete.", "error");
                return;
            }

            const pinBoxes = document.querySelectorAll("#transfer-pinboxes .pin-box");
            let pinVal = "";
            pinBoxes.forEach(p => pinVal += p.value);

            if (pinVal.length < 4) {
                if (typeof window.showPinError === "function") {
                    window.showPinError("transfer", pinBoxes);
                }
                return;
            }
            if (typeof window.hidePinError === "function") {
                window.hidePinError("transfer");
            }

            const transferAmount = parseFloat(amountInput.value);
            if (isNaN(transferAmount) || transferAmount <= 0) {
                Swal.fire("Invalid Amount", "Please input a valid transfer amount total.", "warning");
                return;
            }

            if (transferAmount > parseFloat(currentLoggedUserData.balance || 0)) {
                Swal.fire("Insufficient Funds", "Your available balance is insufficient to process this request.", "error");
                return;
            }

            confirmSendBtn.disabled = true;
            confirmSendBtn.innerHTML = `Processing... <i class="bi bi-hourglass-split"></i>`;

            const senderUid = currentLoggedUserData.uid;

            try {
                const senderDocRef = doc(db, "users", currentLoggedUserDocId);
                const recipientDocRef = doc(db, "users", targetRecipientDocId);
                const transactionRef = collection(db, "transactions");

                await runTransaction(db, async (transaction) => {
                    const senderDoc = await transaction.get(senderDocRef);
                    const recipientDoc = await transaction.get(recipientDocRef);

                    if (!senderDoc.exists() || !recipientDoc.exists()) {
                        throw new Error("One or both user database documents no longer exist!");
                    }

                    const newSenderBal = parseFloat(senderDoc.data().balance || 0) - transferAmount;
                    const newRecipientBal = parseFloat(recipientDoc.data().balance || 0) + transferAmount;

                    transaction.update(senderDocRef, { balance: newSenderBal });
                    transaction.update(recipientDocRef, { balance: newRecipientBal });

                    const newTxnSenderRef = doc(transactionRef);
                    const newTxnRecipientRef = doc(transactionRef);

                    transaction.set(newTxnSenderRef, {
                        uid: senderUid,
                        type: "Transfer Out",
                        amount: transferAmount,
                        description: `To ${targetRecipientData.fullname || 'Clariva User'} - ${noteInput.value || 'No reference note'}`,
                        timestamp: serverTimestamp()
                    });

                    transaction.set(newTxnRecipientRef, {
                        uid: targetRecipientData.uid,
                        type: "Deposit",
                        amount: transferAmount,
                        description: `From ${currentLoggedUserData.fullname || 'Clariva User'}`,
                        timestamp: serverTimestamp()
                    });
                });

                currentLoggedUserData.balance = parseFloat(currentLoggedUserData.balance) - transferAmount;
                const balanceDisplay = document.getElementById("displayBal");
                if (balanceDisplay) {
                    balanceDisplay.textContent = Number(currentLoggedUserData.balance).toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN"
                    });
                }

                document.querySelectorAll(".balance-strip-val").forEach(strip => {
                    strip.textContent = Number(currentLoggedUserData.balance).toLocaleString("en-NG", {
                        style: "currency",
                        currency: "NGN"
                    });
                });

                // Switch modal step to success page
                const transferPin = document.getElementById("transfer-pin");
                const transferStep2 = document.getElementById("transfer-step2");
                if (transferPin) transferPin.classList.remove("active");
                if (transferStep2) transferStep2.classList.add("active");

                const receipt = document.getElementById("transfer-receipt");
                if (receipt) {
                    const acct = recipientAcctInput ? recipientAcctInput.value : '—';
                    const bank = document.getElementById("transfer-bank")?.value || '—';
                    const note = noteInput ? noteInput.value : 'None';
                    const row = (label, val) => `<div class="success-row"><span class="success-row-label">${label}</span><span class="success-row-val">${val}</span></div>`;
                    const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });
                    receipt.innerHTML = row('Recipient', acct) + row('Bank', bank) + row('Amount', fmt(transferAmount)) + row('Note', note) + row('Status', '<span style="color:#34d399">Success</span>');
                }

                if (recipientAcctInput) recipientAcctInput.value = "";
                if (recipientNameInput) recipientNameInput.value = "";
                if (amountInput) amountInput.value = "";
                if (noteInput) noteInput.value = "";

                const nameWrap = document.getElementById("transfer-recipient-name-wrap");
                if (nameWrap) nameWrap.style.display = "none";

                if (transferContinueBtn) transferContinueBtn.disabled = true;
                if (confirmSendBtn) confirmSendBtn.disabled = true;

                fetchTransactionHistory(senderUid);

            } catch (error) {
                console.error("Transfer transaction failed:", error);
                Swal.fire("Transfer Blocked", "Database synchronization failed. Please try again.", "error");
            } finally {
                confirmSendBtn.disabled = false;
                confirmSendBtn.innerHTML = `Confirm Transfer`;
            }
        });
    }

    
    const doneBtn = document.getElementById("doneBtn");
    if (doneBtn) {
        doneBtn.addEventListener("click", () => {
            document.querySelector('[data-step="2"]')?.classList.remove('active');
            document.querySelector('[data-step="1"]')?.classList.add('active');
            const dashboardSection = document.getElementById("section-dashboard");
            const transferSection = document.getElementById("section-transfer");
            if (transferSection) transferSection.classList.remove("is-active");
            if (dashboardSection) dashboardSection.classList.add("is-active");
        });
    }

  
    async function processUtilityPurchase(type, rawAmount, description) {
        if (!auth.currentUser || !currentLoggedUserDocId || !currentLoggedUserData) {
            Swal.fire("Error", "Authentication profile mapping is incomplete.", "error");
            return false;
        }

        const purchaseAmount = parseFloat(rawAmount);
        if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
            Swal.fire("Invalid Amount", "Please specify a valid payment total.", "warning");
            return false;
        }

        if (purchaseAmount > parseFloat(currentLoggedUserData.balance || 0)) {
            Swal.fire("Insufficient Funds", "Your available balance is insufficient.", "error");
            return false;
        }

        const userUid = currentLoggedUserData.uid;

        try {
            const senderDocRef = doc(db, "users", currentLoggedUserDocId);
            const transactionRef = collection(db, "transactions");

            await runTransaction(db, async (transaction) => {
                const senderDoc = await transaction.get(senderDocRef);
                if (!senderDoc.exists()) throw new Error("User document missing.");

                const newBal = parseFloat(senderDoc.data().balance || 0) - purchaseAmount;
                transaction.update(senderDocRef, { balance: newBal });

                const newTxnRef = doc(transactionRef);
                transaction.set(newTxnRef, {
                    uid: userUid,
                    type: type,
                    amount: purchaseAmount,
                    description: description,
                    timestamp: serverTimestamp()
                });
            });

        
            currentLoggedUserData.balance = parseFloat(currentLoggedUserData.balance) - purchaseAmount;
            const balanceDisplay = document.getElementById("displayBal");
            if (balanceDisplay) {
                balanceDisplay.textContent = Number(currentLoggedUserData.balance).toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN"
                });
            }

        
            document.querySelectorAll(".balance-strip-val").forEach(strip => {
                strip.textContent = Number(currentLoggedUserData.balance).toLocaleString("en-NG", {
                    style: "currency",
                    currency: "NGN"
                });
            });

            fetchTransactionHistory(userUid);
            return true;

        } catch (err) {
            console.error("Utility transaction failed: ", err);
            Swal.fire("Transaction Blocked", "Failed to update financial records.", "error");
            return false;
        }
    }

    // --- 1. AIRTIME SUBMIT INTERCEPTOR ---
    const airtimeSubmit = document.querySelector("#modal-airtime .submit-btn");
    if (airtimeSubmit) {
        airtimeSubmit.onclick = null;
        airtimeSubmit.addEventListener("click", async (e) => {
            e.preventDefault();
            const phone = document.getElementById("airtime-phone").value.trim();
            const amount = document.getElementById("airtime-amount").value.trim();

            if (!phone || !amount) {
                Swal.fire("Missing Info", "Please provide a valid phone number and amount.", "warning");
                return;
            }

            airtimeSubmit.disabled = true;
            const success = await processUtilityPurchase("Airtime Payment", amount, `Airtime top-up for +234${phone}`);
            airtimeSubmit.disabled = false;

            if (success && typeof window.nextStep === "function") {
                window.nextStep('airtime');
            }
        });
    }

    // --- 2. INTERNET DATA SUBMIT INTERCEPTOR ---
    const internetSubmit = document.querySelector("#modal-internet .submit-btn");
    if (internetSubmit) {
        internetSubmit.onclick = null;
        internetSubmit.addEventListener("click", async (e) => {
            e.preventDefault();
            const phone = document.getElementById("internet-phone").value.trim();
            const planName = document.getElementById("internet-plan-name").value;
            const planPrice = document.getElementById("internet-plan-price").value;

            if (!phone || !planPrice) {
                Swal.fire("Missing Info", "Please select a plan and input phone number.", "warning");
                return;
            }

            internetSubmit.disabled = true;
            const success = await processUtilityPurchase("Internet Purchase", planPrice, `${planName} to +234${phone}`);
            internetSubmit.disabled = false;

            if (success && typeof window.nextStep === "function") {
                window.nextStep('internet');
            }
        });
    }

    // --- 3. BETTING WALLET SUBMIT INTERCEPTOR ---
    const bettingSubmit = document.querySelector("#modal-betting .submit-btn");
    if (bettingSubmit) {
        bettingSubmit.onclick = null;
        bettingSubmit.addEventListener("click", async (e) => {
            e.preventDefault();
            const provider = document.getElementById("betting-pname").textContent;
            const userId = document.getElementById("betting-userid").value.trim();
            const amount = document.getElementById("betting-amount").value.trim();

            if (!userId || !amount) {
                Swal.fire("Missing Info", "Please provide your betting ID and amount.", "warning");
                return;
            }

            bettingSubmit.disabled = true;
            const success = await processUtilityPurchase("Betting Wallet Funding", amount, `${provider} (User ID: ${userId})`);
            bettingSubmit.disabled = false;

            if (success && typeof window.nextStep === "function") {
                window.nextStep('betting');
            }
        });
    }

    // --- 4. ELECTRICITY BILLS SUBMIT INTERCEPTOR ---
    const electricitySubmit = document.querySelector("#modal-electricity .submit-btn");
    if (electricitySubmit) {
        electricitySubmit.onclick = null;
        electricitySubmit.addEventListener("click", async (e) => {
            e.preventDefault();
            const meterType = document.getElementById("electricity-meter-type").value;
            const disco = document.getElementById("electricity-disco").value;
            const meterNum = document.getElementById("electricity-meter").value.trim();
            const amount = document.getElementById("electricity-amount").value.trim();

            if (!meterNum || !amount) {
                Swal.fire("Missing Info", "Please supply verified meter data and investment amount.", "warning");
                return;
            }

            electricitySubmit.disabled = true;
            const success = await processUtilityPurchase("Electricity Bill", amount, `${disco} (${meterType}) - Meter: ${meterNum}`);
            electricitySubmit.disabled = false;

            if (success && typeof window.nextStep === "function") {
                window.nextStep('electricity');
            }
        });
    }
});


const logOut = document.getElementById('signOut');
if (logOut) {
    logOut.addEventListener("click", async () => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "You will be logged out of your account.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: 'Yes, log me out!',
                cancelButtonText: "Cancel",

            });

            if (result.isConfirmed) {
                await signOut(auth);
                window.location.replace("../signUp and signIn/signIn.html");
            }
        } catch (error) {
            console.error(error);
        }
    });
}


async function fetchTransactionHistory(userUid) {
    if (!userUid) return;

    const fullTxnListContainer = document.getElementById("txn-list");
    const bigTableContainer = document.getElementById("extended-txn-list") || document.querySelector(".history-table tbody") || document.querySelector("table tbody");
    const moneyInCard = document.getElementById("moneyIn") || document.querySelector(".card-box:nth-child(1) h2");
    const moneyOutCard = document.getElementById("moneyOut") || document.querySelector(".card-box:nth-child(2) h2");
    const netChangeCard = document.getElementById("netChange") || document.querySelector(".card-box:nth-child(3) h2");
    const totalTxnsCountElement = document.getElementById("totalTxns") || document.querySelector(".card-box:nth-child(4) h2") || document.querySelector(".showing-count") || document.getElementsByClassName("showing-txt")[0];

    try {
        const txRef = collection(db, "transactions");
        const q = query(txRef, where("uid", "==", userUid));
        const querySnapshot = await getDocs(q);

        let miniDashboardHtml = "";
        let bigTableHtml = "";
        let chronologicalTxArray = [];

        let totalMoneyIn = 0;
        let totalMoneyOut = 0;

        querySnapshot.forEach((doc) => {
            chronologicalTxArray.push(doc.data());
        });

       
        chronologicalTxArray.sort((a, b) => {
           
            const dateA = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
            const dateB = b.timestamp?.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
            return dateB - dateA;
        });

        chronologicalTxArray.forEach(tx => {
            const amt = parseFloat(tx.amount || 0);
            if (tx.type === "Deposit") {
                totalMoneyIn += amt;
            } else {
                totalMoneyOut += amt;
            }
        });

        const formatConfig = { style: "currency", currency: "NGN" };
        if (moneyInCard) moneyInCard.textContent = Number(totalMoneyIn).toLocaleString("en-NG", formatConfig);
        if (moneyOutCard) moneyOutCard.textContent = Number(totalMoneyOut).toLocaleString("en-NG", formatConfig);
        if (netChangeCard) {
            const netValue = totalMoneyIn - totalMoneyOut;
            netChangeCard.textContent = (netValue >= 0 ? "" : "-") + Number(Math.abs(netValue)).toLocaleString("en-NG", formatConfig);
        }

        if (totalTxnsCountElement) {
            if (totalTxnsCountElement.tagName === "DIV" || totalTxnsCountElement.classList.contains("showing-txt")) {
                totalTxnsCountElement.textContent = `Showing ${chronologicalTxArray.length} of ${chronologicalTxArray.length}`;
            } else {
                totalTxnsCountElement.textContent = chronologicalTxArray.length;
            }
        }

        if (chronologicalTxArray.length === 0) {
            const emptyMsg = `<p style="padding:15px; font-size: 13px; color:rgba(255,255,255,0.4)">No history records detected.</p>`;
            if (fullTxnListContainer) fullTxnListContainer.innerHTML = emptyMsg;
            if (bigTableContainer) bigTableContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:rgba(255,255,255,0.4)">No complete transactions log files found.</td></tr>`;
            return;
        }

        chronologicalTxArray.forEach((tx) => {
            const isDebit = tx.type !== "Deposit";
            const fontColorStyle = isDebit ? "color: #f87171;" : "color: #34d399;";
            const numericPrefixSignValue = isDebit ? "-" : "+";

            
            const txDate = tx.timestamp?.seconds ? new Date(tx.timestamp.seconds * 1000) : new Date(tx.timestamp);
            const formattedCalendarDateTime = txDate.toLocaleDateString('en-NG', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const iconClass = isDebit ? "bi bi-arrow-up-right text-danger" : "bi bi-arrow-down-left text-success";

            miniDashboardHtml += `
                <div class="txn">
                    <div class="txn-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <div>
                        <div class="txn-name">${tx.type}</div>
                        <div class="txn-date">${formattedCalendarDateTime} · ${tx.description || ''}</div>
                    </div>
                    <div class="txn-amt" style="${fontColorStyle}">
                        ${numericPrefixSignValue}₦${parseFloat(tx.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            `;

            bigTableHtml += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 16px; font-size:14px; color:#fff;">${tx.description || tx.type}</td>
                    <td style="padding: 16px; font-size:14px; color:rgba(255,255,255,0.6);">${tx.type}</td>
                    <td style="padding: 16px; font-size:14px; color:rgba(255,255,255,0.6);">${formattedCalendarDateTime}</td>
                    <td style="padding: 16px; font-size:14px;"><span style="background:rgba(52,211,153,0.1); color:#34d399; padding:4px 8px; border-radius:4px; font-size:12px;">Successful</span></td>
                    <td style="padding: 16px; font-size:14px; text-align:right; font-weight:600; ${fontColorStyle}">
                        ${numericPrefixSignValue}₦${parseFloat(tx.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
            `;
        });

        if (fullTxnListContainer) fullTxnListContainer.innerHTML = miniDashboardHtml;
        if (bigTableContainer) bigTableContainer.innerHTML = bigTableHtml;

    } catch (historyProcessingException) {
        console.error("Encountered problem mapping transactions array records:", historyProcessingException);
    }
}
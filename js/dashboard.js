


// ─────────────────────────────────────────────────────────────
// SECTION: DASHBOARD
// ─────────────────────────────────────────────────────────────

// ── Balance Eye Toggle ──────

const eyeIcon = document.getElementById("eyeIcon");
const eyeSlashIcon = document.getElementById("eyeSlashIcon");
const displayBal = document.getElementById("displayBal");

let savedBalance = "";

const balanceWatcher = new MutationObserver(function () {
    const current = displayBal.textContent;
    if (current !== "₦ *****" && current !== "loading....") {
        savedBalance = current;
    }
});

if (displayBal) {
    balanceWatcher.observe(displayBal, { childList: true, subtree: true, characterData: true });
}

eyeIcon?.addEventListener("click", function () {
    savedBalance = displayBal.textContent;
    displayBal.textContent = "₦ *****";
    eyeIcon.style.display = "none";
    eyeSlashIcon.style.display = "inline";
});

eyeSlashIcon?.addEventListener("click", function () {
    displayBal.textContent = savedBalance;
    eyeSlashIcon.style.display = "none";
    eyeIcon.style.display = "inline";
});


// ── Add Money Modal ──────

const showAddMoneyBtn = document.getElementById("showAddMoneyBtn");
const depositOverlay = document.getElementById("depositOverlay");
const depositClose = document.getElementById("depositClose");
const depositForm = document.getElementById("depositForm");
const depositAccountNumber = document.getElementById("depositAccountNumber");
const depositAccountError = document.getElementById("depositAccountError");
const depositAmount = document.getElementById("depositAmount");
const depositError = document.getElementById("depositError");

function openDepositModal() {
    depositOverlay?.classList.add("is-open");
    if (depositAccountError) depositAccountError.textContent = "";
    if (depositError) depositError.textContent = "";
    if (depositAccountNumber) depositAccountNumber.value = "";
    if (depositAmount) depositAmount.value = "";
    depositOverlay?.querySelectorAll('.pin-box').forEach(box => { box.value = ""; });
    hidePinError('deposit');
    setTimeout(() => depositAccountNumber?.focus(), 50);
}

function closeDepositModal() {
    depositOverlay?.classList.remove("is-open");
    depositOverlay?.querySelectorAll('.pin-box').forEach(box => { box.value = ""; });
    hidePinError('deposit');
}

showAddMoneyBtn?.addEventListener("click", openDepositModal);
depositClose?.addEventListener("click", closeDepositModal);

depositOverlay?.addEventListener("click", (e) => {
    if (e.target === depositOverlay) closeDepositModal();
});

depositAccountNumber?.addEventListener("input", () => {
    depositAccountNumber.value = depositAccountNumber.value.replace(/\D/g, "").slice(0, 10);
});

depositForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const accountNumber = depositAccountNumber.value.trim();
    const amount = parseFloat(depositAmount.value);
    let hasError = false;

    if (!/^\d{10}$/.test(accountNumber)) {
        depositAccountError.textContent = "Enter a valid 10-digit account number.";
        hasError = true;
    } else {
        depositAccountError.textContent = "";
    }

    if (!amount || amount <= 0) {
        depositError.textContent = "Enter a valid amount.";
        hasError = true;
    } else {
        depositError.textContent = "";
    }

    if (hasError) return;


    const pins = depositOverlay.querySelectorAll('.pin-box');
    let pinVal = "";
    pins.forEach(p => pinVal += p.value);
    if (pinVal.length < 4) {
        showPinError('deposit', pins);
        return;
    }
    hidePinError('deposit');

    console.log("Deposit requested:", { accountNumber, amount });
    closeDepositModal();

    if (window.Swal) {
        await Swal.fire({
            title: "Deposit initiated",
            text: `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })} deposit request received for account ${accountNumber}.`,
            icon: "success",
            confirmButtonText: "Done",
            
        });
    }
});


function openModal(id) { document.getElementById('modal-' + id).classList.add('is-open'); document.body.style.overflow = 'hidden' }
function closeModal(id) { document.getElementById('modal-' + id).classList.remove('is-open'); document.body.style.overflow = ''; resetModal(id) }

function resetModal(id) {
    const s1 = document.getElementById(id + '-step1'), s2 = document.getElementById(id + '-step2'), spin = document.getElementById(id + '-pin');
    if (s1) s1.classList.add('active');
    if (s2) s2.classList.remove('active');
    if (spin) spin.classList.remove('active');

    
    const modalRoot = document.getElementById('modal-' + id);
    modalRoot?.querySelectorAll('.pin-box').forEach(box => { box.value = ""; });
    hidePinError(id);
}

function showPinStep(modal) {
    const s1 = document.getElementById(modal + '-step1');
    const spin = document.getElementById(modal + '-pin');
    if (s1 && spin) {
        s1.classList.remove('active');
        spin.classList.add('active');
    }
}

function fillPhone(modal, num) { const el = document.getElementById(modal + '-phone'); if (el) el.value = num }

function selectNet(btn, modal) {
    btn.closest('.network-grid').querySelectorAll('.net-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function selectAmt(modal, val, btn) {
    const input = document.getElementById(modal + '-amount');
    if (input) input.value = val;
    document.getElementById(modal + '-quick').querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function clearQuick(gridId) { document.getElementById(gridId).querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active')) }

function selectPlan(btn, modal, name, price) {
    btn.closest('#internet-plans').querySelectorAll('.disco-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(modal + '-plan-name').value = name;
    document.getElementById(modal + '-plan-price').value = price.replace(/[₦,]/g, '');
}

function selectDisco(btn, code) {
    btn.closest('.disco-grid').querySelectorAll('.disco-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('electricity-disco').value = code;
}

function selectMeterType(btn, type) {
    btn.closest('.meter-tabs').querySelectorAll('.meter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('electricity-meter-type').value = type;
}

function toggleProviderDropdown(modal) {
    const dd = document.getElementById(modal + '-dropdown');
    const ch = document.getElementById(modal + '-chevron');
    dd.classList.toggle('open');
    if (ch) ch.style.transform = dd.classList.contains('open') ? 'rotate(180deg)' : '';
}

function pickProvider(modal, name, color, initials) {
    document.getElementById(modal + '-pname').textContent = name;
    const logo = document.getElementById(modal + '-plogo');
    logo.textContent = initials; logo.style.background = color;
    document.getElementById(modal + '-dropdown').classList.remove('open');
    const ch = document.getElementById(modal + '-chevron');
    if (ch) ch.style.transform = '';
    document.getElementById(modal + '-dropdown').querySelectorAll('.provider-opt').forEach(o => o.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function verifyMeter() {
    const input = document.getElementById('electricity-meter').value.trim();
    const box = document.getElementById('electricity-verify');
    const txt = document.getElementById('electricity-verify-text');
    if (input.length < 11) { box.className = 'verify-result error'; txt.textContent = 'Enter a valid meter number to verify'; box.style.display = 'flex'; return }
    txt.textContent = 'Verifying…'; box.className = 'verify-result'; box.style.display = 'flex';
    setTimeout(() => {
        box.className = 'verify-result success';
        txt.textContent = 'Amara Okonkwo · ' + document.getElementById('electricity-disco').value;
    }, 900);
}

function resetVerify() { const box = document.getElementById('electricity-verify'); if (box) box.style.display = 'none' }

function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 }) }

function nextStep(modal) {
    const s1 = document.getElementById(modal + '-step1');
    const spin = document.getElementById(modal + '-pin');
    const s2 = document.getElementById(modal + '-step2');

   
    const pinContainer = spin || s1;
    if (pinContainer) {
        const pins = pinContainer.querySelectorAll('.pin-box');
        let pinVal = "";
        pins.forEach(p => pinVal += p.value);

        if (pins.length > 0 && pinVal.length < 4) {
            showPinError(modal, pins);
            return; 
        }
    }


    hidePinError(modal);

    const receipt = document.getElementById(modal + '-receipt');
    let rows = '';

    if (modal === 'transfer') {
        const acct = document.getElementById('transfer-account').value || '—';
        const bank = document.getElementById('transfer-bank').value || '—';
        const amt = document.getElementById('transfer-amount').value || '0';
        const note = document.getElementById('transfer-note').value || 'None';
        rows = row('Recipient', acct) + row('Bank', bank) + row('Amount', fmt(amt)) + row('Note', note) + row('Status', '<span style="color:#34d399">Success</span>');
    } else if (modal === 'airtime') {
        const phone = document.getElementById('airtime-phone').value || '—';
        const amt = document.getElementById('airtime-amount').value || '0';
        const net = document.querySelector('#modal-airtime .net-btn.active .net-label')?.textContent || '—';
        rows = row('Network', net) + row('Phone number', phone) + row('Amount', fmt(amt)) + row('Status', '<span style="color:#34d399">Success</span>');
    } else if (modal === 'internet') {
        const phone = document.getElementById('internet-phone').value || '—';
        const plan = document.getElementById('internet-plan-name').value;
        const price = document.getElementById('internet-plan-price').value;
        const net = document.querySelector('#modal-internet .net-btn.active .net-label')?.textContent || '—';
        rows = row('Network', net) + row('Phone number', phone) + row('Plan', plan) + row('Amount', fmt(price)) + row('Status', '<span style="color:#34d399">Success</span>');
    } else if (modal === 'betting') {
        const userid = document.getElementById('betting-userid').value || '—';
        const provider = document.getElementById('betting-pname').textContent;
        const amt = document.getElementById('betting-amount').value || '0';
        rows = row('Provider', provider) + row('User ID', userid) + row('Amount', fmt(amt)) + row('Status', '<span style="color:#34d399">Success</span>');
    } else if (modal === 'electricity') {
        const meter = document.getElementById('electricity-meter').value || '—';
        const disco = document.getElementById('electricity-disco').value;
        const mtype = document.getElementById('electricity-meter-type').value;
        const amt = document.getElementById('electricity-amount').value || '0';
        const token = Math.floor(Math.random() * 9e15).toString().replace(/(.{4})/g, '$1 ').trim();
        rows = row('Disco', disco) + row('Meter type', mtype) + row('Meter number', meter) + row('Amount', fmt(amt)) + row('Token', '<span style="font-family:monospace;color:#facc15">' + token + '</span>') + row('Status', '<span style="color:#34d399">Success</span>');
    }

    if (receipt) receipt.innerHTML = rows;
    if (s1) s1.classList.remove('active');
    if (spin) spin.classList.remove('active');
    s2.classList.add('active');
}


function showPinError(modal, pins) {
    const errorEl = document.getElementById(modal + '-pinError');
    if (errorEl) errorEl.classList.add('show');

    let firstEmpty = null;
    pins.forEach(box => {
        if (!box.value) {
            box.classList.add('pin-box-error');
            if (!firstEmpty) firstEmpty = box;
        } else {
            box.classList.remove('pin-box-error');
        }
    });
    firstEmpty?.focus();
}


function hidePinError(modal) {
    const errorEl = document.getElementById(modal + '-pinError');
    if (errorEl) errorEl.classList.remove('show');

    const pinContainer = document.getElementById(modal + '-pin')
        || document.getElementById(modal + '-step1')
        || document.getElementById(modal + '-pinboxes');
    pinContainer?.querySelectorAll('.pin-box').forEach(box => box.classList.remove('pin-box-error'));
}

function row(label, val) {
    return '<div class="success-row"><span class="success-row-label">' + label + '</span><span class="success-row-val">' + val + '</span></div>';
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id.replace('modal-', '')) });
});


document.querySelectorAll('.pin-boxes').forEach((container) => {
    const boxes = container.querySelectorAll('.pin-box');

   
    const modalId = container.id ? container.id.replace(/-pin(boxes)?$/, '') : null;

    boxes.forEach((box, idx) => {
        box.addEventListener('input', (e) => {
            box.classList.remove('pin-box-error');
            if (modalId) {
                const errorEl = document.getElementById(modalId + '-pinError');
                errorEl?.classList.remove('show');
            }
            if (e.target.value && idx < boxes.length - 1) {
                boxes[idx + 1].focus();
            }
        });
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && idx > 0) {
                boxes[idx - 1].focus();
            }
        });
    });
});




// ─────────────────────────────────────────────────────────────
// SECTION: ANALYTICS
// ─────────────────────────────────────────────────────────────

const monthlyData = {
    "6m": {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        income: [165000, 172000, 165000, 190000, 185000, 188000],
        spending: [98000, 112000, 87000, 121000, 105000, 96000],
    },
    "3m": {
        labels: ["Apr", "May", "Jun"],
        income: [190000, 185000, 188000],
        spending: [121000, 105000, 96000],
    },
    "1m": {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        income: [185000, 0, 0, 3000],
        spending: [22000, 31000, 19500, 23500],
    },
};

const categoryData = [
    { name: "Shopping", amount: 38500, color: "#a855f7" },
    { name: "Bills & utilities", amount: 26200, color: "#4facfe" },
    { name: "Transport", amount: 14300, color: "#34d399" },
    { name: "Subscriptions", amount: 9800, color: "#facc15" },
    { name: "Transfers", amount: 22500, color: "#f87171" },
];

let trendChart, donutChart;

function nairaShort(value) {
    return `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function renderSummary(range) {
    const d = monthlyData[range];
    const totalIncome = d.income.reduce((a, b) => a + b, 0);
    const totalSpend = d.spending.reduce((a, b) => a + b, 0);
    const net = totalIncome - totalSpend;
    const daysInRange = range === "1m" ? 30 : range === "3m" ? 90 : 180;
    const avgDaily = totalSpend / daysInRange;

    document.getElementById("anIncome").textContent = nairaShort(totalIncome);
    document.getElementById("anSpend").textContent = nairaShort(totalSpend);

    const netEl = document.getElementById("anNet");
    netEl.textContent = `${net < 0 ? "-" : ""}${nairaShort(Math.abs(net))}`;
    netEl.style.color = net < 0 ? "#f87171" : "#fff";

    document.getElementById("anAvgDaily").textContent = nairaShort(Math.round(avgDaily));

    document.getElementById("anIncomeDelta").textContent = "vs previous period: +4.2%";
    document.getElementById("anIncomeDelta").className = "stat-delta up";

    document.getElementById("anSpendDelta").textContent = "vs previous period: -8.1%";
    document.getElementById("anSpendDelta").className = "stat-delta up";

    document.getElementById("anNetDelta").textContent = "Savings rate: " + Math.round((net / totalIncome) * 100) + "%";
}

function renderTrendChart(range) {
    const d = monthlyData[range];
    const ctx = document.getElementById("trendChart").getContext("2d");

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: d.labels,
            datasets: [
                {
                    label: "Income",
                    data: d.income,
                    borderColor: "#34d399",
                    backgroundColor: "rgba(52, 211, 153, 0.08)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: "#34d399",
                },
                {
                    label: "Spending",
                    data: d.spending,
                    borderColor: "#f87171",
                    backgroundColor: "rgba(248, 113, 113, 0.06)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: "#f87171",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "rgba(255,255,255,0.45)", font: { size: 11 } },
                },
                y: {
                    grid: { color: "rgba(255,255,255,0.06)" },
                    ticks: {
                        color: "rgba(255,255,255,0.45)",
                        font: { size: 11 },
                        callback: (v) => nairaShort(v),
                    },
                },
            },
        },
    });
}

function renderDonut() {
    const ctx = document.getElementById("categoryDonut").getContext("2d");
    const total = categoryData.reduce((s, c) => s + c.amount, 0);

    document.getElementById("donutCenterVal").textContent = nairaShort(total);

    if (donutChart) donutChart.destroy();

    donutChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: categoryData.map(c => c.name),
            datasets: [{
                data: categoryData.map(c => c.amount),
                backgroundColor: categoryData.map(c => c.color),
                borderWidth: 0,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",
            plugins: { legend: { display: false } },
        },
    });
}

function renderCategoryList() {
    const list = document.getElementById("catList");
    const total = categoryData.reduce((s, c) => s + c.amount, 0);
    const sorted = [...categoryData].sort((a, b) => b.amount - a.amount);

    list.innerHTML = sorted.map(c => {
        const pct = Math.round((c.amount / total) * 100);
        return `
            <div class="cat-row">
                <div class="cat-row-top">
                    <div class="cat-name-group">
                        <span class="cat-dot" style="background:${c.color}"></span>
                        <span class="cat-name">${c.name}</span>
                    </div>
                    <span class="cat-amt">${nairaShort(c.amount)} &middot; ${pct}%</span>
                </div>
                <div class="cat-prog-bg">
                    <div class="cat-prog-fill" style="width:${pct}%;background:${c.color}"></div>
                </div>
            </div>
        `;
    }).join("");
}

function setupRangeFilter() {
    document.querySelectorAll(".an-toprow .ftab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".an-toprow .ftab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const range = btn.dataset.range;
            renderSummary(range);
            renderTrendChart(range);
        });
    });
}





// ─────────────────────────────────────────────────────────────
// SECTION: CARD
// ─────────────────────────────────────────────────────────────

function setupFlip() {
    const wrap = document.getElementById("cardFlipWrap");
    const flipBtn = document.getElementById("flipBtn");

    function toggleFlip() {
        wrap.classList.toggle("is-flipped");
        flipBtn.innerHTML = wrap.classList.contains("is-flipped")
            ? '<i class="ti ti-refresh"></i>Tap card to see front'
            : '<i class="ti ti-refresh"></i>Tap card to flip';
    }

    wrap?.addEventListener("click", toggleFlip);
    flipBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFlip();
    });
}

function setupFreeze() {
    const toggle = document.getElementById("freezeToggle");
    const statusPill = document.getElementById("cardStatusPill");
    const cardFaces = document.querySelectorAll(".bank-card");

    toggle?.addEventListener("change", () => {
        const frozen = toggle.checked;
        statusPill.textContent = frozen ? "Frozen" : "Active";
        statusPill.classList.toggle("status-active", !frozen);
        statusPill.classList.toggle("status-frozen", frozen);
        cardFaces.forEach(card => card.classList.toggle("is-frozen", frozen));
    });
}

function generateVirtualCardNumber() {
    let cardNum = "4";

    for (let i = 0; i < 15; i++) {
        cardNum += Math.floor(Math.random() * 10);
    }

    // Formats into chunks of 4 digits: "4123 4567 8901 2345"
    return cardNum.match(/.{1,4}/g).join(" ");
}

function setupDetailsToggle(realCardNumber) {
    const btn = document.getElementById("showDetailsBtn");
    const masked = document.getElementById("cardNumberMasked");

    if (!btn || !masked || !realCardNumber) return;

    let revealed = false;

    const firstFourDigits = realCardNumber.substring(0, 4);
    const maskedNumber = `${firstFourDigits} •••• •••• ••••`;

    masked.textContent = maskedNumber;

    btn.onclick = () => {
        revealed = !revealed;

        masked.textContent = revealed ? realCardNumber : maskedNumber;

        btn.innerHTML = revealed
            ? '<i class="ti ti-eye-off"></i> Hide details'
            : '<i class="ti ti-eye"></i> View details';
    };
}

window.setupDetailsToggle = setupDetailsToggle;




// ─────────────────────────────────────────────────────────────
// SECTION: SETTINGS
// ─────────────────────────────────────────────────────────────

const swalTheme = {
    popup: "clariva-popup",
    title: "clariva-title",
    htmlContainer: "clariva-text",
    confirmButton: "clariva-confirm-btn",
    cancelButton: "clariva-cancel-btn",
    actions: "clariva-actions",
};


function snapshotProfileValues() {
    return {
        fullName: document.getElementById("fullName")?.value ?? "",
        email: document.getElementById("email")?.value ?? "",
        phone: document.getElementById("phone")?.value ?? "",
    };
}

let _profileSnapshot = null;


window.captureProfileSnapshot = function () {
    _profileSnapshot = snapshotProfileValues();
};

// ── Profile: Save ──────
document.getElementById("saveProfile")?.addEventListener("click", async () => {
   
    if (!window._fbSaveProfile) {
        await Swal.fire({
            title: "Profile updated",
            text: "Your changes have been saved.",
            icon: "success",
            confirmButtonText: "Done",
            customClass: swalTheme,
            buttonsStyling: false,
        });
    }
    
});

// ── Profile: Discard ────
document.getElementById("cancelProfile")?.addEventListener("click", () => {
    const snap = _profileSnapshot || snapshotProfileValues();
    const fullNameEl = document.getElementById("fullName");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phone");
    if (fullNameEl) fullNameEl.value = snap.fullName;
    if (emailEl) emailEl.value = snap.email;
    if (phoneEl) phoneEl.value = snap.phone;
});

// ── Password: Update ──────
document.getElementById("updatePassword")?.addEventListener("click", async () => {
    const currentPw = document.getElementById("currentPassword")?.value ?? "";
    const newPw = document.getElementById("newPassword")?.value ?? "";
    const confirmPw = document.getElementById("confirmPassword")?.value ?? "";

    if (!currentPw) {
        await Swal.fire({
            title: "Current password required",
            text: "Enter your current password to continue.",
            icon: "error",
            confirmButtonText: "Got it",
            customClass: swalTheme,
            buttonsStyling: false,
        });
        document.getElementById("currentPassword")?.focus();
        return;
    }

    if (!newPw || newPw.length < 10) {
        await Swal.fire({
            title: "Password too short",
            text: "Use at least 10 characters for your new password.",
            icon: "error",
            confirmButtonText: "Try again",
            customClass: swalTheme,
            buttonsStyling: false,
        });
        document.getElementById("newPassword")?.focus();
        return;
    }

    if (newPw !== confirmPw) {
        await Swal.fire({
            title: "Passwords don't match",
            text: "Re-enter your new password to confirm.",
            icon: "error",
            confirmButtonText: "Try again",
            customClass: swalTheme,
            buttonsStyling: false,
        });
        document.getElementById("confirmPassword")?.focus();
        return;
    }

    
    if (!window._fbUpdatePassword) {
        await Swal.fire({
            title: "Password updated",
            text: "Use your new password next time you sign in.",
            icon: "success",
            confirmButtonText: "Done",
            customClass: swalTheme,
            buttonsStyling: false,
        });
        ["currentPassword", "newPassword", "confirmPassword"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });
    }
});

// ── 2FA toggle ───────────────────────────────────────────────
const twoFASwitch = document.getElementById("twoFASwitch");
const twoFAStatus = document.getElementById("twoFAStatus");

twoFASwitch?.addEventListener("click", () => {
    const isOn = twoFASwitch.getAttribute("aria-checked") === "true";
    const next = !isOn;
    twoFASwitch.setAttribute("aria-checked", String(next));
    if (twoFAStatus) {
        twoFAStatus.textContent = next ? "Enabled" : "Not enabled";
        twoFAStatus.style.color = next ? "#34d399" : "#f87171";
    }
});

// ── Sign out of all devices ───────────────────────────────────
document.getElementById("signOutAllBtn")?.addEventListener("click", async () => {
    const result = await Swal.fire({
        title: "Sign out everywhere?",
        text: "This will end every active session on all your devices, including this one.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, sign out everywhere",
        cancelButtonText: "Cancel",
        customClass: swalTheme,
        buttonsStyling: false,
    });

    if (result.isConfirmed) {
       
        if (!window._fbSignOut) {
            window.location.replace("../signUp and signIn/signIn.html");
        }
    }
});


async function handleSignOut() {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out of your account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, log me out!",
            cancelButtonText: "Cancel",
             customClass: swalTheme,
        buttonsStyling: false,
           
        });

        if (result.isConfirmed) {
            // dashboardFb.js handles signOut(auth) — fall back to redirect
            if (!window._fbSignOut) {
                window.location.replace("../signUp and signIn/signIn.html");
            } else {
                window._fbSignOut();
            }
        }
    } catch (error) {
        console.error(error);
    }
}

document.getElementById("signOut")?.addEventListener("click", handleSignOut);


// ─────────────────────────────────────────────────────────────
// SECTION: SPA NAV
// ─────────────────────────────────────────────────────────────

(function () {
    const navLinks = document.querySelectorAll(".nav-link[data-section]");
    const sections = document.querySelectorAll(".page-section");
    const sectionTriggers = document.querySelectorAll("[data-section]");

   
    const initialised = {};

    function showSection(name) {
        const targetId = "section-" + name;

        sections.forEach((section) => {
            section.classList.toggle("is-active", section.id === targetId);
        });

        navLinks.forEach((link) => {
            link.classList.toggle("active", link.dataset.section === name);
        });

        const dashContent = document.querySelector(".dash-content");
        if (dashContent) dashContent.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: "instant" });

       
        if (!initialised[name]) {
            initialised[name] = true;

            if (name === "card") {
                setupFlip();
                setupFreeze();
                setupDetailsToggle();
            }

            if (name === "analytics") {
                renderSummary("6m");
                renderTrendChart("6m");
                renderDonut();
                renderCategoryList();
                setupRangeFilter();
            }

            if (name === "settings") {
                
                document.getElementById("signOutSettings")
                    ?.addEventListener("click", handleSignOut);

                
                if (!_profileSnapshot) {
                    _profileSnapshot = snapshotProfileValues();
                }
            }
        }
    }

    sectionTriggers.forEach((el) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const name = el.dataset.section;
            if (name) showSection(name);
        });
    });

    const transferBack = document.getElementById("transferBackBtn");
    transferBack?.addEventListener("click", () => showSection("dashboard"));

   
    window.showSection = showSection;
})();


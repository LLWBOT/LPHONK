// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Elements
const btnLogin = document.getElementById("btn-login");
const btnSignup = document.getElementById("btn-signup");
const btnGuest = document.getElementById("btn-guest");
const generatingSection = document.getElementById("generator-section");
const heroButtons = document.getElementById("hero-buttons");
const statusText = document.getElementById("status-text");

// -------------------------------
// CREATE ACCOUNT
// -------------------------------
async function registerUser(email, password) {
    try {
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCred.user;

        // Send verification
        await user.sendEmailVerification();

        // Create coins in Firestore
        await db.collection("users").doc(user.uid).set({
            coins: 15,
            verified: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        statusText.innerHTML = `
            <div class="success-box">
                We have sent a verification email to <b>${email}</b><br>
                Check your inbox, or Spam folder.<br><br>
                <button onclick="resendVerification()">Resend Email</button>
            </div>
        `;

    } catch (err) {
        alert(err.message);
    }
}

// -------------------------------
// RESEND EMAIL
// -------------------------------
async function resendVerification() {
    const user = auth.currentUser;
    if (!user) return;

    await user.sendEmailVerification();
    alert("Verification email sent again!");
}

// -------------------------------
// LOGIN FUNCTION
// -------------------------------
async function loginUser(email, password) {
    try {
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        const user = userCred.user;

        if (!user.emailVerified) {
            statusText.innerHTML = `
                <div class="warning-box">
                    Your email is not verified.<br>
                    Please verify first.<br><br>
                    <button onclick="resendVerification()">Resend Email</button>
                </div>
            `;
            return;
        }

        statusText.innerHTML = "";
        showLoggedInUI();
        
    } catch (err) {
        alert(err.message);
    }
}

// -------------------------------
// AUTO LOGIN + VERIFICATION LISTENER
// -------------------------------
auth.onAuthStateChanged(async (user) => {
    if (user) {
        await user.reload(); // refresh verification status

        if (user.emailVerified) {
            // Update Firestore verified field
            db.collection("users").doc(user.uid).update({
                verified: true
            });

            showLoggedInUI();
        }
    }
});

// -------------------------------
// SHOW LOGGED-IN UI
// -------------------------------
function showLoggedInUI() {
    // Hide the 3 big buttons
    if (heroButtons) heroButtons.style.display = "none";

    // Show generator section
    if (generatingSection) {
        generatingSection.style.display = "block";
        generatingSection.classList.add("fade-in");
    }

    // Show verification badge
    statusText.innerHTML = `
        <div class="verified-badge">
            ✔ Verified Account
        </div>
    `;
}

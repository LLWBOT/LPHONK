// =======================
//  Firebase Initialization
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyCzdCYFRu0Pn3TrImTNfG7xN0bcM_a48Ws",
  authDomain: "lphonk.firebaseapp.com",
  projectId: "lphonk",
  storageBucket: "lphonk.firebasestorage.app",
  messagingSenderId: "193256977034",
  appId: "1:193256977034:web:38fd99c1da8e8f37507373",
  measurementId: "G-5QMHMLDHBW"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =======================
// UI ELEMENTS
// =======================
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const authPopup = document.getElementById("authPopup");
const authPopupMessage = document.getElementById("authPopupMessage");

const mainButtons = document.getElementById("mainButtons");
const coinContainer = document.getElementById("coinContainer");
const coinAmountElement = document.getElementById("coinAmount");

const generatorSection = document.getElementById("generatorSection");

// Create logout button (added to navbar)
let logoutBtn = document.createElement("button");
logoutBtn.id = "logoutBtn";
logoutBtn.innerText = "Logout";
logoutBtn.classList.add("nav-btn", "gradient-btn");
logoutBtn.style.display = "none";

document.querySelector(".nav-buttons").appendChild(logoutBtn);

// =======================
// POPUP SYSTEM
// =======================
function showPopup(msg) {
  authPopupMessage.innerHTML = msg;
  authPopup.style.display = "flex";
}

// Close popup function used by HTML onclick
window.closeAuthPopup = function () {
  authPopup.style.display = "none";
};

// =======================
// COIN SYSTEM
// =======================
async function giveNewUserCoins(uid) {
  const ref = db.collection("users").doc(uid);

  const docSnap = await ref.get();
  if (!docSnap.exists) {
    await ref.set({
      coins: 15,
      dailyClaim: null,
      youtubeClaimed: false
    });
  }
}

async function loadCoins(uid) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (snap.exists) coinAmountElement.innerText = snap.data().coins;
}

// =======================
// REGISTER
// =======================
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await user.sendEmailVerification();

    showPopup(`
      Verification email sent to <b>${email}</b>.<br><br>
      Please verify your email before logging in.<br><br>
      <span id="resendEmail" style="color:#4af; cursor:pointer;">Resend Email</span>
    `);

    document.getElementById("resendEmail").onclick = () => {
      user.sendEmailVerification();
      showPopup("Verification email resent!");
    };

    await giveNewUserCoins(user.uid);
  } catch (err) {
    showPopup(err.message);
  }
});

// =======================
// LOGIN
// =======================
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const res = await auth.signInWithEmailAndPassword(email, password);
    const user = res.user;

    await user.reload();

    if (!user.emailVerified) {
      showPopup("Your email is not verified. Please verify before logging in.");
      auth.signOut();
      return;
    }

    showPopup("Login successful!");
  } catch (err) {
    showPopup(err.message);
  }
});

// =======================
// LOGOUT
// =======================
logoutBtn.addEventListener("click", () => {
  auth.signOut();
  showPopup("Logged out.");
});

// =======================
// AUTH STATE LISTENER
// =======================
auth.onAuthStateChanged(async (user) => {
  if (user && user.emailVerified) {
    // User logged in
    mainButtons.style.display = "none";
    coinContainer.style.display = "flex";
    logoutBtn.style.display = "inline-block";

    await loadCoins(user.uid);

    generatorSection.style.display = "block";

  } else {
    // User logged out
    mainButtons.style.display = "flex";
    coinContainer.style.display = "none";
    logoutBtn.style.display = "none";

    generatorSection.style.display = "none";
  }
});

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
const logoutBtn = document.getElementById("logoutBtn");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const authPopup = document.getElementById("authPopup");
const authPopupMessage = document.getElementById("authPopupMessage");
const closeAuthPopup = document.getElementById("closeAuthPopup");

const mainButtons = document.getElementById("mainButtons");
const coinContainer = document.getElementById("coinContainer");
const coinAmountElement = document.getElementById("coinAmount");

// =======================
// SHOW POPUP MESSAGE
// =======================
function showPopup(msg) {
  authPopupMessage.innerHTML = msg;
  authPopup.style.display = "flex";
}

closeAuthPopup.addEventListener("click", () => {
  authPopup.style.display = "none";
});

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
  if (snap.exists) {
    coinAmountElement.innerText = snap.data().coins;
  }
}

// =======================
// REGISTER USER
// =======================
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await user.sendEmailVerification();

    showPopup(`
      A verification email has been sent to <b>${email}</b>.<br><br>
      Please check your inbox. If it's not there, check spam.<br><br>
      Still not found? <span id="resendEmail" style="color:#4af;">Resend Email</span>
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
// LOGIN USER
// =======================
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    const user = result.user;

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
});

// =======================
// AUTH STATE LISTENER
// =======================
auth.onAuthStateChanged(async (user) => {
  if (user && user.emailVerified) {
    // Logged in & verified
    mainButtons.style.display = "none";             // Hide homepage buttons
    coinContainer.style.display = "flex";           // Show coins
    logoutBtn.style.display = "inline-block";

    await loadCoins(user.uid);

    document.getElementById("generatorSection").style.display = "block";

  } else {
    // Logged out
    mainButtons.style.display = "flex";
    coinContainer.style.display = "none";
    logoutBtn.style.display = "none";

    document.getElementById("generatorSection").style.display = "none";
  }
});

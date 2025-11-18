// ==============================
// FIREBASE + GLOBAL ELEMENTS
// ==============================
const coinPopup = document.getElementById("coinPopup");
const closeCoinPopup = document.getElementById("closeCoinPopup");
const openCoinPopup = document.getElementById("openCoinPopup");
const coinAmountElement = document.getElementById("coinAmount");

// Buttons inside popup
const youtubeBtn = document.getElementById("youtubeBtn");
const dailyBtn = document.getElementById("dailyBtn");
const redeemBtn = document.getElementById("redeemBtn");
const redeemInput = document.getElementById("redeemInput");

// ==============================
// OPEN / CLOSE POPUP
// ==============================
openCoinPopup.onclick = () => {
  coinPopup.style.display = "flex";
};

closeCoinPopup.onclick = () => {
  coinPopup.style.display = "none";
};

// Close popup when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === coinPopup) {
    coinPopup.style.display = "none";
  }
});

// ==============================
// GET USER DOC REFERENCE
// ==============================
function userRef() {
  return db.collection("users").doc(auth.currentUser.uid);
}

// ==============================
// UPDATE COINS DISPLAY
// ==============================
async function updateCoinDisplay() {
  if (!auth.currentUser) return;

  const snap = await userRef().get();
  if (snap.exists) {
    coinAmountElement.innerText = snap.data().coins;
  }
}

// ==============================
// DEDUCT COINS (Used by generation)
// ==============================
async function spendCoins(amount) {
  const ref = userRef();
  const snap = await ref.get();

  let currentCoins = snap.data().coins;

  if (currentCoins < amount) return false;

  await ref.update({
    coins: currentCoins - amount
  });

  await updateCoinDisplay();
  return true;
}

// ==============================
// YOUTUBE SUBSCRIBE REWARD (One time)
// ==============================
youtubeBtn.onclick = async () => {
  const ref = userRef();
  const snap = await ref.get();

  if (snap.data().youtubeClaimed) {
    alert("You already claimed this reward!");
    return;
  }

  // Redirect to YouTube channel
  window.open("https://www.youtube.com/@PRIMELLW", "_blank");

  // Give 10 coins
  await ref.update({
    coins: snap.data().coins + 10,
    youtubeClaimed: true
  });

  await updateCoinDisplay();
  alert("10 coins added!");
};

// ==============================
// DAILY FREE 5 COINS (24h cooldown)
// ==============================
dailyBtn.onclick = async () => {
  const ref = userRef();
  const snap = await ref.get();

  const lastClaim = snap.data().dailyClaim;
  const now = Date.now();

  if (lastClaim && now - lastClaim < 24 * 60 * 60 * 1000) {
    const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (now - lastClaim)) / 3600000);
    alert(`Please wait ${hoursLeft} more hours to claim again.`);
    return;
  }

  await ref.update({
    coins: snap.data().coins + 5,
    dailyClaim: now
  });

  await updateCoinDisplay();
  alert("Daily 5 coins added!");
};

// ==============================
// REDEEM CODE SYSTEM
// ==============================

// ⭐ You can change/add your secret redeem codes here
const VALID_CODES = {
  "LPHONK10": 10,
  "LPHONK20": 20,
  "FREE5": 5,
};

redeemBtn.onclick = async () => {
  const code = redeemInput.value.trim().toUpperCase();
  if (!code) return;

  if (!VALID_CODES[code]) {
    alert("Invalid code!");
    return;
  }

  const reward = VALID_CODES[code];

  const ref = userRef();
  const snap = await ref.get();

  // Add coins
  await ref.update({
    coins: snap.data().coins + reward
  });

  await updateCoinDisplay();
  alert(`You redeemed ${reward} coins!`);

  redeemInput.value = "";
};

// ==============================
// AUTH STATE LISTENER -> Update Coins
// ==============================
auth.onAuthStateChanged(async (user) => {
  if (user && user.emailVerified) {
    await updateCoinDisplay();
  }
});

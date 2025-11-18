/* auth.js
   - Firebase init
   - auth flows (signup/login/logout)
   - show/hide UI depending on auth state
   - email verification UI
*/

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

let currentUser = null;

// UI helpers
function openModal(id){ document.getElementById(id).style.display='flex'; document.getElementById(id).classList.add('visible'); }
function closeModal(id){ document.getElementById(id).style.display='none'; }
function showAuth(form){
  // hide hero CTAs when showing auth forms
  document.getElementById('heroCtas').style.display = 'none';
  // show selected form
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('signupForm').classList.remove('active');
  if(form==='login') document.getElementById('loginForm').classList.add('active');
  else document.getElementById('signupForm').classList.add('active');
  // hide dashboard area if shown
  document.getElementById('heroDashboardArea').innerHTML = '';
}

// auth state
auth.onAuthStateChanged(user => {
  if(user && user.emailVerified){
    currentUser = user;
    // hide CTAs and nav auth buttons
    document.getElementById('heroCtas').style.display = 'none';
    document.getElementById('navLoginBtn').style.display = 'none';
    document.getElementById('navSignupBtn').style.display = 'none';
    // render dashboard block under hero text
    renderHeroDashboard();
    // subscribe to user doc
    db.collection('users').doc(user.uid).onSnapshot(doc=>{
      if(!doc.exists) return;
      const data = doc.data();
      const coinEl = document.getElementById('coinCount');
      if(coinEl) coinEl.innerText = data.coins ?? 0;
      // update daily button disable
      const dailyBtn = document.getElementById('dailyBtn');
      if(dailyBtn){
        const last = data.dailyClaim || 0;
        if(Date.now() - last < 24*60*60*1000) dailyBtn.disabled = true;
        else dailyBtn.disabled = false;
      }
    });
  } else {
    currentUser = null;
    // show CTAs and nav auth
    document.getElementById('heroCtas').style.display = 'flex';
    document.getElementById('navLoginBtn').style.display = 'inline-block';
    document.getElementById('navSignupBtn').style.display = 'inline-block';
    // hide dashboard if present
    document.getElementById('heroDashboardArea').innerHTML = '';
  }
});

// Signup
function signup(){
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPassword').value;
  if(!email || !pass || pass.length < 6) return alert('Provide a valid email and password (min 6 chars).');
  auth.createUserWithEmailAndPassword(email, pass)
    .then(uc => {
      const u = uc.user;
      u.sendEmailVerification();
      // init user doc
      db.collection('users').doc(u.uid).set({
        coins: 15,
        lastGeneration: null,
        dailyClaim: 0,
        youtubeClaimed: false
      });
      // show verify panel
      document.getElementById('verificationMessage').style.display = 'block';
      document.getElementById('userEmailDisplay').innerText = email;
      // clear form inputs
      document.getElementById('signupEmail').value = '';
      document.getElementById('signupPassword').value = '';
    })
    .catch(e=>alert(e.message));
}

// resend
function resendVerification(){
  const user = auth.currentUser;
  if(!user){ alert('You must be signed in to resend verification (check your inbox).'); return; }
  user.sendEmailVerification().then(()=>alert('Verification email resent — check inbox or spam.'));
}

// login
function login(){
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if(!email || !pass) return alert('Fill email & password');
  auth.signInWithEmailAndPassword(email, pass)
    .then(uc => {
      const u = uc.user;
      if(!u.emailVerified){
        alert('Please verify your email before accessing the dashboard.');
        auth.signOut();
        return;
      }
      // successful -> UI updates handled by onAuthStateChanged
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
    })
    .catch(e => alert(e.message));
}

// logout
function logout(){
  auth.signOut().then(()=>{
    // restore CTAs shown by onAuthStateChanged
    document.getElementById('heroCtas').style.display = 'flex';
  });
}

/* render hero dashboard (upload/generate) - inserted under hero text */
function renderHeroDashboard(){
  const area = document.getElementById('heroDashboardArea');
  if(!area) return;
  area.innerHTML = `
    <div class="dashboard active" id="dashboardBlock">
      <div class="coins-bar">
        <div class="coins-display"><img src="assets/coin.png" alt="coin"> <span id="coinCount">0</span></div>
        <button class="plus-btn" onclick="openCoinsPopup()">+</button>
      </div>
      <div class="upload-generate">
        <label>Upload Beat (instrumental)
          <input id="beatUpload" type="file" accept=".mp3,.wav" />
        </label>
        <label>Reference Vocal (optional)
          <input id="refUpload" type="file" accept=".mp3,.wav" />
        </label>
        <label>Select Style
          <select id="vocalStyle">
            <option value="montagem_rugada">Montagem Rugada</option>
            <option value="montagem_xonada">Montagem Xonada</option>
            <option value="veki_veki">Veki Veki</option>
            <option value="random">Random Viral</option>
          </select>
        </label>
        <button class="generate-btn" onclick="startGeneration()">
          <img src="assets/coin.png" alt="coin"> 5 Coins
        </button>
      </div>
      <div class="audio-preview">
        <audio id="audioPlayer" controls style="width:100%; margin-top:12px;"></audio>
      </div>
    </div>
  `;
}

// generate (placeholder) - deducts coins and triggers animation via coins.js
function startGeneration(){
  if(!auth.currentUser) { alert('Please login/signup and verify your email first.'); return; }
  const uid = auth.currentUser.uid;
  const userRef = db.collection('users').doc(uid);
  userRef.get().then(d=>{
    const data = d.data() || {};
    const coins = data.coins || 0;
    if(coins < 5) return alert('Not enough coins — open + to get more.');
    // deduct 5 coins
    userRef.update({ coins: coins - 5 }).then(()=>{
      // trigger visual generation (waveform / loader in coins.js)
      startGenerationVisual();
      // placeholder: after 4s set a sample audio or just notify
      setTimeout(()=>{
        stopGenerationVisual();
        alert('Generation complete — (placeholder). Integrate AI backend to produce audio.');
      }, 4200);
    });
  });
}

// small helpers for modal open/close (big-modal)
function openModal(id){ document.getElementById(id).style.display='flex'; }
function closeModal(id){ document.getElementById(id).style.display='none'; }

// open coins popup (handled by coins.js)
function openCoinsPopup(){ document.getElementById('coinsPopup').style.display = 'block'; }
function closeCoinsPopup(){ document.getElementById('coinsPopup').style.display = 'none'; }

// Firebase Config
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

// Persistent login
auth.onAuthStateChanged(user => {
    if (user && user.emailVerified) {
        currentUser = user;
        showDashboard(user.uid);
    } else {
        currentUser = null;
        showAuth('login');
    }
});

// Show Auth Forms
function showAuth(form){
    document.getElementById('loginForm').classList.remove('active'); 
    document.getElementById('signupForm').classList.remove('active'); 
    if(form==='login'){document.getElementById('loginForm').classList.add('active');} 
    else {document.getElementById('signupForm').classList.add('active');} 
    document.getElementById('verificationMessage').style.display = 'none';
}

// Modals
function openModal(id){ document.getElementById(id).style.display='flex'; }
function closeModal(id){ document.getElementById(id).style.display='none'; }
window.onclick = function(event){
    ['aboutModal','contactModal','privacyModal'].forEach(id=>{
        if(event.target==document.getElementById(id)){ document.getElementById(id).style.display='none'; }
    });
}

// Signup
function signup(){
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    auth.createUserWithEmailAndPassword(email,password)
    .then(userCredential=>{
        const user = userCredential.user;
        user.sendEmailVerification();
        // Init user data
        db.collection('users').doc(user.uid).set({
            coins: 15,
            lastGeneration: null,
            dailyClaim: 0,
            youtubeClaimed: false
        });
        document.getElementById('signupForm').style.display='block';
        document.getElementById('verificationMessage').style.display='block';
        document.getElementById('userEmailDisplay').innerText = email;
    })
    .catch(err=>alert(err.message));
}

// Resend verification
function resendVerification(){
    if(currentUser){
        currentUser.sendEmailVerification().then(()=>alert('Verification email resent!'));
    }
}

// Login
function login(){
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    auth.signInWithEmailAndPassword(email,password)
    .then(userCredential=>{
        const user = userCredential.user;
        if(!user.emailVerified){
            alert('Please verify your email!');
            auth.signOut();
        } else {
            currentUser = user;
            showDashboard(user.uid);
        }
    })
    .catch(err=>alert(err.message));
}

// Logout
function logout(){ 
    auth.signOut(); 
    currentUser=null; 
    document.getElementById('dashboard').classList.remove('active'); 
    showAuth('login'); 
}

// Show Dashboard
function showDashboard(uid){
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('verificationMessage').style.display='none';
    document.getElementById('dashboard').classList.add('active');

    // Listen for coin updates
    db.collection('users').doc(uid).onSnapshot(doc=>{
        const data = doc.data();
        document.getElementById('coinCount').innerText = data.coins || 0;
    });
}

// Generate function (simulate)
function startGeneration(){
    if(!currentUser) return alert('Login first!');
    const uid = currentUser.uid;
    db.collection('users').doc(uid).get().then(doc=>{
        const coins = doc.data().coins || 0;
        if(coins < 5) return alert('Not enough coins!');
        // Deduct 5 coins
        db.collection('users').doc(uid).update({ coins: coins - 5 });
        alert('Vocal generation started!'); // Here you would integrate AI generation
    });
}

// Coins Popup
function toggleCoinsPopup(){ 
    const popup = document.getElementById('coinsPopup'); 
    popup.style.display = popup.style.display==='flex' ? 'none':'flex'; 
}
function closeCoinsPopup(){ document.getElementById('coinsPopup').style.display='none'; }

// Daily coins
function claimDaily(){
    if(!currentUser) return alert('Login first!');
    const uid = currentUser.uid;
    db.collection('users').doc(uid).get().then(doc=>{
        const data = doc.data();
        const lastClaim = data.dailyClaim || 0;
        const now = Date.now();
        if(now - lastClaim < 24*60*60*1000) return alert('You already claimed daily coins!'); 
        db.collection('users').doc(uid).update({
            coins: (data.coins || 0) + 5,
            dailyClaim: now
        });
        alert('+5 daily coins added!');
    });
}

// YouTube bonus
function claimYouTube(){
    if(!currentUser) return alert('Login first!');
    const uid = currentUser.uid;
    db.collection('users').doc(uid).get().then(doc=>{
        const data = doc.data();
        if(data.youtubeClaimed) return alert('You already claimed YouTube bonus!');
        window.open('https://www.youtube.com/channel/YOUR_CHANNEL_ID','_blank');
        // Wait for user to come back (simple simulation)
        setTimeout(()=>{
            db.collection('users').doc(uid).update({
                coins: (data.coins || 0) + 10,
                youtubeClaimed: true
            });
            alert('+10 coins added for subscribing!');
        },5000);
    });
}

// Redeem codes
const codes = {
    "LPHONK10": 10,
    "FUNK20": 20
};
function redeemCoins(){
    if(!currentUser) return alert('Login first!');
    const code = document.getElementById('redeemCode').value.trim();
    if(codes[code]){
        const uid = currentUser.uid;
        db.collection('users').doc(uid).get().then(doc=>{
            const data = doc.data();
            db.collection('users').doc(uid).update({
                coins: (data.coins || 0) + codes[code]
            });
            alert(`+${codes[code]} coins added!`);
            delete codes[code]; // one-time use
            document.getElementById('redeemCode').value = '';
        });
    } else {
        alert('Invalid or already used code!');
    }
}

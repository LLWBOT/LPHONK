/* coins.js
   - coins popup logic: daily, youtube flow, redeem codes
   - visual generation hooks (startGenerationVisual / stopGenerationVisual)
*/

const db = firebase.firestore();
const authInst = firebase.auth();

// REDEEMABLE CODES (one-time per server-side lifetime)
const REDEEM_CODES = {
  'LPHONK10': 10,
  'FUNKBONUS': 15
};

// start generation visual (simple UI feedback - glow waves)
function startGenerationVisual(){
  const waves = document.querySelectorAll('.wave');
  waves.forEach((w,i)=> w.style.transition = 'transform 0.12s linear');
  // quick pulsing
  waves.forEach((w,i)=> w.style.transform = 'scaleX(2)');
}

// stop generation visual
function stopGenerationVisual(){
  const waves = document.querySelectorAll('.wave');
  waves.forEach((w,i)=> w.style.transform = 'scaleX(1)');
}

// claim daily +5
function claimDaily(){
  const user = authInst.currentUser;
  if(!user) return alert('Please login first');
  const uref = db.collection('users').doc(user.uid);
  uref.get().then(doc=>{
    const data = doc.data() || {};
    const last = data.dailyClaim || 0;
    if(Date.now() - last < 24*60*60*1000) {
      alert('Daily already claimed. Come back later.');
      return;
    }
    uref.update({ coins: (data.coins || 0) + 5, dailyClaim: Date.now() }).then(()=>{
      alert('+5 coins added (daily)');
      document.getElementById('dailyBtn').disabled = true;
    });
  });
}

// YouTube flow: open channel in new tab then user clicks "I've subscribed" to confirm
function startYouTubeFlow(){
  const user = authInst.currentUser;
  if(!user) return alert('Please login first');
  const uref = db.collection('users').doc(user.uid);
  uref.get().then(doc=>{
    const data = doc.data() || {};
    if(data.youtubeClaimed){
      alert('You already claimed the YouTube bonus.');
      return;
    }
    // open channel
    const channelUrl = 'https://www.youtube.com/channel/YOUR_CHANNEL_ID';
    window.open(channelUrl, '_blank');

    // insert a confirm button in popup so user clicks when they return
    const yBtn = document.getElementById('youtubeClaimBtn');
    yBtn.innerText = 'I subscribed — Confirm +10';
    yBtn.onclick = function(){
      // validate once and grant
      uref.get().then(d2=>{
        const dd = d2.data() || {};
        if(dd.youtubeClaimed) return alert('Already claimed.');
        uref.update({ coins: (dd.coins || 0) + 10, youtubeClaimed: true }).then(()=>{
          alert('+10 coins added for subscribing!');
          yBtn.disabled = true;
          yBtn.innerText = 'Subscribed ✓';
        });
      });
    };
  });
}

// redeem codes
function redeemCoins(){
  const code = document.getElementById('redeemCode').value.trim();
  if(!code) return alert('Enter a code');
  const val = REDEEM_CODES[code];
  if(!val) return alert('Invalid or used code');
  const user = authInst.currentUser;
  if(!user) return alert('Login first');
  const uref = db.collection('users').doc(user.uid);
  uref.get().then(d=>{
    const data = d.data() || {};
    // grant
    uref.update({ coins: (data.coins || 0) + val }).then(()=>{
      alert(`+${val} coins added!`);
      // make code one-time server-side by deleting from object (client-side only)
      delete REDEEM_CODES[code];
      document.getElementById('redeemCode').value = '';
    });
  });
}

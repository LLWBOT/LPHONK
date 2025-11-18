/* animations.js
   - Wave motion for .wave elements
   - subtle floating for headphone svg
*/

(function(){
  // animate waves by scaling
  const wave1 = document.querySelector('.wave-1');
  const wave2 = document.querySelector('.wave-2');
  const wave3 = document.querySelector('.wave-3');

  function rand(min,max){ return min + Math.random()*(max-min); }

  function tick(){
    if(wave1) wave1.style.transform = `scaleX(${0.9 + Math.abs(Math.sin(Date.now()/800))*1.2})`;
    if(wave2) wave2.style.transform = `scaleX(${0.8 + Math.abs(Math.sin(Date.now()/1000))*1.4})`;
    if(wave3) wave3.style.transform = `scaleX(${0.7 + Math.abs(Math.sin(Date.now()/1200))*1.6})`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // headphone bobbing
  const svg = document.getElementById('headphoneSVG');
  if(svg){
    let t0 = Date.now();
    (function bob(){
      const t = (Date.now()-t0)/1000;
      svg.style.transform = `translateY(${Math.sin(t*0.9)*6}px) rotate(${Math.sin(t*0.3)*0.7}deg)`;
      requestAnimationFrame(bob);
    })();
  }
})();

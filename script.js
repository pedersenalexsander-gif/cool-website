const glow = document.querySelector('#glow');
const toast = document.querySelector('#toast');
const body = document.body;

window.addEventListener('pointermove', (e) => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

const moods = [
  'Current mood: suspiciously productive.',
  'Current mood: 14 browser tabs and a dream.',
  'Current mood: aggressively optimistic.',
  'Current mood: pixel-perfect-ish.',
  'Current mood: one coffee from greatness.',
  'Current mood: creatively unhinged.'
];

document.querySelector('#moodButton').addEventListener('click', () => {
  document.querySelector('#moodText').textContent = moods[Math.floor(Math.random() * moods.length)];
});

const ideas = [
  'Make a one-page site for an imaginary nightclub.',
  'Take 10 photos of things nobody else notices.',
  'Design the worst logo possible. Then make it good.',
  'Build something useful in under 60 minutes.',
  'Write a ridiculous product idea and pitch it seriously.',
  'Go somewhere you have never walked before.'
];

document.querySelector('#ideaButton').addEventListener('click', () => {
  notify(ideas[Math.floor(Math.random() * ideas.length)]);
});

function chaos() {
  body.classList.remove('chaos');
  void body.offsetWidth;
  body.classList.add('chaos');
  document.documentElement.style.setProperty('--acid', `hsl(${Math.floor(Math.random()*360)} 100% 55%)`);
  notify('CHAOS SUCCESSFULLY ADDED.');
}

document.querySelector('#chaosButton').addEventListener('click', chaos);
document.querySelector('#engineButton').addEventListener('click', chaos);

document.querySelectorAll('.tilt').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateY(${x*5}deg) rotateX(${-y*5}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
});

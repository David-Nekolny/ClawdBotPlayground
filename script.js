/* ============================================================
   ASCII BOX DRAWING ENGINE
   Replaces CSS borders with real text characters:
   ┌──────────────────────────────────────────┐
   │  Like this. Borders are actual text.     │
   └──────────────────────────────────────────┘
============================================================ */

let _charSize = null;

function measureChar() {
  if (_charSize) return _charSize;
  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  span.style.cssText = [
    'font-family: "Courier New", monospace',
    'font-size: 13px',
    'line-height: 1',
    'position: fixed',
    'top: -9999px',
    'left: -9999px',
    'white-space: pre',
    'visibility: hidden'
  ].join(';');
  // Use repeating chars for accuracy; two lines to measure height
  span.textContent = '─'.repeat(40) + '\n' + '─'.repeat(40);
  document.body.appendChild(span);
  const rect = span.getBoundingClientRect();
  _charSize = { w: rect.width / 40, h: rect.height / 2 };
  span.remove();
  return _charSize;
}

function drawAsciiBox(el) {
  el.querySelector('.ascii-box')?.remove();
  const { w, h } = measureChar();

  const cols = Math.max(6, Math.round(el.clientWidth  / w));
  const rows = Math.max(4, Math.round(el.clientHeight / h));

  // Alternate dash + space so it's clearly text, not a CSS border: ─ ─ ─ ─ ─ ─
  const inner = Math.max(0, cols - 2);
  const hBar  = Array.from({ length: inner }, (_, i) => i % 2 === 0 ? '─' : ' ').join('');
  const blank = ' '.repeat(inner);
  const lines = [
    '┌' + hBar  + '┐',
    ...Array.from({ length: Math.max(0, rows - 2) }, () => '│' + blank + '│'),
    '└' + hBar  + '┘'
  ].join('\n');

  const pre = document.createElement('pre');
  pre.className = 'ascii-box';
  pre.setAttribute('aria-hidden', 'true');
  pre.style.cssText = [
    'position: absolute',
    'inset: 0',
    'margin: 0',
    'padding: 0',
    'pointer-events: none',
    'overflow: hidden',
    'font-family: "Courier New", monospace',
    'font-size: 13px',
    'line-height: ' + h + 'px',
    'color: var(--accent, #00ff41)',
    'opacity: 0.55',
    'white-space: pre',
    'z-index: 0',
    'border: none',
    'background: none'
  ].join(';');
  pre.textContent = lines;

  el.style.position = 'relative';
  el.appendChild(pre);
}

const BOX_SELECTOR = '.skill-card, .project-card';
let _resizeObserver = null;

function enableAsciiBoxes() {
  document.querySelectorAll(BOX_SELECTOR).forEach(drawAsciiBox);
  _resizeObserver = new ResizeObserver(entries =>
    entries.forEach(e => drawAsciiBox(e.target))
  );
  document.querySelectorAll(BOX_SELECTOR).forEach(el => _resizeObserver.observe(el));
}

function disableAsciiBoxes() {
  document.querySelectorAll('.ascii-box').forEach(el => el.remove());
  _resizeObserver?.disconnect();
  _resizeObserver = null;
}

/* ============================================================
   ASCII MODE TOGGLE
============================================================ */
const asciiToggle = document.getElementById('asciiToggle');
const ASCII_KEY   = 'ascii-mode';

function setAsciiMode(enabled) {
  document.body.classList.toggle('ascii-mode', enabled);
  localStorage.setItem(ASCII_KEY, enabled ? '1' : '0');
  if (enabled) enableAsciiBoxes();
  else          disableAsciiBoxes();
}

asciiToggle.addEventListener('click', () => {
  setAsciiMode(!document.body.classList.contains('ascii-mode'));
});

// Restore on load — wait one frame so layout is ready
if (localStorage.getItem(ASCII_KEY) === '1') {
  document.body.classList.add('ascii-mode');
  requestAnimationFrame(() => enableAsciiBoxes());
}

/* ============================================================
   SCROLL REVEAL
============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .project-card, .timeline__item, .stat').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

/* ============================================================
   ACTIVE NAV HIGHLIGHT
============================================================ */
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? '#e8e8e8' : '';
  });
});

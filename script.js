function setupTocScrollSpy() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[data-toc-id]'));
  const entries = links.map(link => {
    const rawId = link.getAttribute('data-toc-id') || '';
    const target = document.getElementById(rawId);
    return target ? { id: rawId, link, target } : null;
  }).filter(Boolean);
  if (entries.length === 0) return;
  let activeId = '';
  const setActive = (id) => {
    if (!id || id === activeId) return;
    const prev = links.find(link => (link.getAttribute('data-toc-id') || '') === activeId);
    if (prev) { prev.classList.remove('toc-active'); prev.removeAttribute('aria-current'); }
    const next = links.find(link => (link.getAttribute('data-toc-id') || '') === id);
    if (!next) return;
    next.classList.add('toc-active');
    next.setAttribute('aria-current', 'location');
    activeId = id;
    next.scrollIntoView({ block: 'nearest' });
  };
  let ticking = false;
  const update = () => {
    ticking = false;
    const threshold = 140;
    let current = entries[0];
    for (const entry of entries) {
      const top = entry.target.getBoundingClientRect().top;
      if (top <= threshold) current = entry; else break;
    }
    setActive(current ? current.id : '');
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('hashchange', requestUpdate);
  requestUpdate();
}

window.onscroll = function () {
  const btn = document.getElementById('btn-back-to-top');
  if (btn) {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) { btn.style.display = 'flex'; }
    else { btn.style.display = 'none'; }
  }
};

/* ------------------------------------------------------------------ */
/* ランダム機能: 掲載されている団体の寄付ページのどれかへジャンプする   */
/* ------------------------------------------------------------------ */
function getDonationLinks() {
  const main = document.querySelector('main');
  if (!main) return [];
  return Array.from(main.querySelectorAll('h2 > a[href]')).map(a => ({
    name: a.textContent.trim(),
    url: a.getAttribute('href'),
  })).filter(item => item.url);
}

function handleAutoRandomJump() {
  if (window.location.search.includes('random')) {
    const links = getDonationLinks();
    if (links.length > 0) {
      const pick = links[Math.floor(Math.random() * links.length)];
      window.location.replace(pick.url);
    }
  }
}

function setupRandomJump() {
  const btn = document.getElementById('btn-random');
  const label = document.getElementById('random-hint');
  if (!btn) return;

  const links = getDonationLinks();
  if (links.length === 0) {
    btn.disabled = true;
    if (label) label.textContent = '';
    return;
  }

  btn.addEventListener('click', () => {
    const pick = links[Math.floor(Math.random() * links.length)];
    if (label) label.textContent = `→ ${pick.name} に移動します…`;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '選んでいます…';

    window.setTimeout(() => {
      window.open(pick.url, '_blank', 'noopener');
      btn.disabled = false;
      btn.textContent = originalText;
      if (label) label.textContent = `直近: ${pick.name} を開きました`;
    }, 350);
  });
}

handleAutoRandomJump();
setupTocScrollSpy();
setupRandomJump();

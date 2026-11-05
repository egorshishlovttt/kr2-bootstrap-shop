// Общий скрипт: подключается на всех страницах, каждый блок проверяет наличие своих элементов.
var $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const fmtRub = (n) => `${n.toLocaleString('ru-RU')} ₽`; // формат цены, нужен на нескольких страницах

/* 1. Переключатель темы (выбор хранится в localStorage) */
const themeButton = $('#theme-toggle');
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-bs-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
  if (themeButton) {
    themeButton.textContent = theme === 'dark' ? '☀ Светлая' : '☾ Тёмная';
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  }
};
if (themeButton) {
  applyTheme(document.documentElement.getAttribute('data-bs-theme'));
  themeButton.addEventListener('click', () =>
    applyTheme(document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark'));
}

/* 1а. Высота шапки для липких элементов (фильтры каталога) */
const siteHeader = $('.site-header');
if (siteHeader) {
  const setOffset = () => document.documentElement.style.setProperty('--header-offset', `${siteHeader.offsetHeight}px`);
  setOffset();
  if (window.ResizeObserver) new ResizeObserver(setOffset).observe(siteHeader); else addEventListener('resize', setOffset);
}

/* 2. Кнопка «Наверх» */
const toTop = $('#to-top');
if (toTop) {
  addEventListener('scroll', () => toTop.classList.toggle('to-top--visible', scrollY > 400));
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
}

/* 3. Фильтры каталога по возрасту и уровню */
const filterForm = $('#filters-form');
if (filterForm) {
  const apply = () => {
    const age = $('#filter-age').value, level = $('#filter-level').value;
    let shown = 0;
    $$('.js-card').forEach((card) => {
      const ok = (!age || card.dataset.age.split(' ').includes(age)) && (!level || card.dataset.level === level);
      card.classList.toggle('d-none', !ok);
      if (ok) shown++;
    });
    $('#filters-count').textContent = shown;
    $('#catalog-empty').classList.toggle('d-none', shown > 0);
  };
  filterForm.addEventListener('input', apply);
  filterForm.addEventListener('reset', () => setTimeout(apply));
  apply();
}

/* 4. Страница тренировки: данные из products.js по ?id=N */
const productRoot = $('#product-root');
if (productRoot) {
  const id = Number(new URLSearchParams(location.search).get('id')) || 1;
  const t = TRAININGS.find((x) => x.id === id) || TRAININGS[0];
  const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };
  document.title = `${t.name} — скалодром «Хват»`;
  set('#product-title', t.name); set('#product-crumb', t.name);
  set('#product-desc', t.desc); set('#product-bring', t.bring);
  set('#product-price', `${t.price.toLocaleString('ru-RU')} ₽`);
  set('#product-level', t.level); set('#product-age', `${t.age} лет`); set('#product-dur', `${t.dur} мин`);
  const img = $('#product-image'); img.src = `images/training-${t.id}.jpg`; img.alt = `Зал: ${t.name}`;
  $('#product-order').href = `order.html?id=${t.id}`;
  $('#product-schedule').innerHTML = t.sessions.map((s) => `<li class="list-group-item">${DAYS[s[0]]}, ${s[1]}</li>`).join('');
  $('#product-similar').innerHTML = TRAININGS.filter((x) => x.id !== t.id && x.type === t.type || x.id !== t.id && x.ages.some((a) => t.ages.includes(a))).slice(0, 3)
    .map((x) => `<div class="col-12 col-md-4"><a class="card h-100 text-reset text-decoration-none training-card" href="product.html?id=${x.id}"><img class="card-img-top" src="images/training-${x.id}.jpg" alt="" width="480" height="320" loading="lazy"><div class="card-body"><h3 class="h6 mb-1">${x.name}</h3><span class="badge text-bg-secondary">${x.level}</span> <b>${x.price} ₽</b></div></a></div>`).join('');
}

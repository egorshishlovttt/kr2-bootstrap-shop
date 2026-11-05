// Дополнительные возможности: калькулятор, тренеры, подбор тренировки, галерея.

/* Калькулятор стоимости */
const calc = $('#calc');
if (calc) {
  const update = () => {
    const price = Number($('#calc-type').value);
    const n = Math.min(30, Math.max(1, Number($('#calc-visits').value) || 1));
    const rent = $('#calc-rent').checked ? 250 : 0;
    const k = n >= 8 ? 0.8 : n >= 4 ? 0.9 : 1;
    let sum = Math.round(n * (price + rent) * k);
    let note = n >= 4 ? `Скидка за регулярность ${Math.round((1 - k) * 100)}%. Расчёт ориентировочный.` : 'Скидка действует от 4 посещений. Расчёт ориентировочный.';
    if (sum > 7900 + n * rent) { sum = 7900 + n * rent; note = 'Выгоднее абонемент «Безлимит» за 7 900 ₽.'; }
    $('#calc-total').textContent = fmtRub(sum);
    $('#calc-note').textContent = note;
  };
  calc.addEventListener('input', update);
  update();
}

/* Тренеры: модальное окно с данными */
const trainerModal = $('#trainerModal');
if (trainerModal) {
  trainerModal.addEventListener('show.bs.modal', (e) => {
    const t = TRAINERS[Number(e.relatedTarget.dataset.trainer)];
    $('#trainer-name').textContent = t.name;
    const ph = $('#trainer-photo'); ph.src = t.photo; ph.alt = `Тренер ${t.name}`;
    $('#trainer-spec').textContent = `${t.spec}, стаж ${t.years} лет`;
    $('#trainer-bio').textContent = t.bio;
    $('#trainer-awards').innerHTML = t.awards.map((a) => `<li>${a}</li>`).join('');
    $('#trainer-groups').innerHTML = t.groups.map((id) => {
      const g = TRAININGS.find((x) => x.id === id);
      return `<li class="list-group-item"><b>${g.name}</b><br><small>${g.sessions.map((s) => `${DAYS_SHORT[s[0]]} ${s[1]}`).join(', ')}</small></li>`;
    }).join('');
  });
}

/* Галерея: фильтр по зонам */
const galleryFilter = $('#gallery-filter');
if (galleryFilter) {
  galleryFilter.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    $$('button', galleryFilter).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    $$('.gallery__item').forEach((it) => it.classList.toggle('d-none', btn.dataset.zone && it.dataset.zone !== btn.dataset.zone));
  });
}

/* Подбор тренировки: 4 вопроса */
const quiz = $('#quiz');
if (quiz) {
  const Q = [['Для кого занятия?', ['Для себя', 'Для ребёнка', 'Соревнования']], ['Возраст?', ['6–9 лет', '10–15 лет', '16 и старше']],
    ['Опыт в скалолазании?', ['Нет', 'Пробовал(а)', 'Занимаюсь давно']], ['Удобные дни?', ['Будни', 'Выходные', 'Любые']]];
  let answers = [];
  const render = () => {
    const i = answers.length;
    if (i < Q.length) {
      quiz.innerHTML = `<h3 class="h5">${Q[i][0]} <small class="text-body-secondary">${i + 1}/${Q.length}</small></h3><div class="progress mb-3" role="progressbar" aria-label="Прогресс теста"><div class="progress-bar" style="width:${i * 25}%"></div></div><div class="d-flex flex-wrap gap-2">${Q[i][1].map((o, j) => `<button class="btn btn-outline-primary" data-answer="${j}">${o}</button>`).join('')}</div>`;
      return;
    }
    const [who, age, exp, days] = answers, group = ['kids', 'teens', 'adults'][age];
    const list = TRAININGS.map((t) => {
      let s = t.ages.includes(group) ? 3 : -9;
      if (who === 1 && !t.ages.some((a) => a !== 'adults')) s -= 9;
      if (who === 2 && t.level === 'Продвинутый') s += 3;
      if ((exp === 0 && t.level === 'Новичок') || (exp === 1 && t.level === 'Средний') || (exp === 2 && t.level !== 'Новичок')) s += 2;
      if (days < 2 && t.sessions.some((x) => (days === 0 ? x[0] < 5 : x[0] >= 5))) s++;
      return [s, t];
    }).filter((x) => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 3);
    quiz.innerHTML = `<h3 class="h5">Вам подойдут</h3><div class="row g-3">${list.map(([, t]) => `<div class="col-12 col-md-4"><div class="card h-100"><div class="card-body"><h4 class="h6">${t.name}</h4><p class="small mb-2">${t.level}, ${t.dur} мин, ${t.price} ₽</p><a class="btn btn-primary btn-sm" href="order.html?id=${t.id}">Записаться</a> <a class="btn btn-outline-secondary btn-sm" href="product.html?id=${t.id}">Подробнее</a></div></div></div>`).join('') || '<div class="alert alert-info">Точного совпадения нет. Посмотрите все тренировки или спросите администратора.</div>'}</div><button class="btn btn-link px-0 mt-3" data-restart>Пройти заново</button>`;
  };
  quiz.addEventListener('click', (e) => {
    if (e.target.dataset.answer !== undefined) { answers.push(Number(e.target.dataset.answer)); render(); }
    if (e.target.dataset.restart !== undefined) { answers = []; render(); }
  });
  render();
}

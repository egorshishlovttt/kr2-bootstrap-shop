// Онлайн-запись: тренировка → дата → свободный слот → имя и телефон → окно подтверждения.
const orderForm = $('#order-form');
if (orderForm) {
  const sel = $('#order-training'), daysBox = $('#slot-days'), timesBox = $('#slot-times'), alertBox = $('#order-alert');
  const state = { date: '', time: '' };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const weekday = (d) => (d.getDay() + 6) % 7;
  sel.innerHTML = '<option value="">Выберите тренировку</option>' + TRAININGS.map((t) => `<option value="${t.id}">${t.name} — ${t.price} ₽</option>`).join('');
  const pre = Number(new URLSearchParams(location.search).get('id'));
  if (pre) sel.value = pre;
  const current = () => TRAININGS.find((t) => t.id === Number(sel.value));

  const renderDays = () => {
    const t = current();
    daysBox.innerHTML = [...Array(14)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      const ok = t && t.sessions.some((s) => s[0] === weekday(d));
      const cls = state.date === iso(d) ? 'btn-primary' : ok ? 'btn-outline-success' : 'btn-outline-danger';
      return `<button type="button" class="btn btn-sm ${cls}" data-date="${iso(d)}" ${ok ? '' : 'disabled'}>${DAYS_SHORT[weekday(d)]} ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}</button>`;
    }).join('');
  };
  const renderTimes = () => {
    const t = current();
    if (!t || !state.date) { timesBox.innerHTML = '<span class="text-body-secondary">Сначала выберите тренировку и дату.</span>'; return; }
    const wd = weekday(new Date(`${state.date}T12:00`));
    timesBox.innerHTML = t.sessions.filter((s) => s[0] === wd).map((s) => {
      const busy = (Number(state.date.replaceAll('-', '')) + parseInt(s[1])) % 5 === 0; // условная занятость
      const cls = state.time === s[1] ? 'btn-primary' : busy ? 'btn-outline-danger' : 'btn-outline-success';
      return `<button type="button" class="btn btn-sm ${cls}" data-time="${s[1]}" ${busy ? 'disabled' : ''}>${s[1]}${busy ? ' (занято)' : ''}</button>`;
    }).join('');
  };
  const refresh = () => { renderDays(); renderTimes(); };
  sel.addEventListener('change', () => { state.date = ''; state.time = ''; refresh(); });
  daysBox.addEventListener('click', (e) => { const b = e.target.closest('[data-date]'); if (b) { state.date = b.dataset.date; state.time = ''; refresh(); } });
  timesBox.addEventListener('click', (e) => { const b = e.target.closest('[data-time]'); if (b) { state.time = b.dataset.time; renderTimes(); } });

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#order-name'), phone = $('#order-phone'), agree = $('#order-agree');
    const t = current(), digits = phone.value.replace(/\D/g, '');
    const problems = [];
    if (!t || !state.date || !state.time) problems.push('выберите тренировку, дату и время');
    if (name.value.trim().length < 2) problems.push('введите имя');
    if (digits.length < 10) problems.push('введите телефон (10 цифр после +7)');
    if (!agree.checked) problems.push('подтвердите согласие на обработку данных');
    name.setAttribute('aria-invalid', String(name.value.trim().length < 2));
    phone.setAttribute('aria-invalid', String(digits.length < 10));
    if (problems.length) {
      alertBox.className = 'alert alert-danger'; alertBox.textContent = `Проверьте форму: ${problems.join('; ')}.`; return;
    }
    const when = new Date(`${state.date}T12:00`).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    const number = `HV-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const vals = [number, t.name, `${when}, ${state.time}`, `${t.dur} мин`, name.value.trim(), `+7 ${phone.value.trim()}`, fmtRub(t.price)];
    $('#confirm-lead').textContent = `Вы записаны на «${t.name}»: ${when}, в ${state.time}.`;
    $('#confirm-body').innerHTML = '<dl class="row mb-0">' + ['Номер записи', 'Тренировка', 'Дата и время', 'Длительность', 'Имя', 'Телефон', 'Стоимость'].map((k) => `<dt class="col-5">${k}</dt><dd class="col-7"></dd>`).join('') + '</dl>';
    $$('#confirm-body dd').forEach((dd, i) => { dd.textContent = vals[i]; }); // textContent защищает от HTML в имени
    alertBox.className = 'alert alert-success';
    alertBox.textContent = `Запись ${number} оформлена: ${t.name}, ${when}, ${state.time}. Мы позвоним для подтверждения.`;
    if (window.bootstrap) bootstrap.Modal.getOrCreateInstance($('#confirmModal')).show();
    scrollTo({ top: 0 });
    orderForm.reset(); state.date = ''; state.time = ''; sel.value = ''; refresh();
  });
  refresh();
}

// Подключается в <head> без defer, чтобы тема применялась до отрисовки страницы (нет мигания).
(function () {
  var theme = 'light';
  try { theme = localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) {}
  document.documentElement.setAttribute('data-bs-theme', theme);
})();

// Фото: страницы ссылаются на .jpg. Если файла нет, подставляется иллюстрация .svg с тем же именем.
(function () {
  function fallback(img) {
    var src = img.getAttribute('src') || '';
    if (/\.jpg$/.test(src)) img.src = src.replace(/\.jpg$/, '.svg');
  }
  addEventListener('error', function (e) { if (e.target.tagName === 'IMG') fallback(e.target); }, true);
  addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('img').forEach(function (img) { if (img.complete && !img.naturalWidth) fallback(img); });
  });
})();

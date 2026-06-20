/* =========================================================
   Андрей Комков — интерактив лендинга
   1) reveal-on-scroll  — плавное появление блоков .reveal
   2) счётчики          — анимация цифр в [data-count]

   Прогрессивное улучшение: класс .js на <html> включает
   скрытие .reveal только когда JS работает. Если скрипт
   не выполнился — контент виден сразу (страница не пустая).
   ========================================================= */

/* включаем «спрятанное» состояние только при работающем JS */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function show(el) {
    var delay = parseFloat(el.getAttribute('data-delay')) || 0;
    el.style.transitionDelay = delay + 's';
    el.classList.add('is-visible');
  }

  /* ---- 1. Reveal on scroll ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    reveals.forEach(function (el) {
      // элементы, уже видимые при загрузке, показываем сразу
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) {
        show(el);
      } else {
        io.observe(el);
      }
    });
  } else {
    // нет поддержки IO — просто показываем всё
    reveals.forEach(show);
  }

  /* страховка: если что-то осталось скрытым — показать через 1.6с */
  setTimeout(function () {
    reveals.forEach(function (el) {
      if (!el.classList.contains('is-visible')) show(el);
    });
  }, 1600);

  /* ---- 2. Animated number counters ---- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function runCounter(el) {
    if (el._counted) return;
    el._counted = true;

    var target = parseFloat(el.getAttribute('data-count'));
    var pre  = el.getAttribute('data-pre')  || '';
    var post = el.getAttribute('data-post') || '';
    var neg  = target < 0;
    var abs  = Math.abs(target);
    var duration = 1000;
    var start = performance.now();

    function step(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
      var value = Math.round(abs * eased);
      el.innerHTML = pre + (neg ? '−' : '') + value + post;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterIO.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

});

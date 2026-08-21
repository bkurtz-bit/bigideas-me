/* bigideas.me — standalone. The meters are the only moving part. */
document.getElementById('y').textContent = new Date().getFullYear();

/* The authored --fill stays on the element, so with no JS, no observer or a
   backgrounded tab the bars simply render at their real values. The animation
   is layered on top and only when it can actually be seen. */
(function () {
  var meters = document.querySelectorAll('.meter i');
  if (!meters.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  if (document.visibilityState !== 'visible') return;

  var restore = function (m) {
    m.style.setProperty('--fill', m.dataset.fill);
    delete m.dataset.fill;
  };

  meters.forEach(function (m) {
    m.dataset.fill = m.style.getPropertyValue('--fill').trim() || '1';
    m.style.setProperty('--fill', '0');
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      restore(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  meters.forEach(function (m) { io.observe(m); });

  // failsafe: nothing should be able to leave a bar sitting at zero
  setTimeout(function () {
    meters.forEach(function (m) { if (m.dataset.fill) restore(m); });
  }, 2000);
})();

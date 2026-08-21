/* bigideas.me — standalone. Meters and the hero aurora. */
document.getElementById('y').textContent = new Date().getFullYear();

/* ---- meters fill when they scroll into view -----------------------------
   The authored --fill stays on the element, so with no JS, no observer or a
   backgrounded tab the bars simply render at their real values. The animation
   is added on top and only when it can actually be seen. */
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

/* ---- drifting aurora --------------------------------------------------- */
(function () {
  var cv = document.getElementById('aurora');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var blobs = [
    { x: .22, y: .32, r: .52, c: [139, 92, 255], s: .00007, p: 0 },
    { x: .74, y: .48, r: .44, c: [42, 240, 224], s: .00011, p: 2.1 },
    { x: .52, y: .78, r: .38, c: [255, 61, 139], s: .00009, p: 4.3 }
  ];

  function size() {
    var d = Math.min(devicePixelRatio || 1, 2);
    cv.width = cv.clientWidth * d;
    cv.height = cv.clientHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  function frame(t) {
    var w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    blobs.forEach(function (b) {
      var dx = reduce ? 0 : Math.sin(t * b.s + b.p) * w * 0.07;
      var dy = reduce ? 0 : Math.cos(t * b.s * 1.3 + b.p) * h * 0.06;
      var cx = b.x * w + dx, cy = b.y * h + dy, rad = b.r * Math.max(w, h);
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, 'rgba(' + b.c.join(',') + ',0.30)');
      g.addColorStop(0.45, 'rgba(' + b.c.join(',') + ',0.10)');
      g.addColorStop(1, 'rgba(' + b.c.join(',') + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });

    ctx.globalCompositeOperation = 'source-over';
    if (!reduce) requestAnimationFrame(frame);
  }

  size();
  frame(0);                       // paint once synchronously — rAF may never run
  addEventListener('resize', function () { size(); frame(performance.now()); });
  if (!reduce) requestAnimationFrame(frame);
})();

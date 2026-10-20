// Feature clips are several MB each: nothing loads until a clip is scrolled to, and a clip
// only plays while it is on screen. Reduced motion or data saver gets plain controls instead.
(function () {
  var videos = document.querySelectorAll('[data-feature-video]');
  if (!videos.length) { return; }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  if (reduceMotion || saveData || !('IntersectionObserver' in window)) {
    videos.forEach(function (v) { v.controls = true; });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting) {
        var playing = v.play();
        if (playing && playing.catch) {
          playing.catch(function () { v.controls = true; });
        }
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.5 });

  videos.forEach(function (v) { observer.observe(v); });
})();

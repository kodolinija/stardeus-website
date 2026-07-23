(function () {
  var container = document.getElementById('cusdis_thread');
  if (!container) {
    return;
  }

  function fit(iframe) {
    try {
      var doc = iframe.contentDocument;
      if (!doc || !doc.documentElement) {
        return;
      }
      var height = doc.documentElement.scrollHeight;
      if (height > 0) {
        iframe.style.height = height + 'px';
      }
    } catch (e) {
      // Cross-origin/unavailable - leave Cusdis's own resize in charge.
    }
  }

  function watch(iframe) {
    fit(iframe);
    iframe.addEventListener('load', function () {
      fit(iframe);
      try {
        var observer = new ResizeObserver(function () {
          fit(iframe);
        });
        observer.observe(iframe.contentDocument.documentElement);
      } catch (e) {
        // ResizeObserver unavailable/blocked - ignore.
      }
    });
  }

  var existing = container.querySelector('iframe');
  if (existing) {
    watch(existing);
    return;
  }

  var mo = new MutationObserver(function (mutations, obs) {
    var iframe = container.querySelector('iframe');
    if (iframe) {
      obs.disconnect();
      watch(iframe);
    }
  });
  mo.observe(container, { childList: true, subtree: true });
})();

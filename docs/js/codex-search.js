(function () {
  var boxes = document.querySelectorAll('.codex-search');
  if (boxes.length === 0 || typeof fetch !== 'function') {
    return;
  }

  var index = null;

  function ensureIndex(indexUrl, callback) {
    if (index) {
      callback();
      return;
    }
    fetch(indexUrl).then(function (response) {
      return response.json();
    }).then(function (data) {
      index = data;
      callback();
    });
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  // .codex-search-results is position:fixed so it isn't clipped by the
  // horizontally-scrollable tab bar it lives inside - its position has to be
  // computed from the input's actual screen location instead of via CSS.
  function positionResults(input, results) {
    var rect = input.getBoundingClientRect();
    results.style.left = rect.left + 'px';
    results.style.top = (rect.bottom + 4) + 'px';
    results.style.width = rect.width + 'px';
  }

  function render(input, results, matches) {
    results.innerHTML = '';
    if (matches.length === 0) {
      results.hidden = true;
      return;
    }
    for (var i = 0; i < matches.length; i++) {
      var entry = matches[i];
      var link = document.createElement('a');
      link.href = entry.u;
      link.innerHTML = '<span class="codex-search-title">' + escapeHtml(entry.t) + '</span>'
        + '<span class="codex-search-group">' + escapeHtml(entry.g) + '</span>';
      results.appendChild(link);
    }
    positionResults(input, results);
    results.hidden = false;
  }

  function search(input, results, query) {
    query = query.trim().toLowerCase();
    if (query === '') {
      render(input, results, []);
      return;
    }
    var matches = [];
    for (var i = 0; i < index.length && matches.length < 20; i++) {
      if (index[i].t.toLowerCase().indexOf(query) !== -1) {
        matches.push(index[i]);
      }
    }
    render(input, results, matches);
  }

  for (var b = 0; b < boxes.length; b++) {
    (function (box) {
      var input = box.querySelector('.codex-search-input');
      var results = box.querySelector('.codex-search-results');
      var indexUrl = input.getAttribute('data-index-url');

      input.addEventListener('focus', function () {
        ensureIndex(indexUrl, function () {});
      });

      input.addEventListener('input', function () {
        ensureIndex(indexUrl, function () {
          search(input, results, input.value);
        });
      });

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          var first = results.querySelector('a');
          if (first) {
            window.location.href = first.getAttribute('href');
          }
        } else if (event.key === 'Escape') {
          render(input, results, []);
          input.blur();
        }
      });

      document.addEventListener('click', function (event) {
        if (event.target !== input && !results.contains(event.target)) {
          results.hidden = true;
        }
      });
    }(boxes[b]));
  }
}());

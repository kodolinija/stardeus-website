(function () {
  var dialog = document.querySelector('[data-screenshot-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') {
    return;
  }

  var image = dialog.querySelector('[data-screenshot-image]');
  var closeButton = dialog.querySelector('[data-screenshot-close]');
  var links = document.querySelectorAll('[data-screenshot-lightbox]');
  var opener = null;

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (event) {
      event.preventDefault();
      opener = event.currentTarget;
      var thumbnail = opener.querySelector('img');
      image.src = opener.href;
      image.alt = thumbnail ? thumbnail.alt : '';
      dialog.showModal();
    });
  }

  closeButton.addEventListener('click', function () {
    dialog.close();
  });

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', function () {
    image.removeAttribute('src');
    image.alt = '';
    if (opener) {
      opener.focus();
      opener = null;
    }
  });
}());

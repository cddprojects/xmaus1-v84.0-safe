(function () {
  var boxes = document.querySelectorAll('.checklist input[type="checkbox"]');
  var progress = document.getElementById('progress');
  var storageKey = 'fwg-checklist';

  function readSaved() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch (e) { return []; }
  }
  function update() {
    var done = 0;
    var state = [];
    boxes.forEach(function (box) {
      state.push(box.checked);
      if (box.checked) done += 1;
    });
    progress.textContent = done + ' of ' + boxes.length + ' done';
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (e) {}
  }
  var saved = readSaved();
  boxes.forEach(function (box, i) {
    box.checked = !!saved[i];
    box.addEventListener('change', update);
  });
  update();

  var form = document.getElementById('enquiry');
  var confirmBox = document.getElementById('confirm');
  var messages = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address, like name@example.com.',
    topic: 'Please choose a topic.',
    question: 'Please type your question.'
  };

  function validate(field) {
    var el = form.elements[field];
    var value = el.value.trim();
    var ok = value !== '';
    if (field === 'email' && ok) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    var wrap = el.closest('.field');
    wrap.classList.toggle('invalid', !ok);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    document.getElementById(field + '-error').textContent = ok ? '' : messages[field];
    return ok;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    confirmBox.hidden = true;
    var firstBad = null;
    Object.keys(messages).forEach(function (field) {
      if (!validate(field) && !firstBad) firstBad = form.elements[field];
    });
    if (firstBad) { firstBad.focus(); return; }

    var endpoint = form.getAttribute('data-endpoint');
    var payload = new FormData(form);

    function done() {
      form.reset();
      confirmBox.hidden = false;
      confirmBox.focus();
    }
    function fail() {
      confirmBox.hidden = false;
      confirmBox.textContent = 'Sorry, something went wrong and your question wasn’t sent. Please try again in a few minutes.';
    }

    if (!endpoint) { done(); return; }
    fetch(endpoint, { method: 'POST', body: payload, headers: { Accept: 'application/json' } })
      .then(function (res) { return res.ok ? done() : fail(); })
      .catch(fail);
  });
})();

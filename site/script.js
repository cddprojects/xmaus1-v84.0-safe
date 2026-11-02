(function () {
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('header nav a'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
          map[entry.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  var form = document.getElementById('enquiry');
  var confirmBox = document.getElementById('confirm');
  var messages = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address, like name@example.com.',
    question: 'Please type your question.'
  };

  function validate(field) {
    var el = form.elements[field];
    var value = el.value.trim();
    var ok = value !== '';
    if (field === 'email' && ok) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    el.closest('.field').classList.toggle('invalid', !ok);
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

    function done() {
      form.reset();
      confirmBox.textContent = 'Thanks, we’ve received your question. We’ll reply to the email address you gave us.';
      confirmBox.hidden = false;
      confirmBox.focus();
    }
    function fail() {
      confirmBox.textContent = 'Sorry, something went wrong and your question wasn’t sent. Please try again in a few minutes.';
      confirmBox.hidden = false;
    }

    if (!endpoint) { done(); return; }
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) { return res.ok ? done() : fail(); })
      .catch(fail);
  });
})();

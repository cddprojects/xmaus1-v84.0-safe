(function () {
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

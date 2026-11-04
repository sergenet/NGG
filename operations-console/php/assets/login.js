'use strict';

const form = document.getElementById('login-form');
const input = document.getElementById('password');
const message = document.getElementById('message');
const submit = document.getElementById('submit');

// If a session is already valid there is nothing to type.
if (form && input) {
  fetch('/control-room/api.php?action=session', { cache: 'no-store' })
    .then((response) => response.json())
    .then((state) => {
      if (state && state.authenticated) {
        window.location.replace('/control-room/');
      }
    })
    .catch(() => {});
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  submit.disabled = true;
  submit.textContent = 'Signing in…';
  try {
    const response = await fetch('/control-room/api.php?action=login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: input.value }),
    });
    if (response.status === 204) {
      window.location.replace('/control-room/');
      return;
    }
    if (response.status === 429) {
      message.textContent = 'Too many attempts. Wait 15 minutes and try again.';
      return;
    }
    const body = await response.json().catch(() => ({}));
    message.textContent = body.error || 'Sign in failed.';
  } catch (error) {
    message.textContent = 'Could not reach the dashboard. Check your connection and try again.';
  } finally {
    submit.disabled = false;
    submit.textContent = 'Sign in';
  }
});

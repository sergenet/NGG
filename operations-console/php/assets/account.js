'use strict';

const dialog = document.getElementById('account-dialog');
const message = document.getElementById('account-message');
const newPassword = document.getElementById('new-password');
const confirmPassword = document.getElementById('confirm-password');
const saveButton = document.getElementById('save-password');

if (dialog && newPassword) {
  document.getElementById('open-account').addEventListener('click', () => {
    message.textContent = '';
    message.className = '';
    newPassword.value = '';
    confirmPassword.value = '';
    dialog.showModal();
    newPassword.focus();
  });

  document.getElementById('cancel-account').addEventListener('click', () => dialog.close());

  document.getElementById('logout').addEventListener('click', async () => {
    try {
      await fetch('/control-room/api.php?action=logout', { method: 'POST' });
    } finally {
      window.location.replace('/control-room/login.html');
    }
  });

  document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    message.className = '';

    if (newPassword.value.length < 10) {
      message.textContent = 'Use at least 10 characters.';
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      message.textContent = 'The two passwords do not match.';
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Saving…';
    try {
      const response = await fetch('/control-room/api.php?action=password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassword.value }),
      });
      if (response.status === 204) {
        message.className = 'ok';
        message.textContent = 'Password saved. Use it the next time you sign in.';
        newPassword.value = '';
        confirmPassword.value = '';
        return;
      }
      if (response.status === 401) {
        window.location.replace('/control-room/login.html');
        return;
      }
      const body = await response.json().catch(() => ({}));
      message.textContent = body.error || 'Could not save the password.';
    } catch (error) {
      message.textContent = 'Could not reach the dashboard. Try again.';
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Save password';
    }
  });
}

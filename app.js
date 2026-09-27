// Local concept only. No analytics, remote form endpoints, or persistent storage.
const menu = document.querySelector('#mobile-nav');
const toggle = document.querySelector('.menu-toggle');
const appointment = document.querySelector('#appointment-dialog');
const visit = document.querySelector('#visit-dialog');
const form = document.querySelector('#demo-form');
const result = document.querySelector('.demo-result');
let focusReturn = null;
function closeMenu() { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation'); }
toggle.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
function showDialog(dialog, trigger) {
  document.querySelectorAll('dialog[open]').forEach(el => el.close());
  closeMenu(); focusReturn = trigger; document.body.classList.add('modal-open');
  if (dialog === appointment) { form.hidden = false; result.hidden = true; form.reset(); }
  dialog.showModal();
}
document.querySelectorAll('[data-appointment]').forEach(button => button.addEventListener('click', () => showDialog(appointment, button)));
document.querySelectorAll('[data-visit]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); showDialog(visit, link); }));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) { document.body.classList.remove('modal-open'); if (focusReturn && focusReturn.offsetParent !== null) focusReturn.focus(); else toggle.focus(); } });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
form.addEventListener('submit', event => { event.preventDefault(); form.hidden = true; result.hidden = false; form.reset(); result.focus(); });
document.querySelector('.dialog-done').addEventListener('click', () => appointment.close());

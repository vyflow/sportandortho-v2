const teamCards = [...document.querySelectorAll('.team-card')];
const search = document.querySelector('#team-search');
const clinic = document.querySelector('#team-clinic');
const role = document.querySelector('#team-role');
const count = document.querySelector('#team-result-count');
const more = document.querySelector('#team-load-more');
const reset = document.querySelector('#reset-team');
let visibleLimit = 12;
document.querySelector('.team-filters').hidden = false;
function updateTeam(focusNew = false) {
  const query = search.value.trim().toLocaleLowerCase();
  const matches = teamCards.filter(card =>
    (!query || card.dataset.name.includes(query)) &&
    (!clinic.value || card.dataset.locations.split('|').includes(clinic.value)) &&
    (!role.value || card.dataset.roles.split(' ').includes(role.value))
  );
  const previouslyVisible = teamCards.filter(card => !card.hidden);
  teamCards.forEach(card => card.hidden = !matches.slice(0, visibleLimit).includes(card));
  const shown = Math.min(visibleLimit, matches.length);
  count.textContent = `Showing ${shown} of ${matches.length} team member${matches.length === 1 ? '' : 's'}`;
  document.querySelector('#team-empty').hidden = matches.length !== 0;
  more.hidden = matches.length <= visibleLimit;
  reset.hidden = !query && !clinic.value && !role.value;
  if (focusNew) {
    const firstNew = matches.slice(0,visibleLimit).find(card => !previouslyVisible.includes(card));
    if (firstNew) { firstNew.tabIndex = -1; firstNew.focus({preventScroll:true}); firstNew.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'}); }
  }
}
function clearFilters() { search.value = ''; clinic.value = ''; role.value = ''; visibleLimit = 12; updateTeam(); search.focus(); }
search.addEventListener('input', () => { visibleLimit = 12; updateTeam(); });
[clinic, role].forEach(select => select.addEventListener('change', () => { visibleLimit = 12; updateTeam(); }));
more.addEventListener('click', () => { visibleLimit += 12; updateTeam(true); });
reset.addEventListener('click', clearFilters);
document.querySelector('#empty-reset').addEventListener('click', clearFilters);
updateTeam();

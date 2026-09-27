(() => {
  const video = document.querySelector('#hero-film');
  if (!video) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let requested = !reduced.matches && !navigator.connection?.saveData;
  let visible = true;
  video.muted = true;
  const update = () => {
    if (requested && visible && !document.hidden) {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.play().catch(() => { requested = false; });
    } else video.pause();
  };
  video.addEventListener('playing', () => { video.classList.add('is-ready'); });
  video.addEventListener('error', () => {
    requested = false;
    video.classList.remove('is-ready');
  });
  reduced.addEventListener('change', () => {
    requested = !reduced.matches && !navigator.connection?.saveData;
    if (reduced.matches) video.classList.remove('is-ready');
    update();
  });
  document.addEventListener('visibilitychange', update);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }, {threshold: 0.05}).observe(video.closest('.hero'));
  update();
})();

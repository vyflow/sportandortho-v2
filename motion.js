// Reveal once, from a prepared offscreen state. Native scrolling stays native.
// Base HTML/CSS is fully visible if JavaScript or motion support is unavailable.
(() => {
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const scenes = new Set();
  const running = new Map();
  const add = (selector, direction = 'up') => {
    document.querySelectorAll(selector).forEach(el => {
      el.dataset.motion = direction;
      scenes.add(el);
    });
  };
  // Related content moves together; controls and directory rows stay still.
  add('.section-heading, .pathway-copy, .closing-copy, .team-closing .wrap');
  add('.pathway-sport .photo-link, .personal-photo, .founder-photo', 'left');
  add('.pathway-surgery .photo-link, .pathway-everyday .photo-link', 'right');
  add('.personal-copy, .founder-copy');

  // Preserve each authored line break and keep the heading's accessible text.
  scenes.forEach(el => {
    el.querySelectorAll('h2').forEach(heading => {
      const lines = [[]];
      [...heading.childNodes].forEach(node => {
        if (node.nodeName === 'BR') lines.push([]);
        else lines.at(-1).push(node);
      });
      heading.replaceChildren(...lines.map(nodes => {
        const mask = document.createElement('span');
        const line = document.createElement('span');
        mask.className = 'headline-mask';
        line.className = 'headline-line';
        line.append(...nodes);
        mask.append(line);
        return mask;
      }));
    });
  });

  const settle = el => {
    // Set the underlying final style before cancelling a running animation.
    el.dataset.motionState = 'done';
    const animations = running.get(el);
    if (animations) { running.delete(el); animations.forEach(a => a.cancel()); }
    observer.unobserve(el);
  };
  const reveal = el => {
    if (el.dataset.motionState !== 'pending') return;
    const bounds = el.getBoundingClientRect();
    // Jumped-to or keyboard-focused content is immediately ready to read.
    if (reduced.matches || bounds.top < innerHeight * .2 || el.contains(document.activeElement)) {
      settle(el); return;
    }
    const from = getComputedStyle(el).transform;
    el.dataset.motionState = 'running';
    const lines = [...el.querySelectorAll('.headline-line')];
    const duration = 1150;
    const options = {duration, easing:'cubic-bezier(.25,.05,.2,1)', fill:'both'};
    const animations = [el.animate([
      {opacity:0, transform:from},
      {opacity:1, transform:'translate3d(0,0,0)'}
    ], options)];
    lines.forEach((line,index) => animations.push(line.animate([
      {transform:'translate3d(0,110%,0)'},
      {transform:'translate3d(0,0,0)'}
    ], {...options,duration:1050,delay:index*80})));
    const rule = el.querySelector('.red-rule');
    if (rule) animations.push(rule.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}], {...options,duration:850,delay:180}));
    running.set(el, animations);
    observer.unobserve(el);
    Promise.all(animations.map(a => a.finished)).then(() => {
      if (running.get(el) === animations) settle(el);
    }).catch(() => {});
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, {threshold:0, rootMargin:'0px 0px 90px 0px'});

  const prepare = () => {
    observer.disconnect();
    scenes.forEach(el => {
      if (reduced.matches || el.dataset.motionState === 'done') { settle(el); return; }
      const bounds = el.getBoundingClientRect();
      // Never reset visible content, including restored scroll positions.
      if (bounds.top < innerHeight + 40) { settle(el); return; }
      const direction = el.dataset.motion;
      const hasHeadline = !!el.querySelector('.headline-line');
      const distance = mobile.matches ? 20 : 48;
      const x = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
      const y = hasHeadline ? 0 : direction === 'up' ? (mobile.matches ? 22 : 32) : 10;
      el.style.setProperty('--reveal-x', `${x}px`);
      el.style.setProperty('--reveal-y', `${y}px`);
      el.dataset.motionState = 'pending';
      observer.observe(el);
    });
  };
  document.addEventListener('focusin', event => {
    scenes.forEach(el => { if (el.contains(event.target)) settle(el); });
  });
  const settleAnchor = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = id && document.getElementById(id);
    if (target) scenes.forEach(el => { if (target.contains(el) || el.contains(target)) settle(el); });
  };
  window.addEventListener('hashchange', settleAnchor);
  window.addEventListener('pageshow', event => { if (event.persisted) scenes.forEach(settle); });
  reduced.addEventListener('change', () => { if (reduced.matches) scenes.forEach(settle); });
  prepare();
  settleAnchor();

})();

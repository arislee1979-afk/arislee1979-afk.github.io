(() => {
  const toc = document.querySelector('[data-reading-toc]');
  if (!toc) return;
  const details = toc.querySelector('details');
  const links = [...toc.querySelectorAll('[data-reading-link]')];
  const sections = links.map(link => ({
    link,
    target: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  })).filter(section => section.target);
  const compact = window.matchMedia('(max-width: 1080px)');
  const position = toc.querySelector('[data-reading-position]');
  let requested = sections.find(section => section.link.hash === window.location.hash);
  const setActive = current => {
    sections.forEach(section => {
      if (section === current) section.link.setAttribute('aria-current', 'location');
      else section.link.removeAttribute('aria-current');
    });
    if (position && current) position.textContent = current.link.textContent.trim();
  };
  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (!sections.length) return;
    const line = compact.matches ? toc.getBoundingClientRect().bottom + 40 : 72;
    let current = sections[0];
    for (const section of sections) {
      if (section.target.getBoundingClientRect().top <= line) current = section;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = sections.at(-1);
      if (requested) {
        const top = requested.target.getBoundingClientRect().top;
        if (top >= 0 && top < window.innerHeight) current = requested;
      }
    }
    setActive(current);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  };
  const adapt = () => {
    details.open = !compact.matches;
    schedule();
  };
  links.forEach(link => link.addEventListener('click', () => {
    if (compact.matches) details.open = false;
    requested = sections.find(section => section.link === link);
    setActive(requested);
  }));
  compact.addEventListener('change', adapt);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('hashchange', () => {
    requested = sections.find(section => section.link.hash === window.location.hash);
    schedule();
  });
  const manualNavigation = () => { requested = null; schedule(); };
  window.addEventListener('wheel', manualNavigation, { passive: true });
  window.addEventListener('touchstart', manualNavigation, { passive: true });
  window.addEventListener('keydown', event => {
    if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(event.key)) manualNavigation();
  });
  details.addEventListener('toggle', schedule);
  document.fonts?.ready.then(schedule);
  document.querySelectorAll('[data-reading-count="diagrams"]').forEach(counter => {
    counter.textContent = String(document.querySelectorAll('[data-diagram-card]').length);
  });
  adapt();
})();

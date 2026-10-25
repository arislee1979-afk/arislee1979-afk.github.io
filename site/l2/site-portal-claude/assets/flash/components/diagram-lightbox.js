(() => {
  const cards = [...document.querySelectorAll('[data-diagram-card]')];
  if (!cards.length || document.querySelector('[data-diagram-lightbox]')) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'diagram-lightbox';
  lightbox.dataset.diagramLightbox = '';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.innerHTML = `
    <div class="diagram-lightbox__panel">
      <div class="diagram-lightbox__header">
        <div class="diagram-lightbox__title" data-diagram-lightbox-title></div>
        <button class="btn btn-glass" type="button" data-diagram-close aria-label="關閉全螢幕圖示">關閉</button>
      </div>
      <div class="diagram-lightbox__stage" data-diagram-lightbox-stage></div>
    </div>`;
  document.body.append(lightbox);

  const title = lightbox.querySelector('[data-diagram-lightbox-title]');
  const stage = lightbox.querySelector('[data-diagram-lightbox-stage]');
  const closeButton = lightbox.querySelector('[data-diagram-close]');
  let titleId = 'flash-ui-diagram-title';
  while (document.getElementById(titleId)) titleId += '-viewer';
  title.id = titleId;
  lightbox.setAttribute('aria-labelledby', titleId);
  stage.tabIndex = 0;
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-label', '可左右捲動的完整圖示');
  let returnFocus = null;
  let copyNumber = 0;
  let background = [];

  const copySvg = svg => {
    const copy = svg.cloneNode(true);
    const ids = new Map();
    const elements = [copy, ...copy.querySelectorAll('*')];
    const prefix = `diagram-copy-${++copyNumber}-`;
    elements.filter(element => element.id).forEach(element => {
      const oldId = element.id;
      element.id = prefix + oldId;
      ids.set(oldId, element.id);
    });
    elements.forEach(element => {
      [...element.attributes].forEach(attribute => {
        let value = attribute.value.replace(/url\(#([^)]+)\)/g, (match, id) => ids.has(id) ? `url(#${ids.get(id)})` : match);
        if (attribute.name === 'href' || attribute.name === 'xlink:href') {
          if (ids.has(value.slice(1)) && value.startsWith('#')) value = '#' + ids.get(value.slice(1));
        }
        if (attribute.name === 'aria-labelledby' || attribute.name === 'aria-describedby') {
          value = value.split(/\s+/).map(id => ids.get(id) || id).join(' ');
        }
        element.setAttribute(attribute.name, value);
      });
    });
    return copy;
  };

  const open = (card, trigger) => {
    const svg = card.querySelector('.svg-shell svg');
    if (!svg) return;
    returnFocus = trigger;
    title.textContent = card.dataset.diagramTitle || card.querySelector('h2, h3')?.textContent || '圖示';
    stage.replaceChildren(copySvg(svg));
    stage.scrollLeft = 0;
    background = [...document.body.children].filter(element => element !== lightbox).map(element => ({ element, inert: element.inert }));
    background.forEach(({ element }) => { element.inert = true; });
    lightbox.hidden = false;
    document.body.classList.add('diagram-modal-open');
    closeButton.focus();
  };

  const close = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    stage.replaceChildren();
    document.body.classList.remove('diagram-modal-open');
    background.forEach(({ element, inert }) => { element.inert = inert; });
    background = [];
    returnFocus?.focus();
  };

  cards.forEach((card) => {
    const shell = card.querySelector('.svg-shell');
    if (!shell) return;
    shell.tabIndex = 0;
    shell.setAttribute('role', 'button');
    shell.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open(card, shell);
    });
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-diagram-open], [data-diagram-card] .svg-shell');
    if (trigger) {
      const card = trigger.closest('[data-diagram-card]');
      if (card) open(card, trigger);
      return;
    }
    if (event.target === lightbox || event.target.closest('[data-diagram-close]')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && !lightbox.hidden) {
      const controls = [...lightbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter(element => !element.disabled && element.getClientRects().length);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === 'Escape' && !lightbox.hidden) close();
  });
})();

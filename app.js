const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const canvas = $('#galaxyCanvas');
const stage = $('#mapStage');
const ctx = canvas.getContext('2d', { alpha: false });
const image = new Image();
image.src = './assets/galaxy-map.jpg';

const regionColors = {
  'Deep Core': '#e7df82',
  'Core Worlds': '#c9c45f',
  'Colonies': '#8e88d8',
  'Inner Rim': '#db944f',
  'Expansion Region': '#77bb61',
  'Mid Rim': '#d853b4',
  'Hutt Space': '#ef4b4d',
  'Outer Rim': '#2dc8ec',
  'Unknown Regions': '#657a9d',
  'Wild Space': '#536478',
  'Uncharted Region': '#98a5b5'
};

const importantRoutes = {
  'Perlemian Trade Route': '#f6c75b',
  'Corellian Run': '#ef7187',
  'Corellian Trade Spine': '#71d9ff',
  'Rimma Trade Route': '#a58cff',
  'Hydian Way': '#70e0a1'
};

const state = {
  data: null,
  locations: [],
  byId: new Map(),
  adjacency: [],
  view: { scale: 1, x: 0, y: 0 },
  fitScale: 1,
  dragging: false,
  moved: false,
  pointer: null,
  hovered: null,
  selected: null,
  highlightedPath: null,
  coordinateTarget: null,
  activeType: 'all',
  activeRegion: 'all',
  crossingsOnly: false,
  showRoutes: true,
  imageReady: false,
  hasFitted: false,
  pulseUntil: 0,
  lastFrame: 0
};

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function typeLabel(type) {
  return type === 'station' ? 'Estación espacial' : type === 'misc' ? 'Miscelánea' : 'Planeta / sistema';
}

function routeColor(name) {
  if (importantRoutes[name]) return importantRoutes[name];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return `hsl(${Math.abs(hash) % 360} 58% 62%)`;
}

function isVisible(location) {
  if (state.activeType !== 'all' && location.category !== state.activeType) return false;
  if (state.activeRegion !== 'all' && location.region !== state.activeRegion) return false;
  if (state.crossingsOnly && location.routes.length < 2) return false;
  return true;
}

function mapToScreen(px, py) {
  return { x: px * state.view.scale + state.view.x, y: py * state.view.scale + state.view.y };
}

function screenToMap(x, y) {
  return { x: (x - state.view.x) / state.view.scale, y: (y - state.view.y) / state.view.scale };
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  canvas.dataset.dpr = dpr;
  if (!state.hasFitted) {
    state.hasFitted = true;
    fitMap();
  }
  requestDraw();
}

function fitMap() {
  const rect = stage.getBoundingClientRect();
  const padding = rect.width < 700 ? 8 : 20;
  state.fitScale = Math.min((rect.width - padding * 2) / 2048, (rect.height - padding * 2) / 2048);
  state.view.scale = state.fitScale;
  state.view.x = (rect.width - 2048 * state.view.scale) / 2;
  state.view.y = (rect.height - 2048 * state.view.scale) / 2;
  state.coordinateTarget = null;
  requestDraw();
}

function zoomAt(screenX, screenY, factor) {
  const old = state.view.scale;
  const next = Math.max(state.fitScale * 0.75, Math.min(5, old * factor));
  const point = screenToMap(screenX, screenY);
  state.view.scale = next;
  state.view.x = screenX - point.x * next;
  state.view.y = screenY - point.y * next;
  requestDraw();
}

function focusPoint(px, py, targetScale = 1.45) {
  const rect = stage.getBoundingClientRect();
  const panelOffset = rect.width > 700 ? 0 : 0;
  state.view.scale = Math.max(state.fitScale * 1.8, Math.min(targetScale, 3));
  state.view.x = rect.width / 2 + panelOffset - px * state.view.scale;
  state.view.y = rect.height / 2 - py * state.view.scale;
  requestDraw();
}

function fitPath(nodeIds) {
  if (!nodeIds.length) return;
  const rect = stage.getBoundingClientRect();
  const points = nodeIds.map((id) => state.byId.get(id));
  const minX = Math.min(...points.map((p) => p.px));
  const maxX = Math.max(...points.map((p) => p.px));
  const minY = Math.min(...points.map((p) => p.py));
  const maxY = Math.max(...points.map((p) => p.py));
  const width = Math.max(100, maxX - minX);
  const height = Math.max(100, maxY - minY);
  state.view.scale = Math.max(state.fitScale, Math.min(2.5, Math.min((rect.width - 150) / width, (rect.height - 150) / height)));
  state.view.x = rect.width / 2 - ((minX + maxX) / 2) * state.view.scale;
  state.view.y = rect.height / 2 - ((minY + maxY) / 2) * state.view.scale;
  requestDraw();
}

function requestDraw() {
  if (state.lastFrame) return;
  state.lastFrame = requestAnimationFrame(draw);
}

function drawShape(context, location, radius, fill, stroke = null) {
  context.beginPath();
  if (location.category === 'station') {
    context.rect(location.px - radius, location.py - radius, radius * 2, radius * 2);
  } else if (location.category === 'misc') {
    context.moveTo(location.px, location.py - radius * 1.25);
    context.lineTo(location.px + radius * 1.25, location.py);
    context.lineTo(location.px, location.py + radius * 1.25);
    context.lineTo(location.px - radius * 1.25, location.py);
    context.closePath();
  } else {
    context.arc(location.px, location.py, radius, 0, Math.PI * 2);
  }
  context.fillStyle = fill;
  context.fill();
  if (stroke) {
    context.strokeStyle = stroke;
    context.stroke();
  }
}

function draw() {
  state.lastFrame = 0;
  const dpr = Number(canvas.dataset.dpr || 1);
  const rect = stage.getBoundingClientRect();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#050b13';
  ctx.fillRect(0, 0, rect.width, rect.height);
  if (!state.imageReady || !state.data) return;

  ctx.save();
  ctx.translate(state.view.x, state.view.y);
  ctx.scale(state.view.scale, state.view.scale);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, 0, 0, 2048, 2048);

  if (state.showRoutes) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const edge of state.data.edges) {
      if (edge.kind !== 'route') continue;
      const a = state.byId.get(edge.a);
      const b = state.byId.get(edge.b);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.lineWidth = (importantRoutes[edge.route] ? 1.45 : .72) / state.view.scale;
      ctx.strokeStyle = routeColor(edge.route);
      ctx.globalAlpha = importantRoutes[edge.route] ? .65 : .24;
      ctx.stroke();
    }
    ctx.restore();
  }

  if (state.highlightedPath) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const edge of state.highlightedPath.edges) {
      const a = state.byId.get(edge.a);
      const b = state.byId.get(edge.b);
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.lineWidth = (edge.kind === 'route' ? 4.5 : 3) / state.view.scale;
      ctx.strokeStyle = edge.kind === 'route' ? '#58f0ff' : '#ffb865';
      ctx.setLineDash(edge.kind === 'route' ? [] : [7 / state.view.scale, 5 / state.view.scale]);
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8 / state.view.scale;
      ctx.globalAlpha = .95;
      ctx.stroke();
    }
    ctx.restore();
  }

  const labelThreshold = state.view.scale > .72 ? (state.view.scale > 1.35 ? 2 : 0) : -1;
  const selectedId = state.selected?.id;
  for (const location of state.locations) {
    if (!isVisible(location) && location.id !== selectedId) continue;
    const base = location.rank === 0 ? 5 : location.rank === 1 ? 3.8 : location.rank === 2 ? 2.8 : 2.2;
    const radius = Math.max(base / state.view.scale, .9 / state.view.scale);
    ctx.lineWidth = .8 / state.view.scale;
    const color = regionColors[location.region] || '#b7c4d2';
    drawShape(ctx, location, radius, color, 'rgba(2,7,13,.85)');
    if (location.routes.length > 1) {
      ctx.beginPath();
      ctx.arc(location.px, location.py, radius + 2.2 / state.view.scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffbd66';
      ctx.lineWidth = 1.1 / state.view.scale;
      ctx.globalAlpha = .85;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (labelThreshold >= location.rank || location.id === selectedId) {
      ctx.font = `${Math.max(8.5 / state.view.scale, 4)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillStyle = location.id === selectedId ? '#ffffff' : 'rgba(223,238,249,.9)';
      ctx.shadowColor = '#02070d';
      ctx.shadowBlur = 3 / state.view.scale;
      ctx.fillText(location.name, location.px + 5 / state.view.scale, location.py - 4 / state.view.scale);
      ctx.shadowBlur = 0;
    }
  }

  if (state.hovered && state.hovered.id !== selectedId && isVisible(state.hovered)) {
    ctx.beginPath();
    ctx.arc(state.hovered.px, state.hovered.py, 9 / state.view.scale, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 / state.view.scale;
    ctx.shadowColor = '#4bdcf5';
    ctx.shadowBlur = 10 / state.view.scale;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  if (state.selected) {
    const p = state.selected;
    const animating = performance.now() < state.pulseUntil;
    const pulse = animating ? 9 + Math.sin(performance.now() / 260) * 1.6 : 9;
    ctx.beginPath();
    ctx.arc(p.px, p.py, pulse / state.view.scale, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.7 / state.view.scale;
    ctx.shadowColor = '#4bdcf5';
    ctx.shadowBlur = 12 / state.view.scale;
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (animating) requestDraw();
  }

  if (state.coordinateTarget) {
    const { x, y } = state.coordinateTarget;
    ctx.strokeStyle = '#ffbc64';
    ctx.lineWidth = 1.5 / state.view.scale;
    ctx.beginPath();
    ctx.moveTo(x - 12 / state.view.scale, y);
    ctx.lineTo(x + 12 / state.view.scale, y);
    ctx.moveTo(x, y - 12 / state.view.scale);
    ctx.lineTo(x, y + 12 / state.view.scale);
    ctx.stroke();
  }
  ctx.restore();
}

function findMatches(query, limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  return state.locations
    .map((location) => {
      const name = normalize(location.name);
      const aliases = location.aliases.map(normalize);
      let score = name === q ? 0 : name.startsWith(q) ? 1 : aliases.some((a) => a.startsWith(q)) ? 2 : name.includes(q) ? 3 : aliases.some((a) => a.includes(q)) ? 4 : 99;
      return { location, score };
    })
    .filter((item) => item.score < 99)
    .sort((a, b) => a.score - b.score || a.location.name.localeCompare(b.location.name))
    .slice(0, limit)
    .map((item) => item.location);
}

function resolveInput(input) {
  const id = Number(input.dataset.locationId);
  if (Number.isInteger(id) && state.byId.has(id) && state.byId.get(id).name === input.value) return state.byId.get(id);
  const q = normalize(input.value);
  return state.locations.find((p) => normalize(p.name) === q || p.aliases.some((a) => normalize(a) === q)) || null;
}

function attachAutocomplete(input, container, onSelect) {
  let active = -1;
  const render = () => {
    const matches = findMatches(input.value);
    active = -1;
    if (!input.value.trim()) {
      container.classList.remove('open');
      return;
    }
    container.innerHTML = matches.length ? matches.map((p, i) => `
      <button class="suggestion" type="button" role="option" data-id="${p.id}" data-index="${i}">
        <span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.region)} · ${escapeHtml(p.grid)}</small></span>
        <span class="suggestion-tag">${p.routes.length > 1 ? `${p.routes.length} rutas` : typeLabel(p.category)}</span>
      </button>`).join('') : '<div class="no-results">No hay coincidencias en el catálogo.</div>';
    container.classList.add('open');
    [...container.querySelectorAll('.suggestion')].forEach((button) => button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const location = state.byId.get(Number(button.dataset.id));
      input.value = location.name;
      input.dataset.locationId = location.id;
      container.classList.remove('open');
      onSelect(location);
    }));
  };
  input.addEventListener('input', () => {
    delete input.dataset.locationId;
    render();
  });
  input.addEventListener('focus', render);
  input.addEventListener('blur', () => setTimeout(() => container.classList.remove('open'), 120));
  input.addEventListener('keydown', (event) => {
    const options = [...container.querySelectorAll('.suggestion')];
    if (event.key === 'ArrowDown' && options.length) active = Math.min(active + 1, options.length - 1);
    else if (event.key === 'ArrowUp' && options.length) active = Math.max(active - 1, 0);
    else if (event.key === 'Enter') {
      const chosen = options[active] || options[0];
      if (chosen) chosen.dispatchEvent(new PointerEvent('pointerdown'));
      else {
        const exact = resolveInput(input);
        if (exact) onSelect(exact);
      }
      event.preventDefault();
      return;
    } else if (event.key === 'Escape') {
      container.classList.remove('open');
      return;
    } else return;
    options.forEach((option, index) => option.classList.toggle('active', index === active));
    event.preventDefault();
  });
}

function selectLocation(location, focus = true) {
  state.selected = location;
  state.pulseUntil = performance.now() + 1800;
  state.coordinateTarget = null;
  showDetail(location);
  if (focus) focusPoint(location.px, location.py);
  if (window.innerWidth <= 880) $('#sidebar').classList.add('open');
  requestAnimationFrame(() => $('#detailCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  requestDraw();
}

function showDetail(location) {
  const card = $('#detailCard');
  card.classList.remove('empty');
  const color = regionColors[location.region] || '#b7c4d2';
  const routes = location.routes.length
    ? location.routes.map((route) => `<span class="route-chip">${escapeHtml(route)}</span>`).join('')
    : '<span class="route-chip muted">Sin hiperruta nominal registrada</span>';
  card.innerHTML = `
    <div class="detail-top">
      <div>
        <div class="detail-kicker"><i class="shape shape-${location.category === 'station' ? 'square' : location.category === 'misc' ? 'diamond' : 'circle'}" style="color:${color}"></i>${escapeHtml(typeLabel(location.category))}</div>
        <h2>${escapeHtml(location.name)}</h2>
      </div>
      <span class="canon-badge">${location.canon ? 'Canon' : 'Legends / no canon'}</span>
    </div>
    <div class="detail-grid">
      <div class="datum"><span>Región</span><strong>${escapeHtml(location.region)}</strong></div>
      <div class="datum"><span>Sector</span><strong>${escapeHtml(location.sector)}</strong></div>
      <div class="datum"><span>Cuadrícula</span><strong>${escapeHtml(location.grid)}</strong></div>
      <div class="datum"><span>Coordenadas px</span><strong>${Math.round(location.px)}, ${Math.round(location.py)}</strong></div>
      <div class="datum"><span>Coordenadas mapa</span><strong>${location.x}, ${location.y}</strong></div>
      <div class="datum"><span>Topología</span><strong>${location.routes.length > 1 ? `Cruce de ${location.routes.length} rutas` : location.routes.length === 1 ? 'Sobre una ruta' : 'Enlace local'}</strong></div>
    </div>
    <div class="route-list-label">Hiperrutas</div>
    <div class="route-chips">${routes}</div>
    <button class="wiki-link" type="button" data-wiki-id="${location.id}"><span>Consultar Wookieepedia</span><span>▣</span></button>`;
  card.querySelector('.wiki-link').addEventListener('click', () => openWikiModal(location));
}

function wikiArticleTitle(location) {
  try {
    const url = new URL(location.wiki);
    const marker = '/wiki/';
    const index = url.pathname.indexOf(marker);
    if (index === -1 || url.pathname.includes('Special:Search')) return location.name;
    return decodeURIComponent(url.pathname.slice(index + marker.length)).replaceAll('_', ' ');
  } catch {
    return location.name;
  }
}

async function openWikiModal(location) {
  const dialog = $('#wikiDialog');
  dialog.showModal();
  await loadWikiLanguage(location, 'es');
}

function wikiEndpoint(language) {
  return language === 'es' ? 'https://starwars.fandom.com/es/api.php' : 'https://starwars.fandom.com/api.php';
}

async function fetchWikiPage(location, language) {
  const endpoint = wikiEndpoint(language);
  const title = wikiArticleTitle(location);
  const makeParams = (requestedTitle) => new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    redirects: '1',
    prop: 'extracts|pageimages|description|info',
    inprop: 'url',
    exintro: '1',
    explaintext: '1',
    piprop: 'thumbnail',
    pithumbsize: '760',
    titles: requestedTitle
  });

  let response = await fetch(`${endpoint}?${makeParams(title)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  let payload = await response.json();
  let page = Object.values(payload?.query?.pages || {})[0];

  if ((!page || page.missing !== undefined) && language === 'es') {
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      generator: 'search',
      gsrsearch: `intitle:${location.name}`,
      gsrnamespace: '0',
      gsrlimit: '1',
      prop: 'extracts|pageimages|description|info',
      inprop: 'url',
      exintro: '1',
      explaintext: '1',
      piprop: 'thumbnail',
      pithumbsize: '760'
    });
    response = await fetch(`${endpoint}?${searchParams}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    payload = await response.json();
    page = Object.values(payload?.query?.pages || {})[0];
  }

  if (!page || page.missing !== undefined) throw new Error('Artículo no encontrado');
  let extract = page.extract?.trim() || '';
  if (extract.length < 120) extract = await fetchWikiParsedIntro(page.title || title, endpoint);
  if (!extract) throw new Error('Artículo sin texto recuperable');
  return { page, extract, endpoint };
}

async function loadWikiLanguage(location, language, fallbackNotice = '') {
  const dialog = $('#wikiDialog');
  const content = $('#wikiModalContent');
  const languageName = language === 'es' ? 'español' : 'English';
  content.innerHTML = `
    <div class="wiki-modal-top">
      <span class="eyebrow">WOOKIEEPEDIA</span>
      ${wikiLanguageSwitch(language)}
    </div>
    <div class="wiki-loading"><span></span><p>Consultando ${escapeHtml(location.name)} en ${languageName}…</p></div>`;
  try {
    const { page, extract } = await fetchWikiPage(location, language);
    content.innerHTML = `
      <div class="wiki-modal-top">
        <span class="eyebrow">WOOKIEEPEDIA · ${language === 'es' ? 'EN ESPAÑOL' : 'ORIGINAL EN INGLÉS'}</span>
        ${wikiLanguageSwitch(language)}
      </div>
      ${fallbackNotice ? `<div class="wiki-language-notice">${escapeHtml(fallbackNotice)}</div>` : ''}
      <div class="wiki-layout">
        ${page.thumbnail?.source ? `<img class="wiki-hero" src="${escapeHtml(page.thumbnail.source)}" alt="">` : ''}
        <div class="wiki-main">
          <div class="wiki-article-head">
            <div><h2>${escapeHtml(page.title || location.name)}</h2>${page.description ? `<p class="wiki-description">${escapeHtml(page.description)}</p>` : ''}</div>
            <span class="canon-badge">${location.canon ? 'Canon' : 'Legends / no canon'}</span>
          </div>
          <div class="wiki-extract">${extract.split(/\n{2,}/).slice(0, 6).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
        </div>
      </div>
      <div class="wiki-source-note">Texto procedente de la edición ${language === 'es' ? 'española' : 'inglesa'} de Wookieepedia. El artículo puede contener más información que esta vista previa.</div>
      <div class="dialog-actions">
        <button type="button" data-close-wiki>Cerrar</button>
      </div>`;
    bindWikiModalControls(location, language);
    content.querySelector('[data-close-wiki]').addEventListener('click', () => dialog.close());
  } catch (error) {
    if (language === 'es') {
      console.info('No se encontró contenido en español; se usará la edición inglesa.', error);
      await loadWikiLanguage(location, 'en', 'No se encontró una ficha equivalente en español; se muestra el artículo original en inglés.');
      return;
    }
    console.warn('No se pudo cargar la vista previa de Wookieepedia:', error);
    content.innerHTML = `
      <div class="wiki-modal-top"><span class="eyebrow">WOOKIEEPEDIA</span>${wikiLanguageSwitch(language)}</div>
      <div class="wiki-error-icon">!</div>
      <h2>No se pudo cargar la vista previa</h2>
      <p class="wiki-error-copy">Wookieepedia no ha permitido recuperar ahora el resumen de <strong>${escapeHtml(location.name)}</strong>. Puedes intentarlo de nuevo más tarde o cambiar de idioma.</p>
      <div class="dialog-actions">
        <button type="button" data-close-wiki>Cerrar</button>
      </div>`;
    bindWikiModalControls(location, language);
    content.querySelector('[data-close-wiki]').addEventListener('click', () => dialog.close());
  }
}

function wikiLanguageSwitch(activeLanguage) {
  return `<div class="wiki-language-switch" aria-label="Idioma de Wookieepedia">
    <button type="button" data-wiki-language="es" class="${activeLanguage === 'es' ? 'active' : ''}">Español</button>
    <button type="button" data-wiki-language="en" class="${activeLanguage === 'en' ? 'active' : ''}">English</button>
  </div>`;
}

function bindWikiModalControls(location, activeLanguage) {
  $('#wikiModalContent').querySelectorAll('[data-wiki-language]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.wikiLanguage !== activeLanguage) loadWikiLanguage(location, button.dataset.wikiLanguage);
    });
  });
}

async function fetchWikiParsedIntro(title, endpoint) {
  const params = new URLSearchParams({
    action: 'parse',
    format: 'json',
    origin: '*',
    redirects: '1',
    disabletoc: '1',
    disableeditsection: '1',
    prop: 'text',
    page: title
  });
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) return '';
  const payload = await response.json();
  const html = payload?.parse?.text?.['*'];
  if (!html) return '';
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  documentFragment.querySelectorAll('table, aside, figure, style, script, sup, .portable-infobox, .navbox, .toc, .gallery, .reference, .mw-editsection, .mw-empty-elt').forEach((node) => node.remove());
  const paragraphs = [...documentFragment.querySelectorAll('.mw-parser-output > p, p')]
    .map((node) => node.textContent.replace(/\s+/g, ' ').trim())
    .filter((text, index, list) => text.length >= 70 && list.indexOf(text) === index)
    .slice(0, 5);
  return paragraphs.join('\n\n');
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

class MinHeap {
  constructor() { this.items = []; }
  push(item) {
    this.items.push(item);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.items[p].distance <= item.distance) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = item;
  }
  pop() {
    if (!this.items.length) return null;
    const first = this.items[0];
    const last = this.items.pop();
    if (this.items.length) {
      let i = 0;
      while (true) {
        const left = i * 2 + 1;
        const right = left + 1;
        if (left >= this.items.length) break;
        let child = right < this.items.length && this.items[right].distance < this.items[left].distance ? right : left;
        if (this.items[child].distance >= last.distance) break;
        this.items[i] = this.items[child];
        i = child;
      }
      this.items[i] = last;
    }
    return first;
  }
}

function shortestPath(start, end) {
  const n = state.locations.length;
  const dist = new Float64Array(n);
  dist.fill(Infinity);
  const previous = new Int32Array(n);
  previous.fill(-1);
  const previousEdge = new Int32Array(n);
  previousEdge.fill(-1);
  const heap = new MinHeap();
  dist[start.id] = 0;
  heap.push({ id: start.id, distance: 0 });
  while (heap.items.length) {
    const current = heap.pop();
    if (current.distance !== dist[current.id]) continue;
    if (current.id === end.id) break;
    for (const step of state.adjacency[current.id]) {
      const edge = state.data.edges[step.edgeIndex];
      const nextDistance = current.distance + edge.weight;
      if (nextDistance < dist[step.to]) {
        dist[step.to] = nextDistance;
        previous[step.to] = current.id;
        previousEdge[step.to] = step.edgeIndex;
        heap.push({ id: step.to, distance: nextDistance });
      }
    }
  }
  if (!Number.isFinite(dist[end.id])) return null;
  const nodes = [];
  const edgeIndexes = [];
  let cursor = end.id;
  while (cursor !== -1) {
    nodes.push(cursor);
    const edgeIndex = previousEdge[cursor];
    if (edgeIndex !== -1) edgeIndexes.push(edgeIndex);
    if (cursor === start.id) break;
    cursor = previous[cursor];
  }
  nodes.reverse();
  edgeIndexes.reverse();
  return { nodes, edges: edgeIndexes.map((index) => state.data.edges[index]), distance: dist[end.id] };
}

function renderRoute(path, start, end) {
  const result = $('#routeResult');
  if (!path) {
    result.classList.remove('hidden');
    result.innerHTML = '<p class="route-warning">No se ha encontrado conexión entre ambos puntos.</p>';
    return;
  }
  const groups = [];
  for (let i = 0; i < path.edges.length; i += 1) {
    const edge = path.edges[i];
    const last = groups.at(-1);
    if (!last || last.route !== edge.route) groups.push({ route: edge.route, kind: edge.kind, startIndex: i, endIndex: i + 1 });
    else last.endIndex = i + 1;
  }
  const hasTransfers = path.edges.some((edge) => edge.kind !== 'route');
  result.classList.remove('hidden');
  result.innerHTML = `
    <div class="route-summary"><strong>${escapeHtml(start.name)} → ${escapeHtml(end.name)}</strong><span>${path.edges.length} saltos</span></div>
    ${hasTransfers ? '<p class="route-warning">Incluye enlaces locales: no son hiperrutas nominales y se muestran en ámbar discontinuo.</p>' : ''}
    <div class="route-groups">${groups.map((group) => {
      const a = state.byId.get(path.nodes[group.startIndex]);
      const b = state.byId.get(path.nodes[group.endIndex]);
      return `<div class="route-group"><b>${escapeHtml(group.route)}</b><small>${escapeHtml(a.name)} → ${escapeHtml(b.name)} · ${group.endIndex - group.startIndex} ${group.endIndex - group.startIndex === 1 ? 'salto' : 'saltos'}</small></div>`;
    }).join('')}</div>`;
  state.highlightedPath = path;
  state.selected = end;
  state.pulseUntil = performance.now() + 1800;
  showDetail(end);
  fitPath(path.nodes);
}

function calculateRoute() {
  const start = resolveInput($('#routeFrom'));
  const end = resolveInput($('#routeTo'));
  if (!start || !end) {
    showToast('Selecciona un origen y un destino válidos.');
    return;
  }
  if (start.id === end.id) {
    showToast('El origen y el destino son el mismo punto.');
    selectLocation(start);
    return;
  }
  renderRoute(shortestPath(start, end), start, end);
}

function populateRegions() {
  const regions = [...new Set(state.locations.map((p) => p.region))].sort();
  $('#regionFilter').insertAdjacentHTML('beforeend', regions.map((region) => `<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`).join(''));
}

function updateFilterCount() {
  const count = state.locations.filter(isVisible).length;
  $('#filterCount').textContent = count === state.locations.length ? 'Todos' : count.toLocaleString('es-ES');
}

function hitTest(screenX, screenY) {
  const point = screenToMap(screenX, screenY);
  const threshold = 20 / state.view.scale;
  let best = null;
  let bestDistance = threshold;
  for (const location of state.locations) {
    if (!isVisible(location)) continue;
    const d = Math.hypot(location.px - point.x, location.py - point.y);
    if (d < bestDistance) {
      best = location;
      bestDistance = d;
    }
  }
  return best;
}

function bindUI() {
  attachAutocomplete($('#planetSearch'), $('#searchSuggestions'), (location) => selectLocation(location));
  attachAutocomplete($('#routeFrom'), $('#fromSuggestions'), () => {});
  attachAutocomplete($('#routeTo'), $('#toSuggestions'), () => {});

  $('#clearSearch').addEventListener('click', () => {
    $('#planetSearch').value = '';
    delete $('#planetSearch').dataset.locationId;
    $('#planetSearch').focus();
  });

  $$('.quick-card').forEach((button) => button.addEventListener('click', () => {
    const location = state.locations.find((p) => p.name === button.dataset.planet);
    if (location) {
      $('#planetSearch').value = location.name;
      $('#planetSearch').dataset.locationId = location.id;
      selectLocation(location);
    }
  }));

  $$('.mode-button').forEach((button) => button.addEventListener('click', () => {
    $$('.mode-button').forEach((item) => item.classList.toggle('active', item === button));
    const routeMode = button.dataset.mode === 'route';
    $('#explorePanel').classList.toggle('hidden', routeMode);
    $('#routePanel').classList.toggle('hidden', !routeMode);
  }));

  $$('#typeFilters .filter-chip').forEach((button) => button.addEventListener('click', () => {
    $$('#typeFilters .filter-chip').forEach((item) => item.classList.toggle('active', item === button));
    state.activeType = button.dataset.type;
    updateFilterCount();
    requestDraw();
  }));
  $('#regionFilter').addEventListener('change', (event) => {
    state.activeRegion = event.target.value;
    updateFilterCount();
    requestDraw();
  });
  $('#crossingsOnly').addEventListener('change', (event) => {
    state.crossingsOnly = event.target.checked;
    updateFilterCount();
    requestDraw();
  });
  $('#showRoutes').addEventListener('change', (event) => {
    state.showRoutes = event.target.checked;
    requestDraw();
  });

  $('#goCoords').addEventListener('click', () => {
    const x = Number($('#coordX').value);
    const y = Number($('#coordY').value);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > 2048 || y > 2048) {
      showToast('Introduce coordenadas entre 0 y 2048.');
      return;
    }
    state.selected = null;
    state.coordinateTarget = { x, y };
    focusPoint(x, y, 1.25);
  });

  $('#swapRoute').addEventListener('click', () => {
    const from = $('#routeFrom');
    const to = $('#routeTo');
    [from.value, to.value] = [to.value, from.value];
    const fromId = from.dataset.locationId;
    from.dataset.locationId = to.dataset.locationId || '';
    to.dataset.locationId = fromId || '';
  });
  $('#calculateRoute').addEventListener('click', calculateRoute);
  $('#routeFrom').addEventListener('keydown', (event) => { if (event.key === 'Enter') setTimeout(calculateRoute, 0); });
  $('#routeTo').addEventListener('keydown', (event) => { if (event.key === 'Enter') setTimeout(calculateRoute, 0); });

  $('#zoomIn').addEventListener('click', () => zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.35));
  $('#zoomOut').addEventListener('click', () => zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1 / 1.35));
  $('#fitMap').addEventListener('click', fitMap);
  $('#legendToggle').addEventListener('click', () => {
    const collapsed = $('#legend').classList.toggle('collapsed');
    $('#legendToggle').textContent = collapsed ? '+' : '−';
  });

  $('#aboutButton').addEventListener('click', () => $('#aboutDialog').showModal());
  $('#closeAbout').addEventListener('click', () => $('#aboutDialog').close());
  $('#aboutDialog').addEventListener('click', (event) => { if (event.target === $('#aboutDialog')) $('#aboutDialog').close(); });
  $('#closeWiki').addEventListener('click', () => $('#wikiDialog').close());
  $('#wikiDialog').addEventListener('click', (event) => { if (event.target === $('#wikiDialog')) $('#wikiDialog').close(); });

  $('#mobilePanelButton').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') $('#sidebar').classList.remove('open');
  });

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY < 0 ? 1.14 : 1 / 1.14);
  }, { passive: false });

  canvas.addEventListener('pointerdown', (event) => {
    state.dragging = true;
    state.moved = false;
    state.pointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('dragging');
    $('#mapHint').style.opacity = '0';
  });
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const map = screenToMap(event.clientX - rect.left, event.clientY - rect.top);
    $('#coordinateReadout').textContent = map.x >= 0 && map.y >= 0 && map.x <= 2048 && map.y <= 2048 ? `px ${Math.round(map.x)}, ${Math.round(map.y)}` : 'fuera del mapa';
    if (state.dragging) {
      state.hovered = null;
      $('#mapTooltip').classList.remove('show');
      const dx = event.clientX - state.pointer.x;
      const dy = event.clientY - state.pointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;
      state.view.x += dx;
      state.view.y += dy;
      state.pointer = { x: event.clientX, y: event.clientY };
      requestDraw();
    } else {
      const hovered = hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (hovered?.id !== state.hovered?.id) {
        state.hovered = hovered;
        requestDraw();
      }
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
      const tooltip = $('#mapTooltip');
      if (hovered) {
        tooltip.innerHTML = `<strong>${escapeHtml(hovered.name)}</strong><span>${escapeHtml(hovered.region)} · ${Math.round(hovered.px)}, ${Math.round(hovered.py)} px</span>`;
        tooltip.style.left = `${Math.max(8, Math.min(rect.width - 190, event.clientX - rect.left + 15))}px`;
        tooltip.style.top = `${Math.max(8, Math.min(rect.height - 58, event.clientY - rect.top + 15))}px`;
        tooltip.classList.add('show');
      } else {
        tooltip.classList.remove('show');
      }
    }
  });
  canvas.addEventListener('pointerleave', () => {
    state.hovered = null;
    $('#mapTooltip').classList.remove('show');
    requestDraw();
  });
  canvas.addEventListener('pointerup', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (!state.moved) {
      const location = hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (location) selectLocation(location, false);
    }
    state.dragging = false;
    canvas.classList.remove('dragging');
    canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointercancel', () => {
    state.dragging = false;
    canvas.classList.remove('dragging');
  });

  window.addEventListener('resize', () => {
    const wasFit = Math.abs(state.view.scale - state.fitScale) < .01;
    resizeCanvas();
    if (wasFit) fitMap();
  });
}

async function boot() {
  try {
    const [response] = await Promise.all([
      fetch('./data/map-data.json'),
      image.decode()
    ]);
    if (!response.ok) throw new Error(`Error de catálogo: ${response.status}`);
    state.data = await response.json();
    state.locations = state.data.locations;
    state.byId = new Map(state.locations.map((location) => [location.id, location]));
    state.adjacency = Array.from({ length: state.locations.length }, () => []);
    state.data.edges.forEach((edge, edgeIndex) => {
      state.adjacency[edge.a].push({ to: edge.b, edgeIndex });
      state.adjacency[edge.b].push({ to: edge.a, edgeIndex });
    });
    state.imageReady = true;
    populateRegions();
    bindUI();
    resizeCanvas();
    updateFilterCount();
    const status = $('#catalogStatus');
    status.classList.add('ready');
    status.innerHTML = `<span class="status-dot"></span>${state.data.meta.locationCount.toLocaleString('es-ES')} localizaciones · ${state.data.meta.routeCount} hiperrutas · ${state.data.meta.crossingCount} cruces`;
    setTimeout(() => { $('#mapHint').style.opacity = '0'; }, 6200);
  } catch (error) {
    console.error(error);
    $('#catalogStatus').textContent = 'No se pudo cargar el catálogo';
    showToast('Error al cargar el mapa.');
  }
}

boot();
